# Guia de Contribuição

## Como Contribuir

### 1. Preparação do Ambiente

#### Requisitos
- Docker e Docker Compose
- Node.js >= 14
- Yarn
- NVIDIA GPU (para Ollama)
- MetaMask ou SubWallet

#### Configuração Inicial
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/ibelieve-finance.git
cd ibelieve-finance

# Configure as variáveis de ambiente
cp frontend/.env-dev frontend/.env
cp backend/.env-dev backend/.env

# Inicie os serviços
./start-services.sh
```

### 2. Padrões de Código

#### Solidity
- Versão: ^0.8.19
- Estilo: [Solidity Style Guide](https://docs.soliditylang.org/en/v0.8.19/style-guide.html)
- Documentação: NatSpec
- Testes: Hardhat + Waffle

#### TypeScript
- Versão: 4.9.5
- Estilo: ESLint + Prettier
- Testes: Jest
- React: 18.2.0
- Material-UI: 5.13.1

### 3. Processo de Contribuição

1. Fork o repositório
2. Crie uma branch para sua feature
   ```bash
   git checkout -b feature/nome-da-feature
   ```
3. Faça commits das suas alterações
   ```bash
   git commit -m "feat: descrição da alteração"
   ```
4. Push para a branch
   ```bash
   git push origin feature/nome-da-feature
   ```
5. Abra um Pull Request

### 4. Convenções de Commit

Seguimos o padrão Conventional Commits:

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Manutenção
- `perf`: Melhorias de performance
- `ci`: Configuração de CI
- `build`: Build do sistema
- `revert`: Reverter commits

### 5. Testes

#### Smart Contracts
```bash
# Testes unitários
npx hardhat test

# Coverage
npx hardhat coverage
```

#### Frontend
```bash
# Testes unitários
yarn test

# Coverage
yarn test --coverage

# Lint
yarn lint

# Type check
yarn type-check
```

#### Backend
```bash
# Testes unitários
yarn test

# Coverage
yarn test --coverage

# Lint
yarn lint

# Type check
yarn type-check
```

### 6. Segurança

#### Smart Contracts
- Audite seu código antes do PR
- Evite dependências desnecessárias
- Siga as melhores práticas de segurança
- Reporte vulnerabilidades em privado
- Implemente controles de acesso
- Use padrões de segurança conhecidos

#### Frontend/Backend
- Validação de inputs
- Sanitização de dados
- Proteção contra XSS
- Rate limiting
- Autenticação JWT
- Criptografia de dados sensíveis

### 7. Documentação

#### Código
- Mantenha a documentação atualizada
- Documente novas funcionalidades
- Use JSDoc/TSDoc
- Inclua exemplos de uso
- Documente APIs com OpenAPI/Swagger

#### Projeto
- Atualize o README quando necessário
- Mantenha a documentação técnica atualizada
- Documente decisões arquiteturais
- Atualize diagramas

### 8. Review

Seu PR será revisado considerando:
- Qualidade do código
- Cobertura de testes
- Documentação
- Segurança
- Performance
- Acessibilidade
- UX/UI
- Integração com serviços

### 9. Deploy

#### Smart Contracts
- Deploy manual em Sepolia
- Verificação do código fonte
- Testes em testnet
- Auditoria de segurança

#### Frontend/Backend
- CI/CD automatizado
- Testes de integração
- Build de produção
- Deploy em staging
- Deploy em produção

### 10. Monitoramento

#### Métricas
- Prometheus para coleta
- Grafana para visualização
- Alertas configurados
- Dashboards atualizados

#### Logs
- Elasticsearch para armazenamento
- Kibana para visualização
- Logs estruturados
- Rotação de logs

### 11. Suporte

- Dúvidas: Abra uma issue
- Bugs: Use o template de bug
- Sugestões: Use o template de feature
- Segurança: Reporte em privado

## Recursos

### Documentação
- [Documentação Técnica](./DOCUMENTATION.md)
- [Guia de Arquitetura](./ARCHITECTURE.md)
- [Guia de Segurança](./SECURITY.md)

### Tecnologias
- [Solidity Docs](https://docs.soliditylang.org/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [React Docs](https://reactjs.org/docs/)
- [Material-UI Docs](https://mui.com/)
- [Web3.js Docs](https://web3js.readthedocs.io/)

### Ferramentas
- [Docker Docs](https://docs.docker.com/)
- [Prometheus Docs](https://prometheus.io/docs/)
- [Grafana Docs](https://grafana.com/docs/)
- [Elasticsearch Docs](https://www.elastic.co/guide/)
- [Ollama Docs](https://ollama.ai/docs) 