import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AUTH_CONFIG } from '../config/auth.config';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Obtém o token do header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: 'Token não fornecido' });
      return;
    }

    // Verifica se o formato do token está correto
    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
      res.status(401).json({ error: 'Token mal formatado' });
      return;
    }

    const [scheme, token] = parts;

    // Verifica se o token começa com Bearer
    if (!/^Bearer$/i.test(scheme)) {
      res.status(401).json({ error: 'Token mal formatado' });
      return;
    }

    // Verifica se o token é válido
    try {
      const decoded = jwt.verify(token, AUTH_CONFIG.JWT_SECRET);
      req.user = decoded as { id: string; role: string };
      next();
    } catch (error) {
      res.status(401).json({ error: 'Token inválido' });
    }
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}; 