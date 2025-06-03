use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use std::time::{Duration, Instant};
use thiserror::Error;
use crate::metrics::{
    RATE_LIMIT_OPERATIONS,
    RATE_LIMIT_CURRENT_TOKENS,
    RATE_LIMIT_BUCKETS
};

#[derive(Debug, Error)]
pub enum RateLimitError {
    #[error("Rate limit excedido")]
    LimitExceeded,
}

struct TokenBucket {
    capacity: u64,
    tokens: u64,
    refill_rate: f64,
    last_refill: Instant,
}

impl TokenBucket {
    fn new(capacity: u64, refill_rate: f64) -> Self {
        Self {
            capacity,
            tokens: capacity,
            refill_rate,
            last_refill: Instant::now(),
        }
    }

    fn refill(&mut self) {
        let now = Instant::now();
        let elapsed = now.duration_since(self.last_refill).as_secs_f64();
        let new_tokens = (elapsed * self.refill_rate) as u64;
        
        if new_tokens > 0 {
            self.tokens = (self.tokens + new_tokens).min(self.capacity);
            self.last_refill = now;
        }
    }

    fn try_acquire(&mut self, tokens: u64) -> bool {
        self.refill();
        
        if self.tokens >= tokens {
            self.tokens -= tokens;
            true
        } else {
            false
        }
    }
}

pub struct RateLimiter {
    buckets: Arc<RwLock<HashMap<String, TokenBucket>>>,
    default_capacity: u64,
    default_refill_rate: f64,
}

impl RateLimiter {
    pub fn new(default_capacity: u64, default_refill_rate: f64) -> Self {
        Self {
            buckets: Arc::new(RwLock::new(HashMap::new())),
            default_capacity,
            default_refill_rate,
        }
    }

    pub async fn try_acquire(&self, key: &str, tokens: u64) -> Result<(), RateLimitError> {
        let mut buckets = self.buckets.write().await;
        let bucket = buckets.entry(key.to_string()).or_insert_with(|| {
            TokenBucket::new(self.default_capacity, self.default_refill_rate)
        });

        RATE_LIMIT_BUCKETS.set(buckets.len() as i64);

        if bucket.try_acquire(tokens) {
            RATE_LIMIT_OPERATIONS
                .with_label_values(&[key, "success"])
                .inc();
            RATE_LIMIT_CURRENT_TOKENS.set(bucket.tokens as i64);
            Ok(())
        } else {
            RATE_LIMIT_OPERATIONS
                .with_label_values(&[key, "exceeded"])
                .inc();
            RATE_LIMIT_CURRENT_TOKENS.set(bucket.tokens as i64);
            Err(RateLimitError::LimitExceeded)
        }
    }

    pub async fn cleanup(&self, max_age: Duration) {
        let mut buckets = self.buckets.write().await;
        let now = Instant::now();
        buckets.retain(|_, bucket| {
            now.duration_since(bucket.last_refill) < max_age
        });
        RATE_LIMIT_BUCKETS.set(buckets.len() as i64);
    }

    pub async fn start_cleanup_task(self: Arc<Self>, cleanup_interval: Duration, max_age: Duration) {
        tokio::spawn(async move {
            let mut interval = tokio::time::interval(cleanup_interval);
            loop {
                interval.tick().await;
                self.cleanup(max_age).await;
            }
        });
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio::time::sleep;

    #[tokio::test]
    async fn test_rate_limiter_basic() {
        let limiter = RateLimiter::new(10, 1.0);
        
        // Primeira aquisição deve funcionar
        assert!(limiter.try_acquire("test", 5).await.is_ok());
        
        // Segunda aquisição deve falhar (tokens insuficientes)
        assert!(limiter.try_acquire("test", 6).await.is_err());
    }

    #[tokio::test]
    async fn test_rate_limiter_refill() {
        let limiter = RateLimiter::new(10, 10.0); // 10 tokens/segundo
        
        // Usar todos os tokens
        assert!(limiter.try_acquire("test", 10).await.is_ok());
        
        // Esperar refill
        sleep(Duration::from_millis(200)).await;
        
        // Deve ter ~2 tokens disponíveis
        assert!(limiter.try_acquire("test", 2).await.is_ok());
        assert!(limiter.try_acquire("test", 1).await.is_err());
    }

    #[tokio::test]
    async fn test_rate_limiter_cleanup() {
        let limiter = RateLimiter::new(10, 1.0);
        
        // Adicionar alguns buckets
        assert!(limiter.try_acquire("test1", 1).await.is_ok());
        assert!(limiter.try_acquire("test2", 1).await.is_ok());
        
        // Esperar e limpar
        sleep(Duration::from_millis(100)).await;
        limiter.cleanup(Duration::from_millis(50)).await;
        
        let buckets = limiter.buckets.read().await;
        assert!(buckets.is_empty());
    }
} 