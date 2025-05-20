# Documentação de Segurança - Ibelieve Finance

## 1. Visão Geral

Este documento descreve as medidas de segurança implementadas no Ibelieve Finance, incluindo autenticação, autorização, proteção de dados e boas práticas.

## 2. Autenticação

### 2.1 JWT
```typescript
// src/services/auth.ts
import jwt from 'jsonwebtoken';

class AuthService {
    private readonly JWT_SECRET = process.env.JWT_SECRET;
    private readonly JWT_EXPIRES_IN = '1h';
    
    generateToken(user: User): string {
        return jwt.sign(
            { id: user.id, role: user.role },
            this.JWT_SECRET,
            { expiresIn: this.JWT_EXPIRES_IN }
        );
    }
    
    verifyToken(token: string): UserPayload {
        return jwt.verify(token, this.JWT_SECRET) as UserPayload;
    }
}
```

### 2.2 Middleware
```typescript
// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth';

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }
    
    try {
        const authService = new AuthService();
        const payload = authService.verifyToken(token);
        req.user = payload;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido' });
    }
};
```

## 3. Autorização

### 3.1 RBAC (Role-Based Access Control)
```typescript
// src/services/rbac.ts
enum Role {
    USER = 'user',
    ADMIN = 'admin',
    AUDITOR = 'auditor'
}

class RBACService {
    private readonly rolePermissions = {
        [Role.USER]: ['read:own', 'write:own'],
        [Role.ADMIN]: ['read:all', 'write:all', 'delete:all'],
        [Role.AUDITOR]: ['read:all']
    };
    
    hasPermission(role: Role, permission: string): boolean {
        return this.rolePermissions[role]?.includes(permission) ?? false;
    }
}
```

### 3.2 Middleware
```typescript
// src/middleware/rbac.ts
import { Request, Response, NextFunction } from 'express';
import { RBACService } from '../services/rbac';

export const rbacMiddleware = (permission: string) => (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const rbacService = new RBACService();
    const hasPermission = rbacService.hasPermission(req.user.role, permission);
    
    if (!hasPermission) {
        return res.status(403).json({ error: 'Acesso negado' });
    }
    
    next();
};
```

## 4. Proteção de Dados

### 4.1 Criptografia
```typescript
// src/services/crypto.ts
import crypto from 'crypto';

class CryptoService {
    private readonly algorithm = 'aes-256-gcm';
    private readonly key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    
    encrypt(data: string): string {
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
        
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag();
        
        return JSON.stringify({
            iv: iv.toString('hex'),
            encrypted,
            authTag: authTag.toString('hex')
        });
    }
    
    decrypt(encryptedData: string): string {
        const { iv, encrypted, authTag } = JSON.parse(encryptedData);
        
        const decipher = crypto.createDecipheriv(
            this.algorithm,
            this.key,
            Buffer.from(iv, 'hex')
        );
        
        decipher.setAuthTag(Buffer.from(authTag, 'hex'));
        
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }
}
```

### 4.2 Sanitização
```typescript
// src/services/sanitizer.ts
import { sanitize } from 'class-sanitizer';
import { plainToClass } from 'class-transformer';

class SanitizerService {
    sanitize<T>(data: any, dtoClass: new () => T): T {
        const instance = plainToClass(dtoClass, data);
        return sanitize(instance);
    }
}
```

## 5. Segurança de API

### 5.1 Rate Limiting
```typescript
// src/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // limite por IP
    message: 'Muitas requisições deste IP, tente novamente mais tarde'
});

export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5, // limite por IP
    message: 'Muitas tentativas de login, tente novamente mais tarde'
});
```

### 5.2 CORS
```typescript
// src/config/cors.ts
import cors from 'cors';

export const corsOptions: cors.CorsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? [],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 horas
};
```

## 6. Segurança de Contratos

### 6.1 Reentrância
```solidity
// contracts/SolvencyManager.sol
contract SolvencyManager {
    bool private locked;
    
    modifier nonReentrant() {
        require(!locked, "Reentrant call");
        locked = true;
        _;
        locked = false;
    }
    
    function submitProof(bytes32 proofHash) public nonReentrant {
        // Implementação
    }
}
```

### 6.2 Overflow
```solidity
// contracts/SolvencyVerifier.sol
contract SolvencyVerifier {
    using SafeMath for uint256;
    
    function verifyProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[1] memory input
    ) public view returns (bool) {
        // Implementação com SafeMath
    }
}
```

## 7. Monitoramento de Segurança

### 7.1 Logging
```typescript
// src/services/logger.ts
import winston from 'winston';

class LoggerService {
    private logger: winston.Logger;
    
    constructor() {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.json(),
            transports: [
                new winston.transports.File({ filename: 'error.log', level: 'error' }),
                new winston.transports.File({ filename: 'combined.log' })
            ]
        });
    }
    
    logSecurityEvent(event: SecurityEvent): void {
        this.logger.info('Security Event', {
            ...event,
            timestamp: new Date().toISOString()
        });
    }
}
```

### 7.2 Alertas
```typescript
// src/services/alert.ts
class AlertService {
    async sendAlert(alert: SecurityAlert): Promise<void> {
        // Implementação de envio de alertas
        // Email, Slack, etc.
    }
}
```

## 8. Boas Práticas

### 8.1 Validação de Input
```typescript
// src/validators/proof.validator.ts
import { IsNumber, IsString, Min, Max } from 'class-validator';

export class ProofValidator {
    @IsNumber()
    @Min(0)
    @Max(1000000)
    balance: number;
    
    @IsString()
    @IsISO8601()
    timestamp: string;
}
```

### 8.2 Headers de Segurança
```typescript
// src/middleware/security.ts
import helmet from 'helmet';

export const securityMiddleware = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.ibeleve.com"]
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
});
```

## 9. Auditoria

### 9.1 Checklist
- [ ] Revisão de código
- [ ] Testes de penetração
- [ ] Análise de dependências
- [ ] Verificação de configurações
- [ ] Testes de segurança

### 9.2 Relatórios
```typescript
// src/services/audit.ts
class AuditService {
    async generateReport(): Promise<AuditReport> {
        // Implementação de geração de relatório
    }
    
    async trackVulnerability(vulnerability: Vulnerability): Promise<void> {
        // Implementação de rastreamento de vulnerabilidades
    }
}
```

## 10. Referências

- [OWASP Top 10](https://owasp.org/www-project-top-ten)
- [JWT Best Practices](https://auth0.com/blog/jwt-security-best-practices)
- [Solidity Security](https://solidity.readthedocs.io/en/latest/security-considerations.html)
- [Node.js Security](https://nodejs.org/en/docs/guides/security) 