//! Módulo de cache para sessões e status temporário

use std::collections::HashMap;
use std::sync::{Arc, Mutex};

// Estrutura simples in-memory para MVP
#[derive(Clone)]
pub struct Cache {
    inner: Arc<Mutex<HashMap<String, String>>>,
}

impl Cache {
    pub fn new() -> Self {
        Self {
            inner: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub fn set(&self, key: &str, value: &str) {
        let mut map = self.inner.lock().unwrap();
        map.insert(key.to_string(), value.to_string());
    }

    pub fn get(&self, key: &str) -> Option<String> {
        let map = self.inner.lock().unwrap();
        map.get(key).cloned()
    }
} 