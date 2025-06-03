use std::sync::atomic::{AtomicU64, AtomicUsize, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;
use tokio::time::sleep;

#[derive(Debug)]
pub enum CircuitBreakerState {
    Closed,
    Open,
    HalfOpen,
}

pub struct CircuitBreaker {
    failure_threshold: u64,
    reset_timeout: Duration,
    half_open_timeout: Duration,
    failure_count: AtomicU64,
    last_failure_time: RwLock<Option<Instant>>,
    state: RwLock<CircuitBreakerState>,
}

impl CircuitBreaker {
    pub fn new(failure_threshold: u64, reset_timeout: Duration) -> Arc<Self> {
        Arc::new(Self {
            failure_threshold,
            reset_timeout,
            half_open_timeout: Duration::from_secs(5),
            failure_count: AtomicU64::new(0),
            last_failure_time: RwLock::new(None),
            state: RwLock::new(CircuitBreakerState::Closed),
        })
    }

    pub async fn record_success(&self) {
        self.failure_count.store(0, Ordering::SeqCst);
        *self.state.write().await = CircuitBreakerState::Closed;
    }

    pub async fn record_failure(&self) {
        let failures = self.failure_count.fetch_add(1, Ordering::SeqCst) + 1;
        *self.last_failure_time.write().await = Some(Instant::now());

        if failures >= self.failure_threshold {
            *self.state.write().await = CircuitBreakerState::Open;
        }
    }

    pub async fn is_closed(&self) -> bool {
        match *self.state.read().await {
            CircuitBreakerState::Closed => true,
            CircuitBreakerState::Open => {
                if let Some(last_failure) = *self.last_failure_time.read().await {
                    if last_failure.elapsed() >= self.reset_timeout {
                        *self.state.write().await = CircuitBreakerState::HalfOpen;
                        true
                    } else {
                        false
                    }
                } else {
                    true
                }
            }
            CircuitBreakerState::HalfOpen => true,
        }
    }

    pub async fn call<F, Fut, T, E>(&self, f: F) -> Result<T, E>
    where
        F: FnOnce() -> Fut,
        Fut: std::future::Future<Output = Result<T, E>>,
    {
        if !self.is_closed().await {
            return Err(std::io::Error::new(
                std::io::ErrorKind::Other,
                "Circuit breaker is open",
            )
            .into());
        }

        match f().await {
            Ok(result) => {
                self.record_success().await;
                Ok(result)
            }
            Err(e) => {
                self.record_failure().await;
                Err(e)
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::error::Error;

    #[tokio::test]
    async fn test_circuit_breaker() -> Result<(), Box<dyn Error>> {
        let cb = CircuitBreaker::new(3, Duration::from_secs(1));

        // Teste sucesso
        let result = cb.call(|| async { Ok::<_, Box<dyn Error>>(42) }).await;
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), 42);

        // Teste falhas
        for _ in 0..3 {
            let result = cb
                .call(|| async { Err::<i32, _>("erro".into()) })
                .await;
            assert!(result.is_err());
        }

        // Circuit breaker deve estar aberto
        let result = cb.call(|| async { Ok::<_, Box<dyn Error>>(42) }).await;
        assert!(result.is_err());

        // Esperar reset
        sleep(Duration::from_secs(1)).await;

        // Circuit breaker deve estar meio-aberto
        let result = cb.call(|| async { Ok::<_, Box<dyn Error>>(42) }).await;
        assert!(result.is_ok());

        Ok(())
    }
} 