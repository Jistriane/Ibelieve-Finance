use std::sync::atomic::{AtomicU64, AtomicBool, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum CircuitBreakerError {
    #[error("Circuit breaker está aberto")]
    Open,
    #[error("Erro na operação: {0}")]
    OperationError(String),
}

pub struct CircuitBreakerMetrics {
    success_count: AtomicU64,
    failure_count: AtomicU64,
    last_failure: RwLock<Option<Instant>>,
}

pub struct CircuitBreaker {
    name: String,
    failure_threshold: u64,
    reset_timeout: Duration,
    half_open_timeout: Duration,
    is_open: AtomicBool,
    metrics: Arc<CircuitBreakerMetrics>,
}

impl CircuitBreaker {
    pub fn new(
        name: String,
        failure_threshold: u64,
        reset_timeout: Duration,
        half_open_timeout: Duration,
    ) -> Self {
        Self {
            name,
            failure_threshold,
            reset_timeout,
            half_open_timeout,
            is_open: AtomicBool::new(false),
            metrics: Arc::new(CircuitBreakerMetrics {
                success_count: AtomicU64::new(0),
                failure_count: AtomicU64::new(0),
                last_failure: RwLock::new(None),
            }),
        }
    }

    pub async fn execute<F, T, E>(&self, operation: F) -> Result<T, CircuitBreakerError>
    where
        F: FnOnce() -> Result<T, E>,
        E: std::fmt::Display,
    {
        if self.is_open.load(Ordering::Relaxed) {
            let last_failure = self.metrics.last_failure.read().await;
            
            if let Some(instant) = *last_failure {
                if instant.elapsed() > self.reset_timeout {
                    self.is_open.store(false, Ordering::Relaxed);
                } else {
                    return Err(CircuitBreakerError::Open);
                }
            }
        }

        match operation() {
            Ok(result) => {
                self.metrics.success_count.fetch_add(1, Ordering::Relaxed);
                if self.metrics.failure_count.load(Ordering::Relaxed) > 0 {
                    self.metrics.failure_count.store(0, Ordering::Relaxed);
                }
                Ok(result)
            }
            Err(e) => {
                let failures = self.metrics.failure_count.fetch_add(1, Ordering::Relaxed) + 1;
                *self.metrics.last_failure.write().await = Some(Instant::now());

                if failures >= self.failure_threshold {
                    self.is_open.store(true, Ordering::Relaxed);
                }

                Err(CircuitBreakerError::OperationError(e.to_string()))
            }
        }
    }

    pub fn get_metrics(&self) -> Arc<CircuitBreakerMetrics> {
        self.metrics.clone()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::Duration;

    #[tokio::test]
    async fn test_circuit_breaker_success() {
        let cb = CircuitBreaker::new(
            "test".to_string(),
            3,
            Duration::from_secs(5),
            Duration::from_secs(1),
        );

        let result = cb.execute(|| Ok::<_, String>("success")).await;
        assert!(result.is_ok());
        assert_eq!(cb.metrics.success_count.load(Ordering::Relaxed), 1);
    }

    #[tokio::test]
    async fn test_circuit_breaker_failure() {
        let cb = CircuitBreaker::new(
            "test".to_string(),
            3,
            Duration::from_secs(5),
            Duration::from_secs(1),
        );

        for _ in 0..3 {
            let result = cb.execute(|| Err::<String, _>("error")).await;
            assert!(result.is_err());
        }

        assert!(cb.is_open.load(Ordering::Relaxed));
        assert_eq!(cb.metrics.failure_count.load(Ordering::Relaxed), 3);
    }
} 