use actix_web::{
    dev::{forward_ready, Service, ServiceRequest, ServiceResponse, Transform},
    Error,
};
use futures::future::LocalBoxFuture;
use std::{
    future::{ready, Ready},
    rc::Rc,
};
use tracing::{Span, info_span};

pub struct TracingMiddleware;

impl<S, B> Transform<S, ServiceRequest> for TracingMiddleware
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Transform = TracingMiddlewareService<S>;
    type InitError = ();
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(TracingMiddlewareService {
            service: Rc::new(service),
        }))
    }
}

pub struct TracingMiddlewareService<S> {
    service: Rc<S>,
}

impl<S, B> Service<ServiceRequest> for TracingMiddlewareService<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    forward_ready!(service);

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let service = self.service.clone();

        // Criar span para a requisição
        let span = info_span!(
            "http_request",
            method = %req.method(),
            path = %req.path(),
            version = ?req.version(),
            remote_addr = %req.connection_info().realip_remote_addr().unwrap_or("unknown"),
        );

        Box::pin(async move {
            let _enter = span.enter();

            // Registrar início da requisição
            let start = std::time::Instant::now();

            // Processar requisição
            let response = service.call(req).await?;

            // Registrar métricas da resposta
            let duration = start.elapsed();
            let status = response.status().as_u16();

            tracing::info!(
                duration_ms = duration.as_millis() as u64,
                status = status,
                "Request completed"
            );

            Ok(response)
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::{test, web, App, HttpResponse};
    use tracing::Level;
    use tracing_subscriber::fmt::format::FmtSpan;

    #[actix_web::test]
    async fn test_tracing_middleware() {
        // Configurar subscriber de teste
        let subscriber = tracing_subscriber::fmt()
            .with_max_level(Level::INFO)
            .with_span_events(FmtSpan::CLOSE)
            .with_test_writer()
            .init();

        // Criar app de teste
        let app = test::init_service(
            App::new()
                .wrap(TracingMiddleware)
                .route("/test", web::get().to(|| async { HttpResponse::Ok().body("test") }))
        ).await;

        // Fazer requisição de teste
        let req = test::TestRequest::get().uri("/test").to_request();
        let resp = test::call_service(&app, req).await;

        assert!(resp.status().is_success());
    }
} 