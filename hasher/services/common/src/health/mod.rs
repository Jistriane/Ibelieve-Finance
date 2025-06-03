use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use serde::{Serialize, Deserialize};
use thiserror::Error;
use async_trait::async_trait;
use std::time::{Duration, Instant};
use tokio::time::{interval, sleep};
use crate::metrics::{
    HEALTH_STATUS, 
    HEALTH_CHECK_DURATION_SECONDS, 
    HEALTH_CHECK_ERRORS_TOTAL,
    HEALTH_CHECK_CACHE_OPERATIONS,
    HEALTH_CHECK_CACHE_SIZE,
    HEALTH_CHECK_RETRY_ATTEMPTS,
    Timer,
    CIRCUIT_BREAKER_OPERATIONS,
    CIRCUIT_BREAKER_FAILURES,
};
use crate::resilience::CircuitBreaker;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum HealthStatus {
    #[serde(rename = "up")]
    Up,
    #[serde(rename = "down")]
    Down,
    #[serde(rename = "degraded")]
    Degraded,
}

impl HealthStatus {
    fn to_metric_value(&self) -> u64 {
        match self {
            HealthStatus::Up => 2,
            HealthStatus::Degraded => 1,
            HealthStatus::Down => 0,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthCheck {
    pub name: String,
    pub status: HealthStatus,
    pub details: HashMap<String, String>,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Error)]
pub enum HealthError {
    #[error("Erro ao verificar saúde: {0}")]
    CheckError(String),
    #[error("Timeout ao verificar saúde")]
    Timeout,
}

#[async_trait]
pub trait HealthChecker: Send + Sync {
    async fn check_health(&self) -> Result<HealthCheck, HealthError>;
}

pub struct DatabaseHealthChecker {
    pool: sqlx::PgPool,
    service_name: String,
}

impl DatabaseHealthChecker {
    pub fn new(pool: sqlx::PgPool) -> Self {
        Self {
            pool,
            service_name: "ai".to_string(),
        }
    }
}

#[async_trait]
impl HealthChecker for DatabaseHealthChecker {
    async fn check_health(&self) -> Result<HealthCheck, HealthError> {
        let mut details = HashMap::new();
        let _timer = Timer::new(
            &HEALTH_CHECK_DURATION_SECONDS,
            vec![&self.service_name, "database"],
        );
        
        match sqlx::query("SELECT 1").execute(&self.pool).await {
            Ok(_) => {
                details.insert("message".to_string(), "Conexão com banco de dados OK".to_string());
                let status = HealthStatus::Up;
                
                HEALTH_STATUS
                    .with_label_values(&[&self.service_name, "database"])
                    .inc();

                Ok(HealthCheck {
                    name: "database".to_string(),
                    status,
                    details,
                    timestamp: chrono::Utc::now(),
                })
            }
            Err(e) => {
                details.insert("error".to_string(), e.to_string());
                let status = HealthStatus::Down;

                HEALTH_STATUS
                    .with_label_values(&[&self.service_name, "database"])
                    .inc();

                HEALTH_CHECK_ERRORS_TOTAL
                    .with_label_values(&[&self.service_name, "database", "connection"])
                    .inc();

                Ok(HealthCheck {
                    name: "database".to_string(),
                    status,
                    details,
                    timestamp: chrono::Utc::now(),
                })
            }
        }
    }
}

pub struct OllamaHealthChecker {
    client: reqwest::Client,
    url: String,
    service_name: String,
    circuit_breaker: CircuitBreaker,
}

impl OllamaHealthChecker {
    pub fn new(url: String) -> Self {
        Self {
            client: reqwest::Client::new(),
            url,
            service_name: "ai".to_string(),
            circuit_breaker: CircuitBreaker::new(
                "ollama_health".to_string(),
                3,
                Duration::from_secs(30),
                Duration::from_secs(5),
            ),
        }
    }
}

#[async_trait]
impl HealthChecker for OllamaHealthChecker {
    async fn check_health(&self) -> Result<HealthCheck, HealthError> {
        let mut details = HashMap::new();
        let _timer = Timer::new(
            &HEALTH_CHECK_DURATION_SECONDS,
            vec![&self.service_name, "ollama"],
        );

        match self.circuit_breaker.execute(|| async {
            self.client.get(&self.url).send().await
        }).await {
            Ok(response) => {
                if response.status().is_success() {
                    details.insert("message".to_string(), "Conexão com Ollama OK".to_string());
                    let status = HealthStatus::Up;

                    HEALTH_STATUS
                        .with_label_values(&[&self.service_name, "ollama"])
                        .inc();

                    CIRCUIT_BREAKER_OPERATIONS
                        .with_label_values(&["ollama_health", "success"])
                        .inc();

                    Ok(HealthCheck {
                        name: "ollama".to_string(),
                        status,
                        details,
                        timestamp: chrono::Utc::now(),
                    })
                } else {
                    details.insert("error".to_string(), format!("Status: {}", response.status()));
                    let status = HealthStatus::Degraded;

                    HEALTH_STATUS
                        .with_label_values(&[&self.service_name, "ollama"])
                        .inc();

                    HEALTH_CHECK_ERRORS_TOTAL
                        .with_label_values(&[&self.service_name, "ollama", "status"])
                        .inc();

                    CIRCUIT_BREAKER_FAILURES
                        .with_label_values(&["ollama_health", "status"])
                        .inc();

                    Ok(HealthCheck {
                        name: "ollama".to_string(),
                        status,
                        details,
                        timestamp: chrono::Utc::now(),
                    })
                }
            }
            Err(e) => {
                details.insert("error".to_string(), e.to_string());
                let status = HealthStatus::Down;

                HEALTH_STATUS
                    .with_label_values(&[&self.service_name, "ollama"])
                    .inc();

                HEALTH_CHECK_ERRORS_TOTAL
                    .with_label_values(&[&self.service_name, "ollama", "connection"])
                    .inc();

                CIRCUIT_BREAKER_FAILURES
                    .with_label_values(&["ollama_health", "connection"])
                    .inc();

                Ok(HealthCheck {
                    name: "ollama".to_string(),
                    status,
                    details,
                    timestamp: chrono::Utc::now(),
                })
            }
        }
    }
}

#[derive(Debug, Clone)]
pub struct HealthCheckerConfig {
    pub timeout: Duration,
    pub interval: Duration,
    pub service_name: String,
    pub retry_attempts: u32,
}

impl Default for HealthCheckerConfig {
    fn default() -> Self {
        Self {
            timeout: Duration::from_secs(5),
            interval: Duration::from_secs(30),
            service_name: "default".to_string(),
            retry_attempts: 3,
        }
    }
}

struct CachedHealthCheck {
    check: HealthCheck,
    last_check: Instant,
}

pub struct HealthRegistry {
    checkers: Arc<RwLock<HashMap<String, Box<dyn HealthChecker>>>>,
    cache: Arc<RwLock<HashMap<String, CachedHealthCheck>>>,
    config: HealthCheckerConfig,
}

impl HealthRegistry {
    pub fn new(config: HealthCheckerConfig) -> Self {
        let registry = Self {
            checkers: Arc::new(RwLock::new(HashMap::new())),
            cache: Arc::new(RwLock::new(HashMap::new())),
            config,
        };

        registry.start_cache_cleanup();
        
        registry
    }

    fn start_cache_cleanup(&self) {
        let cache = self.cache.clone();
        let interval_duration = self.config.interval;
        
        tokio::spawn(async move {
            let mut cleanup_interval = interval(interval_duration * 2);
            
            loop {
                cleanup_interval.tick().await;
                let mut cache_lock = cache.write().await;
                let now = Instant::now();
                
                cache_lock.retain(|_, cached| {
                    cached.last_check.elapsed() < interval_duration
                });
                
                HEALTH_CHECK_CACHE_SIZE.set(cache_lock.len() as i64);
            }
        });
    }

    pub async fn register<C>(&self, name: String, checker: C)
    where
        C: HealthChecker + 'static,
    {
        let mut checkers = self.checkers.write().await;
        checkers.insert(name, Box::new(checker));
    }

    pub async fn check_all(&self) -> HashMap<String, Result<HealthCheck, HealthError>> {
        let checkers = self.checkers.read().await;
        let mut results = HashMap::new();
        let mut cache = self.cache.write().await;

        for (name, checker) in checkers.iter() {
            // Verificar cache
            if let Some(cached) = cache.get(name) {
                if cached.last_check.elapsed() < self.config.interval {
                    HEALTH_CHECK_CACHE_OPERATIONS
                        .with_label_values(&["get", "hit"])
                        .inc();
                    results.insert(name.clone(), Ok(cached.check.clone()));
                    continue;
                }
            }

            HEALTH_CHECK_CACHE_OPERATIONS
                .with_label_values(&["get", "miss"])
                .inc();

            // Executar check com retry
            let result = self.execute_with_retry(name, checker).await;
            
            // Atualizar cache se sucesso
            if let Ok(check) = &result {
                cache.insert(name.clone(), CachedHealthCheck {
                    check: check.clone(),
                    last_check: Instant::now(),
                });
                HEALTH_CHECK_CACHE_OPERATIONS
                    .with_label_values(&["set", "success"])
                    .inc();
                HEALTH_CHECK_CACHE_SIZE.set(cache.len() as i64);
            }

            results.insert(name.clone(), result);
        }

        results
    }

    async fn execute_with_retry(&self, name: &str, checker: &Box<dyn HealthChecker>) -> Result<HealthCheck, HealthError> {
        let mut last_error = None;

        for attempt in 0..self.config.retry_attempts {
            HEALTH_CHECK_RETRY_ATTEMPTS
                .with_label_values(&[name, "attempt"])
                .inc();

            match tokio::time::timeout(
                self.config.timeout,
                checker.check_health()
            ).await {
                Ok(result) => match result {
                    Ok(check) => {
                        HEALTH_CHECK_RETRY_ATTEMPTS
                            .with_label_values(&[name, "success"])
                            .inc();
                        return Ok(check);
                    },
                    Err(e) => {
                        log::warn!("Tentativa {} falhou para checker {}: {}", attempt + 1, name, e);
                        HEALTH_CHECK_RETRY_ATTEMPTS
                            .with_label_values(&[name, "error"])
                            .inc();
                        last_error = Some(e);
                    }
                },
                Err(_) => {
                    log::warn!("Timeout na tentativa {} para checker {}", attempt + 1, name);
                    HEALTH_CHECK_RETRY_ATTEMPTS
                        .with_label_values(&[name, "timeout"])
                        .inc();
                    last_error = Some(HealthError::Timeout);
                }
            }
        }

        Err(last_error.unwrap_or_else(|| HealthError::CheckError("Todas as tentativas falharam".into())))
    }

    pub async fn is_healthy(&self) -> bool {
        let results = self.check_all().await;
        results.values().all(|result| {
            matches!(result, Ok(check) if check.status == HealthStatus::Up)
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use mockall::predicate::*;
    use mockall::*;
    use std::time::Duration;
    use tokio::time::sleep;

    mock! {
        TestHealthChecker {}
        #[async_trait]
        impl HealthChecker for TestHealthChecker {
            async fn check_health(&self) -> Result<HealthCheck, HealthError>;
        }
    }

    #[tokio::test]
    async fn test_health_registry_basic() {
        let registry = HealthRegistry::new(HealthCheckerConfig::default());
        let mut checker = MockTestHealthChecker::new();

        checker
            .expect_check_health()
            .returning(|| {
                Ok(HealthCheck {
                    name: "test".to_string(),
                    status: HealthStatus::Up,
                    details: HashMap::new(),
                    timestamp: chrono::Utc::now(),
                })
            });

        registry.register("test".to_string(), checker).await;
        let results = registry.check_all().await;
        
        assert!(results.contains_key("test"));
        assert!(matches!(
            results.get("test"),
            Some(Ok(check)) if check.status == HealthStatus::Up
        ));
    }

    #[tokio::test]
    async fn test_health_registry_cache() {
        let config = HealthCheckerConfig {
            interval: Duration::from_millis(100),
            ..HealthCheckerConfig::default()
        };
        let registry = HealthRegistry::new(config);
        let mut checker = MockTestHealthChecker::new();

        // Primeira chamada
        checker
            .expect_check_health()
            .times(1)
            .returning(|| {
                Ok(HealthCheck {
                    name: "test".to_string(),
                    status: HealthStatus::Up,
                    details: HashMap::new(),
                    timestamp: chrono::Utc::now(),
                })
            });

        registry.register("test".to_string(), checker).await;
        
        // Primeira verificação
        let results1 = registry.check_all().await;
        assert!(matches!(
            results1.get("test"),
            Some(Ok(check)) if check.status == HealthStatus::Up
        ));

        // Segunda verificação (deve usar cache)
        let results2 = registry.check_all().await;
        assert!(matches!(
            results2.get("test"),
            Some(Ok(check)) if check.status == HealthStatus::Up
        ));
    }

    #[tokio::test]
    async fn test_health_registry_retry() {
        let config = HealthCheckerConfig {
            retry_attempts: 3,
            timeout: Duration::from_millis(100),
            ..HealthCheckerConfig::default()
        };
        let registry = HealthRegistry::new(config);
        let mut checker = MockTestHealthChecker::new();

        // Falha nas duas primeiras tentativas, sucesso na terceira
        checker
            .expect_check_health()
            .times(2)
            .returning(|| {
                Err(HealthError::CheckError("Falha temporária".into()))
            });

        checker
            .expect_check_health()
            .times(1)
            .returning(|| {
                Ok(HealthCheck {
                    name: "test".to_string(),
                    status: HealthStatus::Up,
                    details: HashMap::new(),
                    timestamp: chrono::Utc::now(),
                })
            });

        registry.register("test".to_string(), checker).await;
        let results = registry.check_all().await;
        
        assert!(matches!(
            results.get("test"),
            Some(Ok(check)) if check.status == HealthStatus::Up
        ));
    }

    #[tokio::test]
    async fn test_health_registry_timeout() {
        let config = HealthCheckerConfig {
            timeout: Duration::from_millis(50),
            retry_attempts: 1,
            ..HealthCheckerConfig::default()
        };
        let registry = HealthRegistry::new(config);
        let mut checker = MockTestHealthChecker::new();

        checker
            .expect_check_health()
            .returning(|| async {
                sleep(Duration::from_millis(100)).await;
                Ok(HealthCheck {
                    name: "test".to_string(),
                    status: HealthStatus::Up,
                    details: HashMap::new(),
                    timestamp: chrono::Utc::now(),
                })
            });

        registry.register("test".to_string(), checker).await;
        let results = registry.check_all().await;
        
        assert!(matches!(
            results.get("test"),
            Some(Err(HealthError::Timeout))
        ));
    }
} 