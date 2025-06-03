use lazy_static::lazy_static;
use prometheus::{
    register_histogram_vec, register_int_counter_vec, Histogram, HistogramVec, IntCounter,
    IntCounterVec, IntGauge, Opts, Registry, HistogramOpts,
};
use std::time::Instant;

lazy_static! {
    pub static ref REGISTRY: Registry = Registry::new();
    
    // Métricas de API
    pub static ref HTTP_REQUESTS_TOTAL: IntCounterVec = register_int_counter_vec!(
        "http_requests_total",
        "Total de requisições HTTP",
        &["method", "endpoint", "status"]
    )
    .unwrap();

    pub static ref HTTP_REQUEST_DURATION_SECONDS: HistogramVec = register_histogram_vec!(
        "http_request_duration_seconds",
        "Duração das requisições HTTP em segundos",
        &["method", "endpoint"],
        vec![0.01, 0.05, 0.1, 0.5, 1.0, 2.0, 5.0]
    )
    .unwrap();

    // Métricas de ZKP
    pub static ref ZKP_GENERATION_TIME: HistogramVec = register_histogram_vec!(
        "zkp_generation_seconds",
        "Tempo de geração de provas ZKP",
        &["proof_type"],
        vec![0.1, 0.5, 1.0, 2.0, 5.0, 10.0]
    )
    .unwrap();

    pub static ref ZKP_VERIFICATION_TIME: Histogram = Histogram::with_opts(
        HistogramOpts::new(
            "zkp_verification_seconds",
            "Tempo de verificação de provas ZKP em segundos"
        )
    ).unwrap();

    // Métricas de Blockchain
    pub static ref BLOCKCHAIN_VERIFICATION_TIME: Histogram = Histogram::with_opts(
        HistogramOpts::new(
            "blockchain_verification_seconds",
            "Tempo de verificação de transações blockchain em segundos"
        )
    ).unwrap();

    // Métricas de IA
    pub static ref AI_ANALYSIS_TIME: HistogramVec = register_histogram_vec!(
        "ai_analysis_seconds",
        "Tempo de análise de IA",
        &["model"],
        vec![0.1, 0.5, 1.0, 2.0, 5.0]
    )
    .unwrap();

    // Métricas de Sistema
    pub static ref ACTIVE_CONNECTIONS: IntGauge = IntGauge::new(
        "active_connections",
        "Número de conexões ativas"
    ).unwrap();

    pub static ref CACHE_OPERATIONS: IntCounterVec = register_int_counter_vec!(
        "cache_operations_total",
        "Total de operações de cache",
        &["operation", "status"]
    )
    .unwrap();

    pub static ref CACHE_HIT_RATIO: IntCounterVec = register_int_counter_vec!(
        "cache_hit_ratio",
        "Taxa de acerto do cache",
        &["operation"]
    )
    .unwrap();

    pub static ref EVENT_OPERATIONS: IntCounterVec = register_int_counter_vec!(
        "event_operations_total",
        "Total de operações de eventos",
        &["event_type", "operation", "status"]
    )
    .unwrap();

    pub static ref EVENT_PROCESSING_TIME: HistogramVec = register_histogram_vec!(
        "event_processing_seconds",
        "Tempo de processamento de eventos",
        &["event_type"],
        vec![0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1.0]
    )
    .unwrap();

    pub static ref EVENT_QUEUE_SIZE: IntCounterVec = register_int_counter_vec!(
        "event_queue_size",
        "Tamanho da fila de eventos",
        &["event_type"]
    )
    .unwrap();

    pub static ref HEALTH_STATUS: IntCounterVec = register_int_counter_vec!(
        "health_status",
        "Status de saúde dos componentes",
        &["service", "component"]
    )
    .unwrap();

    pub static ref HEALTH_CHECK_DURATION_SECONDS: HistogramVec = register_histogram_vec!(
        "health_check_duration_seconds",
        "Tempo de execução dos health checks",
        &["service", "component"],
        vec![0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1.0]
    )
    .unwrap();

    pub static ref HEALTH_CHECK_ERRORS_TOTAL: IntCounterVec = register_int_counter_vec!(
        "health_check_errors_total",
        "Total de erros nos health checks",
        &["service", "component", "error_type"]
    )
    .unwrap();

    pub static ref HEALTH_CHECK_CACHE_OPERATIONS: IntCounterVec = register_int_counter_vec!(
        "health_check_cache_operations_total",
        "Total de operações de cache do health check",
        &["operation", "status"]
    ).unwrap();

    pub static ref HEALTH_CHECK_CACHE_SIZE: IntGauge = IntGauge::new(
        "health_check_cache_size",
        "Número de entradas no cache do health check"
    ).unwrap();

    pub static ref HEALTH_CHECK_RETRY_ATTEMPTS: IntCounterVec = register_int_counter_vec!(
        "health_check_retry_attempts_total",
        "Total de tentativas de retry do health check",
        &["checker", "status"]
    ).unwrap();

    pub static ref CIRCUIT_BREAKER_STATE: IntCounterVec = register_int_counter_vec!(
        "circuit_breaker_state",
        "Estado atual do circuit breaker",
        &["name", "state"]
    ).unwrap();

    pub static ref CIRCUIT_BREAKER_OPERATIONS: IntCounterVec = register_int_counter_vec!(
        "circuit_breaker_operations_total",
        "Total de operações do circuit breaker",
        &["name", "result"]
    ).unwrap();

    pub static ref CIRCUIT_BREAKER_FAILURES: IntCounterVec = register_int_counter_vec!(
        "circuit_breaker_failures_total",
        "Total de falhas do circuit breaker",
        &["name", "type"]
    ).unwrap();

    pub static ref RATE_LIMIT_OPERATIONS: IntCounterVec = register_int_counter_vec!(
        "rate_limit_operations_total",
        "Total de operações do rate limiter",
        &["key", "result"]
    ).unwrap();

    pub static ref RATE_LIMIT_CURRENT_TOKENS: IntGauge = IntGauge::new(
        "rate_limit_current_tokens",
        "Número atual de tokens disponíveis"
    ).unwrap();

    pub static ref RATE_LIMIT_BUCKETS: IntGauge = IntGauge::new(
        "rate_limit_buckets",
        "Número de buckets ativos no rate limiter"
    ).unwrap();
}

pub fn register_metrics() {
    lazy_static::initialize(&HTTP_REQUESTS_TOTAL);
    lazy_static::initialize(&HTTP_REQUEST_DURATION_SECONDS);
    lazy_static::initialize(&ZKP_GENERATION_TIME);
    lazy_static::initialize(&ZKP_VERIFICATION_TIME);
    lazy_static::initialize(&BLOCKCHAIN_VERIFICATION_TIME);
    lazy_static::initialize(&AI_ANALYSIS_TIME);
    lazy_static::initialize(&ACTIVE_CONNECTIONS);
    lazy_static::initialize(&CACHE_OPERATIONS);
    lazy_static::initialize(&CACHE_HIT_RATIO);
    lazy_static::initialize(&EVENT_OPERATIONS);
    lazy_static::initialize(&EVENT_PROCESSING_TIME);
    lazy_static::initialize(&EVENT_QUEUE_SIZE);
    lazy_static::initialize(&HEALTH_STATUS);
    lazy_static::initialize(&HEALTH_CHECK_DURATION_SECONDS);
    lazy_static::initialize(&HEALTH_CHECK_ERRORS_TOTAL);
    lazy_static::initialize(&HEALTH_CHECK_CACHE_OPERATIONS);
    lazy_static::initialize(&HEALTH_CHECK_CACHE_SIZE);
    lazy_static::initialize(&HEALTH_CHECK_RETRY_ATTEMPTS);
    lazy_static::initialize(&CIRCUIT_BREAKER_STATE);
    lazy_static::initialize(&CIRCUIT_BREAKER_OPERATIONS);
    lazy_static::initialize(&CIRCUIT_BREAKER_FAILURES);
    lazy_static::initialize(&RATE_LIMIT_OPERATIONS);
    lazy_static::initialize(&RATE_LIMIT_CURRENT_TOKENS);
    lazy_static::initialize(&RATE_LIMIT_BUCKETS);

    // Registrar todas as métricas
    REGISTRY.register(Box::new(HTTP_REQUESTS_TOTAL.clone())).unwrap();
    REGISTRY.register(Box::new(HTTP_REQUEST_DURATION_SECONDS.clone())).unwrap();
    REGISTRY.register(Box::new(ZKP_GENERATION_TIME.clone())).unwrap();
    REGISTRY.register(Box::new(ZKP_VERIFICATION_TIME.clone())).unwrap();
    REGISTRY.register(Box::new(BLOCKCHAIN_VERIFICATION_TIME.clone())).unwrap();
    REGISTRY.register(Box::new(AI_ANALYSIS_TIME.clone())).unwrap();
    REGISTRY.register(Box::new(ACTIVE_CONNECTIONS.clone())).unwrap();
    REGISTRY.register(Box::new(CACHE_OPERATIONS.clone())).unwrap();
    REGISTRY.register(Box::new(CACHE_HIT_RATIO.clone())).unwrap();
    REGISTRY.register(Box::new(EVENT_OPERATIONS.clone())).unwrap();
    REGISTRY.register(Box::new(EVENT_PROCESSING_TIME.clone())).unwrap();
    REGISTRY.register(Box::new(EVENT_QUEUE_SIZE.clone())).unwrap();
    REGISTRY.register(Box::new(HEALTH_STATUS.clone())).unwrap();
    REGISTRY.register(Box::new(HEALTH_CHECK_DURATION_SECONDS.clone())).unwrap();
    REGISTRY.register(Box::new(HEALTH_CHECK_ERRORS_TOTAL.clone())).unwrap();
    REGISTRY.register(Box::new(HEALTH_CHECK_CACHE_OPERATIONS.clone())).unwrap();
    REGISTRY.register(Box::new(HEALTH_CHECK_CACHE_SIZE.clone())).unwrap();
    REGISTRY.register(Box::new(HEALTH_CHECK_RETRY_ATTEMPTS.clone())).unwrap();
    REGISTRY.register(Box::new(CIRCUIT_BREAKER_STATE.clone())).unwrap();
    REGISTRY.register(Box::new(CIRCUIT_BREAKER_OPERATIONS.clone())).unwrap();
    REGISTRY.register(Box::new(CIRCUIT_BREAKER_FAILURES.clone())).unwrap();
    REGISTRY.register(Box::new(RATE_LIMIT_OPERATIONS.clone())).unwrap();
    REGISTRY.register(Box::new(RATE_LIMIT_CURRENT_TOKENS.clone())).unwrap();
    REGISTRY.register(Box::new(RATE_LIMIT_BUCKETS.clone())).unwrap();
}

pub struct Timer<'a> {
    histogram: &'a HistogramVec,
    labels: Vec<&'a str>,
    start: std::time::Instant,
}

impl<'a> Timer<'a> {
    pub fn new(histogram: &'a HistogramVec, labels: Vec<&'a str>) -> Self {
        Self {
            histogram,
            labels,
            start: std::time::Instant::now(),
        }
    }
}

impl<'a> Drop for Timer<'a> {
    fn drop(&mut self) {
        let duration = self.start.elapsed().as_secs_f64();
        self.histogram.with_label_values(&self.labels).observe(duration);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::thread;
    use std::time::Duration;

    #[test]
    fn test_metrics() {
        register_metrics();

        // Testar contador HTTP
        HTTP_REQUESTS_TOTAL
            .with_label_values(&["POST", "/api/v1/zkp/generate", "200"])
            .inc();

        // Testar timer ZKP
        {
            let _timer = Timer::new(&ZKP_GENERATION_TIME, vec!["zkp"]);
            thread::sleep(Duration::from_millis(100));
        }

        // Verificar se as métricas foram registradas
        let metric_families = REGISTRY.gather();
        assert!(!metric_families.is_empty());
    }
} 