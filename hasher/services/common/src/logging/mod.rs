use serde::Serialize;
use serde_json::json;
use std::collections::HashMap;
use chrono::Utc;
use log::{Level, LevelFilter, Log, Metadata, Record};
use std::sync::Once;

static INIT: Once = Once::new();

#[derive(Debug, Clone, Serialize)]
pub struct LogEntry {
    timestamp: String,
    level: String,
    message: String,
    target: String,
    module_path: Option<String>,
    file: Option<String>,
    line: Option<u32>,
    service: String,
    context: HashMap<String, serde_json::Value>,
}

pub struct StructuredLogger {
    service: String,
}

impl StructuredLogger {
    pub fn new(service: String) -> Self {
        Self { service }
    }

    pub fn init(service: String) {
        INIT.call_once(|| {
            let logger = StructuredLogger::new(service);
            log::set_boxed_logger(Box::new(logger))
                .map(|()| log::set_max_level(LevelFilter::Info))
                .expect("Failed to set logger");
        });
    }
}

impl Log for StructuredLogger {
    fn enabled(&self, metadata: &Metadata) -> bool {
        metadata.level() <= Level::Info
    }

    fn log(&self, record: &Record) {
        if !self.enabled(record.metadata()) {
            return;
        }

        let mut context = HashMap::new();

        // Adicionar informações do span se disponível
        if let Some(span) = record.key_values() {
            for (key, value) in span.iter() {
                context.insert(
                    key.to_string(),
                    json!(value.to_string()),
                );
            }
        }

        let entry = LogEntry {
            timestamp: Utc::now().to_rfc3339(),
            level: record.level().to_string(),
            message: record.args().to_string(),
            target: record.target().to_string(),
            module_path: record.module_path().map(String::from),
            file: record.file().map(String::from),
            line: record.line(),
            service: self.service.clone(),
            context,
        };

        println!("{}", serde_json::to_string(&entry).unwrap());
    }

    fn flush(&self) {}
}

#[macro_export]
macro_rules! log_context {
    ($level:expr, $message:expr, $($key:expr => $value:expr),*) => {
        log::log!(
            target: module_path!(),
            $level,
            message = $message,
            $($key = $value),*
        );
    };
}

#[cfg(test)]
mod tests {
    use super::*;
    use log::Level;

    #[test]
    fn test_structured_logger() {
        StructuredLogger::init("test".to_string());

        log::info!("Test message");
        log_context!(
            Level::Info,
            "Test message with context",
            "user_id" => "123",
            "action" => "test"
        );
    }
} 