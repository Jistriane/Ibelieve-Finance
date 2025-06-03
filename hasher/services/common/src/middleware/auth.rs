use actix_web::{
    dev::{forward_ready, Service, ServiceRequest, ServiceResponse, Transform},
    Error, HttpMessage,
};
use futures::future::{ready, LocalBoxFuture, Ready};
use std::future::Future;
use std::pin::Pin;
use std::task::{Context, Poll};

use crate::auth::Auth;
use crate::metrics::HTTP_REQUESTS_TOTAL;

pub struct AuthMiddleware {
    auth: Auth,
}

impl AuthMiddleware {
    pub fn new(secret: &[u8]) -> Self {
        Self {
            auth: Auth::new(secret),
        }
    }
}

impl<S, B> Transform<S, ServiceRequest> for AuthMiddleware
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type InitError = ();
    type Transform = AuthMiddlewareService<S>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(AuthMiddlewareService {
            service,
            auth: self.auth.clone(),
        }))
    }
}

pub struct AuthMiddlewareService<S> {
    service: S,
    auth: Auth,
}

impl<S, B> Service<ServiceRequest> for AuthMiddlewareService<S>
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
        // Incrementar contador de requisições
        HTTP_REQUESTS_TOTAL
            .with_label_values(&[
                req.method().as_str(),
                req.path(),
                "pending",
            ])
            .inc();

        // Verificar token de autenticação
        if let Some(auth_header) = req.headers().get("Authorization") {
            if let Ok(auth_str) = auth_header.to_str() {
                if auth_str.starts_with("Bearer ") {
                    let token = &auth_str[7..];
                    match self.auth.verify_token(token) {
                        Ok(claims) => {
                            req.extensions_mut().insert(claims);
                            let fut = self.service.call(req);
                            return Box::pin(async move {
                                let res = fut.await?;
                                HTTP_REQUESTS_TOTAL
                                    .with_label_values(&[
                                        res.request().method().as_str(),
                                        res.request().path(),
                                        res.status().as_str(),
                                    ])
                                    .inc();
                                Ok(res)
                            });
                        }
                        Err(_) => {
                            HTTP_REQUESTS_TOTAL
                                .with_label_values(&[
                                    req.method().as_str(),
                                    req.path(),
                                    "401",
                                ])
                                .inc();
                            return Box::pin(ready(Err(actix_web::error::ErrorUnauthorized("Token inválido"))));
                        }
                    }
                }
            }
        }

        HTTP_REQUESTS_TOTAL
            .with_label_values(&[
                req.method().as_str(),
                req.path(),
                "401",
            ])
            .inc();
        Box::pin(ready(Err(actix_web::error::ErrorUnauthorized("Token não fornecido"))))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::{test, web, App, HttpResponse};
    use uuid::Uuid;

    async fn test_handler() -> HttpResponse {
        HttpResponse::Ok().finish()
    }

    #[actix_rt::test]
    async fn test_auth_middleware() {
        let auth = Auth::new(b"test_secret");
        let token = auth.generate_token(Uuid::new_v4(), "test").unwrap();

        let app = test::init_service(
            App::new()
                .wrap(AuthMiddleware::new(b"test_secret"))
                .route("/test", web::get().to(test_handler)),
        )
        .await;

        let req = test::TestRequest::get()
            .uri("/test")
            .header("Authorization", format!("Bearer {}", token))
            .to_request();

        let resp = test::call_service(&app, req).await;
        assert!(resp.status().is_success());
    }
} 