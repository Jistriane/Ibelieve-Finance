import dotenv from 'dotenv';

dotenv.config();

export const AUTH_CONFIG = {
  // Configurações do JWT
  JWT: {
    SECRET: process.env.JWT_SECRET || 'sua_chave_secreta_padrao',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
    REFRESH_TOKEN_EXPIRES_IN: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d',
  },

  // Configurações de senha
  PASSWORD: {
    MIN_LENGTH: 8,
    SALT_ROUNDS: 10,
    REQUIRE_LOWERCASE: true,
    REQUIRE_UPPERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SYMBOLS: true,
  },

  // Configurações de sessão
  SESSION: {
    MAX_ATTEMPTS: 5,
    LOCK_TIME: 15 * 60 * 1000, // 15 minutos em milissegundos
  },

  // Configurações de token de acesso
  ACCESS_TOKEN: {
    HEADER_NAME: 'Authorization',
    TYPE: 'Bearer',
  },

  // Configurações de refresh token
  REFRESH_TOKEN: {
    COOKIE_NAME: 'refreshToken',
    COOKIE_OPTIONS: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias em milissegundos
    },
  },

  // Configurações de rate limiting para autenticação
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutos
    MAX_REQUESTS: 100,
  },

  // Configurações de CORS
  CORS: {
    ALLOWED_ORIGINS: (process.env.CORS_ALLOWED_ORIGINS || '').split(','),
    ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    ALLOWED_HEADERS: ['Content-Type', 'Authorization'],
    ALLOW_CREDENTIALS: true,
  },
}; 