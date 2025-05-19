# Backend - Ibelieve Finance

## 1. Visão Geral

Este documento descreve a implementação do backend do Ibelieve Finance, incluindo estrutura, serviços, integrações e configurações.

## 2. Estrutura do Projeto

```
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── app.ts
├── tests/
├── package.json
└── tsconfig.json
```

## 3. Tecnologias Principais

- Node.js
- Express
- TypeScript
- PostgreSQL
- Redis
- Web3.js
- Socket.IO
- Jest

## 4. Configuração

### 4.1 Variáveis de Ambiente

```typescript
// src/config/env.ts
import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    database: {
        url: process.env.DATABASE_URL
    },
    redis: {
        url: process.env.REDIS_URL
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN
    },
    blockchain: {
        rpcUrl: process.env.BLOCKCHAIN_RPC_URL,
        contractAddress: process.env.CONTRACT_ADDRESS
    }
};
```

### 4.2 Conexão com Banco de Dados

```typescript
// src/config/database.ts
import { Pool } from 'pg';
import { config } from './env';

export const pool = new Pool({
    connectionString: config.database.url,
    ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
    console.error('Erro inesperado no pool de conexões:', err);
});
```

## 5. Modelos

### 5.1 Prova de Solvência

```typescript
// src/models/Proof.ts
import { pool } from '../config/database';

export interface Proof {
    id: string;
    userId: string;
    balance: number;
    timestamp: Date;
    proofHash: string;
    status: 'pending' | 'verified' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
}

export class ProofModel {
    static async create(data: Omit<Proof, 'id' | 'createdAt' | 'updatedAt'>) {
        const { rows } = await pool.query(
            `INSERT INTO proofs (user_id, balance, timestamp, proof_hash, status)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [data.userId, data.balance, data.timestamp, data.proofHash, data.status]
        );
        return rows[0];
    }

    static async findById(id: string) {
        const { rows } = await pool.query(
            'SELECT * FROM proofs WHERE id = $1',
            [id]
        );
        return rows[0];
    }

    static async updateStatus(id: string, status: Proof['status']) {
        const { rows } = await pool.query(
            `UPDATE proofs
             SET status = $1, updated_at = NOW()
             WHERE id = $2
             RETURNING *`,
            [status, id]
        );
        return rows[0];
    }
}
```

### 5.2 Usuário

```typescript
// src/models/User.ts
import { pool } from '../config/database';
import bcrypt from 'bcrypt';

export interface User {
    id: string;
    email: string;
    password: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export class UserModel {
    static async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        
        const { rows } = await pool.query(
            `INSERT INTO users (email, password, name)
             VALUES ($1, $2, $3)
             RETURNING id, email, name, created_at, updated_at`,
            [data.email, hashedPassword, data.name]
        );
        return rows[0];
    }

    static async findByEmail(email: string) {
        const { rows } = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        return rows[0];
    }

    static async validatePassword(user: User, password: string) {
        return bcrypt.compare(password, user.password);
    }
}
```

## 6. Controladores

### 6.1 Prova de Solvência

```typescript
// src/controllers/ProofController.ts
import { Request, Response } from 'express';
import { ProofModel } from '../models/Proof';
import { ProofService } from '../services/ProofService';
import { AppError } from '../utils/errors';

export class ProofController {
    static async generate(req: Request, res: Response) {
        try {
            const { balance, timestamp } = req.body;
            const userId = req.user.id;

            const proof = await ProofService.generateProof({
                userId,
                balance,
                timestamp
            });

            res.status(201).json(proof);
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({
                    error: error.message
                });
            } else {
                res.status(500).json({
                    error: 'Erro interno do servidor'
                });
            }
        }
    }

    static async verify(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const proof = await ProofService.verifyProof(id, userId);

            res.json(proof);
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({
                    error: error.message
                });
            } else {
                res.status(500).json({
                    error: 'Erro interno do servidor'
                });
            }
        }
    }
}
```

### 6.2 Autenticação

```typescript
// src/controllers/AuthController.ts
import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { generateToken } from '../utils/auth';
import { AppError } from '../utils/errors';

export class AuthController {
    static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            const user = await UserModel.findByEmail(email);
            if (!user) {
                throw new AppError(401, 'Credenciais inválidas');
            }

            const isValidPassword = await UserModel.validatePassword(
                user,
                password
            );
            if (!isValidPassword) {
                throw new AppError(401, 'Credenciais inválidas');
            }

            const token = generateToken(user);

            res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name
                }
            });
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({
                    error: error.message
                });
            } else {
                res.status(500).json({
                    error: 'Erro interno do servidor'
                });
            }
        }
    }
}
```

## 7. Serviços

### 7.1 Serviço de Prova

```typescript
// src/services/ProofService.ts
import { ProofModel } from '../models/Proof';
import { BlockchainService } from './BlockchainService';
import { AppError } from '../utils/errors';
import { generateProofHash } from '../utils/proof';

export class ProofService {
    static async generateProof(data: {
        userId: string;
        balance: number;
        timestamp: Date;
    }) {
        const proofHash = await generateProofHash(data);

        const proof = await ProofModel.create({
            ...data,
            proofHash,
            status: 'pending'
        });

        await BlockchainService.submitProof(proof);

        return proof;
    }

    static async verifyProof(id: string, userId: string) {
        const proof = await ProofModel.findById(id);
        if (!proof) {
            throw new AppError(404, 'Prova não encontrada');
        }

        if (proof.userId !== userId) {
            throw new AppError(403, 'Não autorizado');
        }

        const isVerified = await BlockchainService.verifyProof(proof);
        if (!isVerified) {
            throw new AppError(400, 'Prova inválida');
        }

        return ProofModel.updateStatus(id, 'verified');
    }
}
```

### 7.2 Serviço Blockchain

```typescript
// src/services/BlockchainService.ts
import Web3 from 'web3';
import { config } from '../config/env';
import { SolvencyVerifier } from '../contracts';

export class BlockchainService {
    private static web3 = new Web3(config.blockchain.rpcUrl);
    private static contract = new this.web3.eth.Contract(
        SolvencyVerifier.abi,
        config.blockchain.contractAddress
    );

    static async submitProof(proof: any) {
        try {
            const accounts = await this.web3.eth.getAccounts();
            const tx = await this.contract.methods
                .submitProof(
                    proof.proofHash,
                    proof.balance,
                    proof.timestamp
                )
                .send({ from: accounts[0] });

            return tx.transactionHash;
        } catch (error) {
            console.error('Erro ao enviar prova para blockchain:', error);
            throw error;
        }
    }

    static async verifyProof(proof: any) {
        try {
            const result = await this.contract.methods
                .verifyProof(
                    proof.proofHash,
                    proof.balance,
                    proof.timestamp
                )
                .call();

            return result;
        } catch (error) {
            console.error('Erro ao verificar prova:', error);
            return false;
        }
    }
}
```

## 8. Middlewares

### 8.1 Autenticação

```typescript
// src/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AppError } from '../utils/errors';

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            throw new AppError(401, 'Token não fornecido');
        }

        const decoded = jwt.verify(token, config.jwt.secret) as any;
        req.user = decoded;
        next();
    } catch (error) {
        next(new AppError(401, 'Não autorizado'));
    }
};
```

### 8.2 Validação

```typescript
// src/middlewares/validation.ts
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from '../utils/errors';

export const validate = (schema: Joi.Schema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.body);
        
        if (error) {
            next(new AppError(400, 'Dados inválidos', error.details));
        } else {
            next();
        }
    };
};
```

## 9. Rotas

### 9.1 Provas

```typescript
// src/routes/proofs.ts
import { Router } from 'express';
import { ProofController } from '../controllers/ProofController';
import { authMiddleware } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { proofSchema } from '../schemas/proof.schema';

const router = Router();

router.post(
    '/',
    authMiddleware,
    validate(proofSchema),
    ProofController.generate
);

router.post(
    '/:id/verify',
    authMiddleware,
    ProofController.verify
);

export default router;
```

### 9.2 Autenticação

```typescript
// src/routes/auth.ts
import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validate } from '../middlewares/validation';
import { authSchema } from '../schemas/auth.schema';

const router = Router();

router.post(
    '/login',
    validate(authSchema),
    AuthController.login
);

export default router;
```

## 10. WebSocket

### 10.1 Configuração

```typescript
// src/services/WebSocketService.ts
import { Server } from 'socket.io';
import { verifyToken } from '../utils/auth';

export class WebSocketService {
    private io: Server;

    constructor(server: any) {
        this.io = new Server(server);
        this.setupMiddleware();
        this.setupEventHandlers();
    }

    private setupMiddleware() {
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token;
                const user = await verifyToken(token);
                socket.user = user;
                next();
            } catch (error) {
                next(new Error('Não autorizado'));
            }
        });
    }

    private setupEventHandlers() {
        this.io.on('connection', (socket) => {
            console.log('Cliente conectado:', socket.id);

            socket.on('disconnect', () => {
                console.log('Cliente desconectado:', socket.id);
            });
        });
    }

    public emitProofUpdate(proof: any) {
        this.io.emit('proof:update', proof);
    }
}
```

## 11. Testes

### 11.1 Teste de Serviço

```typescript
// tests/services/ProofService.test.ts
import { ProofService } from '../../src/services/ProofService';
import { ProofModel } from '../../src/models/Proof';
import { BlockchainService } from '../../src/services/BlockchainService';

jest.mock('../../src/models/Proof');
jest.mock('../../src/services/BlockchainService');

describe('ProofService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve gerar prova com sucesso', async () => {
        const mockProof = {
            id: '1',
            userId: 'user1',
            balance: 1000,
            timestamp: new Date(),
            proofHash: 'hash123',
            status: 'pending'
        };

        (ProofModel.create as jest.Mock).mockResolvedValue(mockProof);
        (BlockchainService.submitProof as jest.Mock).mockResolvedValue('tx123');

        const result = await ProofService.generateProof({
            userId: 'user1',
            balance: 1000,
            timestamp: new Date()
        });

        expect(result).toEqual(mockProof);
        expect(BlockchainService.submitProof).toHaveBeenCalledWith(mockProof);
    });
});
```

### 11.2 Teste de Controlador

```typescript
// tests/controllers/ProofController.test.ts
import { Request, Response } from 'express';
import { ProofController } from '../../src/controllers/ProofController';
import { ProofService } from '../../src/services/ProofService';

jest.mock('../../src/services/ProofService');

describe('ProofController', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let responseObject: any;

    beforeEach(() => {
        mockRequest = {
            user: { id: 'user1' },
            body: {
                balance: 1000,
                timestamp: new Date()
            }
        };

        responseObject = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockImplementation((result) => {
                responseObject = result;
                return mockResponse;
            })
        };
    });

    it('deve gerar prova com sucesso', async () => {
        const mockProof = {
            id: '1',
            userId: 'user1',
            balance: 1000,
            timestamp: new Date(),
            proofHash: 'hash123',
            status: 'pending'
        };

        (ProofService.generateProof as jest.Mock).mockResolvedValue(mockProof);

        await ProofController.generate(
            mockRequest as Request,
            mockResponse as Response
        );

        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(responseObject).toEqual(mockProof);
    });
});
```

## 12. Referências

- [Node.js Documentation](https://nodejs.org)
- [Express Documentation](https://expressjs.com)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Web3.js Documentation](https://web3js.readthedocs.io)
- [Socket.IO Documentation](https://socket.io/docs)
- [Jest Documentation](https://jestjs.io) 