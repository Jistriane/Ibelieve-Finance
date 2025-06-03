import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/config';
import { loggerHelper } from '../config/logger';
import { metricsHelper } from '../config/metrics';

// Interface para dados do token
interface ITokenPayload {
  id: string;
  walletAddress: string;
  iat: number;
  exp: number;
}

// Interface para estender Request
interface IAuthRequest extends Request {
  user?: ITokenPayload;
}

// Middleware de autenticação
export const authMiddleware = {
  // Verificar token JWT
  verifyToken(req: IAuthRequest, res: Response, next: NextFunction): void {
    try {
      // Obter token do header
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.status(401).json({
          error: 'unauthorized',
          message: 'Token não fornecido'
        });
        return;
      }

      // Verificar formato do token
      const parts = authHeader.split(' ');
      if (parts.length !== 2) {
        res.status(401).json({
          error: 'unauthorized',
          message: 'Token mal formatado'
        });
        return;
      }

      const [scheme, token] = parts;
      if (!/^Bearer$/i.test(scheme)) {
        res.status(401).json({
          error: 'unauthorized',
          message: 'Token mal formatado'
        });
        return;
      }

      // Verificar token
      jwt.verify(token, config.jwt.secret, (error, decoded) => {
        if (error) {
          loggerHelper.error('Erro ao verificar token', error);
          metricsHelper.recordError('auth', 'Token inválido');

          res.status(401).json({
            error: 'unauthorized',
            message: 'Token inválido'
          });
          return;
        }

        // Adicionar dados do token à requisição
        req.user = decoded as ITokenPayload;
        next();
      });
    } catch (error) {
      loggerHelper.error('Erro no middleware de autenticação', error as Error);
      metricsHelper.recordError('auth', 'Erro no middleware de autenticação');

      res.status(500).json({
        error: 'internal_server_error',
        message: 'Erro ao processar autenticação'
      });
    }
  },

  // Gerar token JWT
  generateToken(payload: {
    id: string;
    walletAddress: string;
  }): string {
    const options: SignOptions = {
      expiresIn: parseInt(config.jwt.expiration, 10)
    };
    return jwt.sign(payload, config.jwt.secret, options);
  },

  // Gerar refresh token
  generateRefreshToken(payload: {
    id: string;
    walletAddress: string;
  }): string {
    const options: SignOptions = {
      expiresIn: parseInt(config.jwt.refreshExpiration, 10)
    };
    return jwt.sign(payload, config.jwt.secret, options);
  },

  // Verificar refresh token
  verifyRefreshToken(token: string): ITokenPayload | null {
    try {
      return jwt.verify(token, config.jwt.secret) as ITokenPayload;
    } catch (error) {
      loggerHelper.error('Erro ao verificar refresh token', error as Error);
      metricsHelper.recordError('auth', 'Refresh token inválido');
      return null;
    }
  }
};

// Estender interface do Express Request
declare global {
  namespace Express {
    interface Request {
      user?: ITokenPayload;
    }
  }
} 