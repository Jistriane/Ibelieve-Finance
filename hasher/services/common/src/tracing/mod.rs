mod middleware;

pub use middleware::TracingMiddleware;

use opentelemetry::{
    global,
    sdk::{
        trace::{self, Sampler},
        Resource,
    },
    KeyValue,
};
use opentelemetry_otlp::WithExportConfig;
use opentelemetry_semantic_conventions::resource::SERVICE_NAME;
use thiserror::Error;
use tracing_subscriber::{
    prelude::*,
    filter::EnvFilter,
    fmt,
    Registry,
};
use tracing_opentelemetry::OpenTelemetryLayer;

#[derive(Debug, Error)]
pub enum TracingError {
    #[error("Erro ao inicializar tracing: {0}")]
    InitError(String),
}

pub struct TracingConfig {
    pub service_name: String,
    pub otlp_endpoint: String,
    pub log_level: String,
    pub sample_ratio: f64,
}

impl Default for TracingConfig {
    fn default() -> Self {
        Self {
            service_name: "ibelieve-finance".to_string(),
            otlp_endpoint: "http://localhost:4317".to_string(),
            log_level: "info".to_string(),
            sample_ratio: 1.0,
        }
    }
}

pub fn init_tracing(config: TracingConfig) -> Result<(), TracingError> {
    // Configurar o tracer OpenTelemetry
    let tracer = opentelemetry_otlp::new_pipeline()
        .tracing()
        .with_exporter(
            opentelemetry_otlp::new_exporter()
                .tonic()
                .with_endpoint(config.otlp_endpoint)
        )
        .with_trace_config(
            trace::config()
                .with_sampler(Sampler::TraceIdRatioBased(config.sample_ratio))
                .with_resource(Resource::new(vec![
                    KeyValue::new(SERVICE_NAME, config.service_name),
                ]))
        )
        .install_batch(opentelemetry::runtime::Tokio)
        .map_err(|e| TracingError::InitError(e.to_string()))?;

    // Criar layer OpenTelemetry
    let telemetry = tracing_opentelemetry::layer().with_tracer(tracer);

    // Configurar filtro de log
    let filter = EnvFilter::try_from_default_env()
        .or_else(|_| EnvFilter::try_new(&config.log_level))
        .map_err(|e| TracingError::InitError(e.to_string()))?;

    // Configurar subscriber com formato JSON
    let fmt_layer = fmt::layer()
        .json()
        .with_file(true)
        .with_line_number(true)
        .with_thread_ids(true)
        .with_thread_names(true)
        .with_target(true);

    // Combinar layers e instalar subscriber global
    Registry::default()
        .with(filter)
        .with(fmt_layer)
        .with(telemetry)
        .try_init()
        .map_err(|e| TracingError::InitError(e.to_string()))?;

    Ok(())
}

pub fn shutdown_tracing() {
    global::shutdown_tracer_provider();
}

#[cfg(test)]
mod tests {
    use super::*;
    use tracing::{info, info_span};

    #[tokio::test]
    async fn test_tracing_init() {
        let config = TracingConfig {
            service_name: "test-service".to_string(),
            otlp_endpoint: "http://localhost:4317".to_string(),
            log_level: "debug".to_string(),
            sample_ratio: 1.0,
        };

        assert!(init_tracing(config).is_ok());

        let span = info_span!("test_operation", service = "test");
        let _guard = span.enter();
        
        info!(message = "Test log message", status = "success");

        shutdown_tracing();
    }
} 