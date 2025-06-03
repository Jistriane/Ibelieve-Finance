use actix_web::{
    dev::{forward_ready, Service, ServiceRequest, ServiceResponse, Transform},
    Error, HttpResponse,
};
use futures::future::{ready, LocalBoxFuture, Ready};
use std::sync::Arc;

use crate::circuit_breaker::CircuitBreaker;
use crate::rate_limiter::RateLimiter;
use crate::metrics::HTTP_REQUESTS_TOTAL;

pub struct ResilienceMiddleware {
    rate_limiter: Arc<RateLimiter>,
    circuit_breaker: Arc<CircuitBreaker>,
}

impl ResilienceMiddleware {
    pub fn new(requests_per_second: u32, burst_size: u32) -> Self {
        Self {
            rate_limiter: RateLimiter::new(requests_per_second, burst_size),
            circuit_breaker: CircuitBreaker::new(5, std::time::Duration::from_secs(30)),
        }
    }
}

impl<S, B> Transform<S, ServiceRequest> for ResilienceMiddleware
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type InitError = ();
    type Transform = ResilienceMiddlewareService<S>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(ResilienceMiddlewareService {
            service,
            rate_limiter: self.rate_limiter.clone(),
            circuit_breaker: self.circuit_breaker.clone(),
        }))
    }
}

pub struct ResilienceMiddlewareService<S> {
    service: S,
    rate_limiter: Arc<RateLimiter>,
    circuit_breaker: Arc<CircuitBreaker>,
}

impl<S, B> Service<ServiceRequest> for ResilienceMiddlewareService<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    forward_ready!(service);

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let rate_limiter = self.rate_limiter.clone();
        let circuit_breaker = self.circuit_breaker.clone();
        let service = self.service.clone();
        let path = req.path().to_string();

        Box::pin(async move {
            // Verificar rate limit
            if !rate_limiter.is_allowed(&path).await {
                HTTP_REQUESTS_TOTAL
                    .with_label_values(&[
                        req.method().as_str(),
                        &path,
                        "429",
                    ])
                    .inc();

                return Ok(req.into_response(
                    HttpResponse::TooManyRequests()
                        .body("Taxa de requisições excedida")
                        .into_body(),
                ));
            }

            // Usar circuit breaker
            match circuit_breaker
                .call(|| async {
                    let fut = service.call(req);
                    fut.await
                })
                .await
            {
                Ok(response) => {
                    HTTP_REQUESTS_TOTAL
                        .with_label_values(&[
                            response.request().method().as_str(),
                            &path,
                            response.status().as_str(),
                        ])
                        .inc();
                    Ok(response)
                }
                Err(_) => {
                    HTTP_REQUESTS_TOTAL
                        .with_label_values(&[
                            req.method().as_str(),
                            &path,
                            "503",
                        ])
                        .inc();
                    Ok(req.into_response(
                        HttpResponse::ServiceUnavailable()
                            .body("Serviço temporariamente indisponível")
                            .into_body(),
                    ))
                }
            }
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::{test, web, App, HttpResponse};
    use std::time::Duration;
    use tokio::time::sleep;

    async fn test_handler() -> HttpResponse {
        HttpResponse::Ok().finish()
    }

    #[actix_rt::test]
    async fn test_resilience_middleware() {
        let app = test::init_service(
            App::new()
                .wrap(ResilienceMiddleware::new(2, 3))
                .route("/test", web::get().to(test_handler)),
        )
        .await;

        // Primeira requisição deve ser permitida
        let req = test::TestRequest::get().uri("/test").to_request();
        let resp = test::call_service(&app, req).await;
        assert!(resp.status().is_success());

        // Segunda requisição deve ser permitida
        let req = test::TestRequest::get().uri("/test").to_request();
        let resp = test::call_service(&app, req).await;
        assert!(resp.status().is_success());

        // Terceira requisição (burst) deve ser permitida
        let req = test::TestRequest::get().uri("/test").to_request();
        let resp = test::call_service(&app, req).await;
        assert!(resp.status().is_success());

        // Quarta requisição deve ser bloqueada
        let req = test::TestRequest::get().uri("/test").to_request();
        let resp = test::call_service(&app, req).await;
        assert_eq!(resp.status().as_u16(), 429);

        // Esperar janela de tempo
        sleep(Duration::from_secs(1)).await;

        // Próxima requisição deve ser permitida
        let req = test::TestRequest::get().uri("/test").to_request();
        let resp = test::call_service(&app, req).await;
        assert!(resp.status().is_success());
    }
} 