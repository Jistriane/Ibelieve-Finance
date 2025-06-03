use std::any::Any;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::broadcast;
use tokio::sync::RwLock;
use serde::{Serialize, Deserialize};
use thiserror::Error;
use async_trait::async_trait;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Event {
    pub id: String,
    pub event_type: String,
    pub payload: serde_json::Value,
    pub timestamp: DateTime<Utc>,
    pub metadata: HashMap<String, String>,
}

#[derive(Debug, Error)]
pub enum EventError {
    #[error("Erro ao publicar evento: {0}")]
    PublishError(String),
    #[error("Erro ao processar evento: {0}")]
    ProcessingError(String),
    #[error("Erro de serialização: {0}")]
    SerializationError(String),
}

#[derive(Debug, Clone)]
pub struct EventConfig {
    pub channel_size: usize,
    pub max_retries: u32,
    pub retry_delay: std::time::Duration,
}

impl Default for EventConfig {
    fn default() -> Self {
        Self {
            channel_size: 1000,
            max_retries: 3,
            retry_delay: std::time::Duration::from_secs(1),
        }
    }
}

#[async_trait]
pub trait EventHandler: Send + Sync {
    async fn handle(&self, event: Event) -> Result<(), EventError>;
}

pub struct MemoryEventBus {
    config: EventConfig,
    handlers: Arc<RwLock<HashMap<String, Vec<Box<dyn EventHandler>>>>>,
    tx: broadcast::Sender<Event>,
}

impl MemoryEventBus {
    pub fn new(config: EventConfig) -> Self {
        let (tx, _) = broadcast::channel(config.channel_size);
        Self {
            config,
            handlers: Arc::new(RwLock::new(HashMap::new())),
            tx,
        }
    }

    pub async fn publish(&self, event: Event) -> Result<(), EventError> {
        // Enviar evento para todos os subscribers
        if let Err(e) = self.tx.send(event.clone()) {
            return Err(EventError::PublishError(e.to_string()));
        }

        // Processar com handlers registrados
        let handlers = self.handlers.read().await;
        if let Some(event_handlers) = handlers.get(&event.event_type) {
            for handler in event_handlers {
                if let Err(e) = handler.handle(event.clone()).await {
                    log::error!("Erro ao processar evento: {}", e);
                    // Continua processando outros handlers mesmo com erro
                }
            }
        }

        Ok(())
    }

    pub async fn subscribe<H>(&self, event_type: String, handler: H) -> Result<(), EventError>
    where
        H: EventHandler + 'static,
    {
        let mut handlers = self.handlers.write().await;
        handlers
            .entry(event_type)
            .or_insert_with(Vec::new)
            .push(Box::new(handler));
        Ok(())
    }

    pub async fn subscribe_with_channel(&self) -> broadcast::Receiver<Event> {
        self.tx.subscribe()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicU32, Ordering};
    use tokio::time::sleep;

    struct TestHandler {
        counter: Arc<AtomicU32>,
    }

    #[async_trait]
    impl EventHandler for TestHandler {
        async fn handle(&self, _event: Event) -> Result<(), EventError> {
            self.counter.fetch_add(1, Ordering::SeqCst);
            Ok(())
        }
    }

    #[tokio::test]
    async fn test_publish_subscribe() {
        let bus = MemoryEventBus::new(EventConfig::default());
        let counter = Arc::new(AtomicU32::new(0));
        
        // Registrar handler
        let handler = TestHandler {
            counter: counter.clone(),
        };
        bus.subscribe("test_event".to_string(), handler).await.unwrap();

        // Publicar evento
        let event = Event {
            id: "1".to_string(),
            event_type: "test_event".to_string(),
            payload: serde_json::json!({"test": "data"}),
            timestamp: Utc::now(),
            metadata: HashMap::new(),
        };
        bus.publish(event).await.unwrap();

        // Verificar se o handler foi chamado
        sleep(std::time::Duration::from_millis(100)).await;
        assert_eq!(counter.load(Ordering::SeqCst), 1);
    }

    #[tokio::test]
    async fn test_multiple_handlers() {
        let bus = MemoryEventBus::new(EventConfig::default());
        let counter1 = Arc::new(AtomicU32::new(0));
        let counter2 = Arc::new(AtomicU32::new(0));

        // Registrar handlers
        let handler1 = TestHandler {
            counter: counter1.clone(),
        };
        let handler2 = TestHandler {
            counter: counter2.clone(),
        };
        bus.subscribe("test_event".to_string(), handler1).await.unwrap();
        bus.subscribe("test_event".to_string(), handler2).await.unwrap();

        // Publicar evento
        let event = Event {
            id: "1".to_string(),
            event_type: "test_event".to_string(),
            payload: serde_json::json!({"test": "data"}),
            timestamp: Utc::now(),
            metadata: HashMap::new(),
        };
        bus.publish(event).await.unwrap();

        // Verificar se ambos os handlers foram chamados
        sleep(std::time::Duration::from_millis(100)).await;
        assert_eq!(counter1.load(Ordering::SeqCst), 1);
        assert_eq!(counter2.load(Ordering::SeqCst), 1);
    }
} 