use thiserror::Error;

#[derive(Error, Debug)]
pub enum CommonError {
    #[error("Erro de validação: {0}")]
    ValidationError(String),

    #[error("Erro de banco de dados: {0}")]
    DatabaseError(String),

    #[error("Erro de blockchain: {0}")]
    BlockchainError(String),

    #[error("Erro de ZKP: {0}")]
    ZkpError(String),

    #[error("Erro de autenticação: {0}")]
    AuthenticationError(String),

    #[error("Erro de autorização: {0}")]
    AuthorizationError(String),

    #[error("Recurso não encontrado: {0}")]
    NotFoundError(String),

    #[error("Erro interno do servidor: {0}")]
    InternalServerError(String),

    #[error("Erro de serviço externo: {0}")]
    ExternalServiceError(String),

    #[error("Erro de configuração: {0}")]
    ConfigurationError(String),
}

impl CommonError {
    pub fn error_type(&self) -> &'static str {
        match self {
            CommonError::ValidationError(_) => "validation_error",
            CommonError::DatabaseError(_) => "database_error",
            CommonError::BlockchainError(_) => "blockchain_error",
            CommonError::ZkpError(_) => "zkp_error",
            CommonError::AuthenticationError(_) => "authentication_error",
            CommonError::AuthorizationError(_) => "authorization_error",
            CommonError::NotFoundError(_) => "not_found_error",
            CommonError::InternalServerError(_) => "internal_server_error",
            CommonError::ExternalServiceError(_) => "external_service_error",
            CommonError::ConfigurationError(_) => "configuration_error",
        }
    }

    pub fn status_code(&self) -> u16 {
        match self {
            CommonError::ValidationError(_) => 400,
            CommonError::DatabaseError(_) => 500,
            CommonError::BlockchainError(_) => 500,
            CommonError::ZkpError(_) => 500,
            CommonError::AuthenticationError(_) => 401,
            CommonError::AuthorizationError(_) => 403,
            CommonError::NotFoundError(_) => 404,
            CommonError::InternalServerError(_) => 500,
            CommonError::ExternalServiceError(_) => 502,
            CommonError::ConfigurationError(_) => 500,
        }
    }
} 