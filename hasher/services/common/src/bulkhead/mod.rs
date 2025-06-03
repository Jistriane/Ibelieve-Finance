use std::future::Future;
use tokio::sync::{Semaphore, SemaphorePermit};
use std::sync::Arc;
use std::time::Duration;
use tokio::time::timeout;

#[derive(Debug)]
pub struct Bulkhead {
    semaphore: Arc<Semaphore>,
    timeout: Duration,
}

impl Bulkhead {
    pub fn new(max_concurrent: usize, timeout_ms: u64) -> Self {
        Self {
            semaphore: Arc::new(Semaphore::new(max_concurrent)),
            timeout: Duration::from_millis(timeout_ms),
        }
    }

    pub async fn acquire(&self) -> Result<SemaphorePermit<'_>, BulkheadError> {
        match timeout(self.timeout, self.semaphore.acquire()).await {
            Ok(Ok(permit)) => Ok(permit),
            Ok(Err(_)) => Err(BulkheadError::Exhausted),
            Err(_) => Err(BulkheadError::Timeout),
        }
    }

    pub async fn execute<F, Fut, T, E>(&self, operation: F) -> Result<T, BulkheadError>
    where
        F: FnOnce() -> Fut,
        Fut: Future<Output = Result<T, E>>,
        E: Into<BulkheadError>,
    {
        let _permit = self.acquire().await?;
        
        match timeout(self.timeout, operation()).await {
            Ok(Ok(result)) => Ok(result),
            Ok(Err(err)) => Err(err.into()),
            Err(_) => Err(BulkheadError::Timeout),
        }
    }

    pub fn available_permits(&self) -> usize {
        self.semaphore.available_permits()
    }
}

#[derive(Debug, thiserror::Error)]
pub enum BulkheadError {
    #[error("Bulkhead está exausto")]
    Exhausted,
    #[error("Operação excedeu o timeout")]
    Timeout,
    #[error("Erro na operação: {0}")]
    Operation(String),
}

impl<E: std::error::Error> From<E> for BulkheadError {
    fn from(err: E) -> Self {
        BulkheadError::Operation(err.to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicUsize, Ordering};
    use tokio::time::sleep;

    #[tokio::test]
    async fn test_bulkhead_concurrent_limit() {
        let bulkhead = Bulkhead::new(2, 1000);
        let counter = Arc::new(AtomicUsize::new(0));
        let mut handles = vec![];

        // Tentar executar 3 operações concorrentes com limite de 2
        for _ in 0..3 {
            let bulkhead = bulkhead.clone();
            let counter = counter.clone();
            let handle = tokio::spawn(async move {
                let result = bulkhead
                    .execute(|| async {
                        counter.fetch_add(1, Ordering::SeqCst);
                        sleep(Duration::from_millis(100)).await;
                        counter.fetch_sub(1, Ordering::SeqCst);
                        Ok::<_, BulkheadError>(())
                    })
                    .await;
                result
            });
            handles.push(handle);
        }

        // Aguardar todas as operações
        let results = futures::future::join_all(handles).await;
        
        // Verificar que uma operação falhou
        let success_count = results
            .iter()
            .filter(|r| r.as_ref().unwrap().is_ok())
            .count();
        assert_eq!(success_count, 2);

        // Verificar que o contador voltou a zero
        assert_eq!(counter.load(Ordering::SeqCst), 0);
    }

    #[tokio::test]
    async fn test_bulkhead_timeout() {
        let bulkhead = Bulkhead::new(1, 50);

        let result = bulkhead
            .execute(|| async {
                sleep(Duration::from_millis(100)).await;
                Ok::<_, BulkheadError>(())
            })
            .await;

        assert!(matches!(result, Err(BulkheadError::Timeout)));
    }

    #[tokio::test]
    async fn test_bulkhead_operation_error() {
        let bulkhead = Bulkhead::new(1, 1000);

        let result = bulkhead
            .execute(|| async {
                Err::<(), _>(std::io::Error::new(
                    std::io::ErrorKind::Other,
                    "erro na operação",
                ))
            })
            .await;

        assert!(matches!(result, Err(BulkheadError::Operation(_))));
    }
} 