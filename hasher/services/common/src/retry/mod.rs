use std::future::Future;
use std::time::Duration;
use tokio::time::sleep;
use std::error::Error;

#[derive(Debug, Clone)]
pub struct RetryConfig {
    pub max_attempts: u32,
    pub initial_delay: Duration,
    pub max_delay: Duration,
    pub multiplier: f64,
}

impl Default for RetryConfig {
    fn default() -> Self {
        Self {
            max_attempts: 3,
            initial_delay: Duration::from_millis(100),
            max_delay: Duration::from_secs(5),
            multiplier: 2.0,
        }
    }
}

pub async fn retry<F, Fut, T, E>(
    operation: F,
    config: RetryConfig,
    should_retry: impl Fn(&E) -> bool,
) -> Result<T, E>
where
    F: Fn() -> Fut,
    Fut: Future<Output = Result<T, E>>,
    E: Error,
{
    let mut current_delay = config.initial_delay;
    let mut attempt = 0;

    loop {
        match operation().await {
            Ok(value) => return Ok(value),
            Err(err) => {
                attempt += 1;
                if attempt >= config.max_attempts || !should_retry(&err) {
                    return Err(err);
                }

                sleep(current_delay).await;

                // Exponential backoff com jitter
                let jitter = rand::random::<f64>() * 0.1;
                current_delay = Duration::from_secs_f64(
                    (current_delay.as_secs_f64() * config.multiplier * (1.0 + jitter))
                        .min(config.max_delay.as_secs_f64()),
                );
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicU32, Ordering};
    use std::sync::Arc;

    #[tokio::test]
    async fn test_retry_success() {
        let attempts = Arc::new(AtomicU32::new(0));
        let attempts_clone = attempts.clone();

        let operation = || async move {
            let current = attempts_clone.fetch_add(1, Ordering::SeqCst);
            if current < 2 {
                Err("erro temporário".into())
            } else {
                Ok(42)
            }
        };

        let config = RetryConfig {
            max_attempts: 3,
            initial_delay: Duration::from_millis(10),
            max_delay: Duration::from_millis(100),
            multiplier: 2.0,
        };

        let result = retry(operation, config, |_| true).await;
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), 42);
        assert_eq!(attempts.load(Ordering::SeqCst), 3);
    }

    #[tokio::test]
    async fn test_retry_failure() {
        let attempts = Arc::new(AtomicU32::new(0));
        let attempts_clone = attempts.clone();

        let operation = || async move {
            attempts_clone.fetch_add(1, Ordering::SeqCst);
            Err("erro permanente".into())
        };

        let config = RetryConfig {
            max_attempts: 3,
            initial_delay: Duration::from_millis(10),
            max_delay: Duration::from_millis(100),
            multiplier: 2.0,
        };

        let result: Result<i32, &str> = retry(operation, config, |_| true).await;
        assert!(result.is_err());
        assert_eq!(attempts.load(Ordering::SeqCst), 3);
    }

    #[tokio::test]
    async fn test_retry_condition() {
        let attempts = Arc::new(AtomicU32::new(0));
        let attempts_clone = attempts.clone();

        let operation = || async move {
            attempts_clone.fetch_add(1, Ordering::SeqCst);
            Err("erro não retratável".into())
        };

        let config = RetryConfig {
            max_attempts: 3,
            initial_delay: Duration::from_millis(10),
            max_delay: Duration::from_millis(100),
            multiplier: 2.0,
        };

        let result: Result<i32, &str> = retry(operation, config, |e| e == "erro temporário").await;
        assert!(result.is_err());
        assert_eq!(attempts.load(Ordering::SeqCst), 1);
    }
} 