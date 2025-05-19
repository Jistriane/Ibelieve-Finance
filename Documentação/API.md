# API - Ibelieve Finance

## 1. Visão Geral

Este documento descreve a API REST do Ibelieve Finance, incluindo endpoints, autenticação, formatos de dados e exemplos de uso.

## 2. Autenticação

### 2.1 JWT Token

```typescript
// Exemplo de autenticação
const token = await api.post('/auth/login', {
    email: 'user@example.com',
    password: 'password123'
});

// Uso do token
const headers = {
    'Authorization': `Bearer ${token}`
};
```

### 2.2 Middleware de Autenticação

```typescript
// backend/src/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            throw new Error('Token não fornecido');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Não autorizado' });
    }
};
```

## 3. Endpoints

### 3.1 Provas de Solvência

#### 3.1.1 Gerar Prova

```http
POST /api/proofs
Content-Type: application/json
Authorization: Bearer <token>

{
    "balance": 1000,
    "timestamp": "2024-03-24T12:00:00Z"
}
```

Resposta:
```json
{
    "id": "proof_123",
    "status": "pending",
    "proofHash": "0x123...",
    "createdAt": "2024-03-24T12:00:00Z"
}
```

#### 3.1.2 Verificar Prova

```http
POST /api/proofs/:id/verify
Authorization: Bearer <token>
```

Resposta:
```json
{
    "id": "proof_123",
    "status": "verified",
    "verifiedAt": "2024-03-24T12:01:00Z",
    "blockchainTx": "0x456..."
}
```

#### 3.1.3 Listar Provas

```http
GET /api/proofs
Authorization: Bearer <token>
```

Resposta:
```json
{
    "proofs": [
        {
            "id": "proof_123",
            "status": "verified",
            "balance": 1000,
            "createdAt": "2024-03-24T12:00:00Z",
            "verifiedAt": "2024-03-24T12:01:00Z"
        }
    ],
    "pagination": {
        "total": 1,
        "page": 1,
        "limit": 10
    }
}
```

### 3.2 Usuários

#### 3.2.1 Registrar Usuário

```http
POST /api/users
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
}
```

Resposta:
```json
{
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-03-24T12:00:00Z"
}
```

#### 3.2.2 Login

```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "password123"
}
```

Resposta:
```json
{
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
        "id": "user_123",
        "email": "user@example.com",
        "name": "John Doe"
    }
}
```

### 3.3 Tokens

#### 3.3.1 Verificar Saldo

```http
GET /api/tokens/balance
Authorization: Bearer <token>
```

Resposta:
```json
{
    "balance": "1000.00",
    "symbol": "IBT",
    "lastUpdated": "2024-03-24T12:00:00Z"
}
```

#### 3.3.2 Transferir Tokens

```http
POST /api/tokens/transfer
Content-Type: application/json
Authorization: Bearer <token>

{
    "recipient": "0x123...",
    "amount": "100.00"
}
```

Resposta:
```json
{
    "txHash": "0x789...",
    "status": "pending",
    "amount": "100.00",
    "recipient": "0x123..."
}
```

## 4. WebSocket

### 4.1 Eventos

```typescript
// frontend/src/services/websocket.ts
import { io } from 'socket.io-client';

const socket = io(process.env.REACT_APP_WS_URL);

socket.on('proof:status', (data) => {
    console.log('Status da prova atualizado:', data);
});

socket.on('token:transfer', (data) => {
    console.log('Transferência de token:', data);
});
```

### 4.2 Servidor WebSocket

```typescript
// backend/src/services/websocket.ts
import { Server } from 'socket.io';
import { verifyToken } from '../utils/auth';

export const setupWebSocket = (server: any) => {
    const io = new Server(server);
    
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            const user = await verifyToken(token);
            socket.user = user;
            next();
        } catch (error) {
            next(new Error('Não autorizado'));
        }
    });
    
    io.on('connection', (socket) => {
        console.log('Cliente conectado:', socket.id);
        
        socket.on('disconnect', () => {
            console.log('Cliente desconectado:', socket.id);
        });
    });
    
    return io;
};
```

## 5. Validação

### 5.1 Schemas

```typescript
// backend/src/schemas/proof.schema.ts
import Joi from 'joi';

export const proofSchema = Joi.object({
    balance: Joi.number().min(0).required(),
    timestamp: Joi.date().iso().required()
});

export const verificationSchema = Joi.object({
    proofId: Joi.string().required()
});
```

### 5.2 Middleware de Validação

```typescript
// backend/src/middlewares/validation.ts
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validate = (schema: Joi.Schema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.body);
        
        if (error) {
            return res.status(400).json({
                error: 'Dados inválidos',
                details: error.details
            });
        }
        
        next();
    };
};
```

## 6. Tratamento de Erros

### 6.1 Erros Personalizados

```typescript
// backend/src/utils/errors.ts
export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public details?: any
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export class ValidationError extends AppError {
    constructor(details: any) {
        super(400, 'Erro de validação', details);
        this.name = 'ValidationError';
    }
}

export class AuthenticationError extends AppError {
    constructor() {
        super(401, 'Não autorizado');
        this.name = 'AuthenticationError';
    }
}
```

### 6.2 Middleware de Erro

```typescript
// backend/src/middlewares/error.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export const errorHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    logger.error('Erro:', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method
    });

    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            error: error.message,
            details: error.details
        });
    }

    res.status(500).json({
        error: 'Erro interno do servidor'
    });
};
```

## 7. Rate Limiting

### 7.1 Configuração

```typescript
// backend/src/middlewares/rateLimit.ts
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // limite por IP
    message: 'Muitas requisições, tente novamente mais tarde'
});

export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5, // limite por IP
    message: 'Muitas tentativas de login, tente novamente mais tarde'
});
```

## 8. Documentação

### 8.1 Swagger

```typescript
// backend/src/config/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Ibelieve Finance API',
            version: '1.0.0',
            description: 'API para o sistema Ibelieve Finance'
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Servidor de desenvolvimento'
            }
        ]
    },
    apis: ['./src/routes/*.ts']
};

export const specs = swaggerJsdoc(options);
```

### 8.2 Exemplo de Documentação de Endpoint

```typescript
/**
 * @swagger
 * /api/proofs:
 *   post:
 *     summary: Gera uma nova prova de solvência
 *     tags: [Provas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - balance
 *               - timestamp
 *             properties:
 *               balance:
 *                 type: number
 *                 minimum: 0
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Prova gerada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */
```

## 9. Referências

- [Express.js Documentation](https://expressjs.com)
- [Socket.IO Documentation](https://socket.io/docs)
- [JWT Documentation](https://jwt.io)
- [Swagger Documentation](https://swagger.io/docs)
- [Joi Documentation](https://joi.dev/api) 