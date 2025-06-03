use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;

#[derive(Debug)]
pub struct RateLimiter {
    requests_per_second: u32,
    burst_size: u32,
    window_size: Duration,
    requests: RwLock<HashMap<String, Vec<Instant>>>,
}

impl RateLimiter {
    pub fn new(requests_per_second: u32, burst_size: u32) -> Arc<Self> {
        Arc::new(Self {
            requests_per_second,
            burst_size,
            window_size: Duration::from_secs(1),
            requests: RwLock::new(HashMap::new()),
        })
    }

    pub async fn is_allowed(&self, key: &str) -> bool {
        let now = Instant::now();
        let mut requests = self.requests.write().await;

        // Limpar requisições antigas
        if let Some(timestamps) = requests.get_mut(key) {
            timestamps.retain(|&ts| now.duration_since(ts) < self.window_size);
        }

        // Verificar limite de burst
        let timestamps = requests.entry(key.to_string()).or_insert_with(Vec::new);
        if timestamps.len() >= self.burst_size as usize {
            return false;
        }

        // Verificar taxa por segundo
        let recent_requests = timestamps
            .iter()
            .filter(|&&ts| now.duration_since(ts) < self.window_size)
            .count();

        if recent_requests >= self.requests_per_second as usize {
            return false;
        }

        // Registrar nova requisição
        timestamps.push(now);
        true
    }

    pub async fn clean_old_entries(&self) {
        let now = Instant::now();
        let mut requests = self.requests.write().await;
        requests.retain(|_, timestamps| {
            timestamps.retain(|&ts| now.duration_since(ts) < self.window_size);
            !timestamps.is_empty()
        });
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio::time::sleep;

    #[tokio::test]
    async fn test_rate_limiter() {
        let limiter = RateLimiter::new(2, 3);
        let key = "test_key";

        // Primeira requisição deve ser permitida
        assert!(limiter.is_allowed(key).await);

        // Segunda requisição deve ser permitida
        assert!(limiter.is_allowed(key).await);

        // Terceira requisição (burst) deve ser permitida
        assert!(limiter.is_allowed(key).await);

        // Quarta requisição deve ser bloqueada
        assert!(!limiter.is_allowed(key).await);

        // Esperar janela de tempo
        sleep(Duration::from_secs(1)).await;

        // Próxima requisição deve ser permitida
        assert!(limiter.is_allowed(key).await);
    }

    #[tokio::test]
    async fn test_clean_old_entries() {
        let limiter = RateLimiter::new(2, 3);
        let key = "test_key";

        // Fazer algumas requisições
        assert!(limiter.is_allowed(key).await);
        assert!(limiter.is_allowed(key).await);

        // Esperar janela de tempo
        sleep(Duration::from_secs(1)).await;

        // Limpar entradas antigas
        limiter.clean_old_entries().await;

        // Verificar se as entradas foram limpas
        let requests = limiter.requests.read().await;
        assert!(requests.get(key).unwrap().is_empty());
    }
} 