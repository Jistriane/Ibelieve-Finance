# Hasher - Serviço de Integração com Open Finance

## 📋 Descrição
Hasher é um serviço de integração com Open Finance que fornece uma API RESTful para gerenciar autenticação, autorização e integração com serviços financeiros.

## 🚀 Tecnologias
- Node.js
- TypeScript
- Express
- Redis
- Elasticsearch
- Prometheus
- Grafana
- Docker
- Docker Compose

## 📦 Pré-requisitos
- Docker
- Docker Compose
- Node.js 18+
- npm 8+

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/hasher.git
cd hasher
```

2. Configure as variáveis de ambiente:
```bash
cp .env-dev .env
```

3. Edite o arquivo `.env` com suas configurações.

## 🚀 Execução

### Método 1: Usando o script de inicialização (Recomendado)
```bash
# Tornar o script executável
chmod +x start-server.sh

# Executar o script
./start-server.sh
```

### Método 2: Usando Docker Compose diretamente
```bash
# Iniciar os serviços
docker compose up --build -d

# Verificar logs
docker compose logs -f

# Parar os serviços
docker compose down
```

## 🌐 Endpoints Disponíveis

### API (http://localhost:3001)
- `GET /health` - Verificar status do servidor
- `GET /metrics` - Métricas do Prometheus
- `GET /api/*` - Rotas da API

### Grafana (http://localhost:3002)
- Usuário: admin
- Senha: ibeleve123

### Prometheus (http://localhost:9090)
- Métricas e alertas

### Elasticsearch (http://localhost:9200)
- Usuário: elastic
- Senha: ibeleve123

### Alertmanager (http://localhost:9093)
- Gerenciamento de alertas

## 📊 Monitoramento

### Grafana
- Dashboards pré-configurados para monitoramento
- Métricas de performance
- Alertas configuráveis

### Prometheus
- Coleta de métricas
- Regras de alerta
- Histórico de dados

### Elasticsearch
- Logs centralizados
- Análise de performance
- Busca em tempo real

## 🔍 Logs

Os logs são centralizados no Elasticsearch e podem ser visualizados através do Grafana ou diretamente via API do Elasticsearch.

## 🔐 Segurança

- Autenticação JWT
- Rate limiting
- CORS configurado
- Sanitização de inputs
- Headers de segurança

## 🧪 Testes

```bash
# Executar testes
npm test

# Executar testes com coverage
npm run test:coverage

# Executar testes em modo watch
npm run test:watch
```

## 📝 Scripts Disponíveis

- `npm start` - Inicia o servidor em produção
- `npm run dev` - Inicia o servidor em desenvolvimento
- `npm run build` - Compila o TypeScript
- `npm test` - Executa os testes
- `npm run lint` - Executa o linter
- `npm run clean` - Limpa o diretório dist

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- Seu Nome - [@seu-usuario](https://github.com/seu-usuario)

## 🙏 Agradecimentos

- Open Finance
- Comunidade Node.js
- Comunidade Docker

# Ibelieve Finance

Sistema de provas de solvência utilizando zk-SNARKs e blockchain.

## 🚀 Requisitos

- Node.js 16+
- npm ou yarn
- PostgreSQL
- Redis
- MetaMask ou carteira Web3 compatível
- Ollama (para execução local do modelo Gemma2)

## 📦 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/ibelieve.git
cd ibelieve
```

2. Instale as dependências de cada componente:

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# Contratos
cd ../contracts
npm install
```

## 🔧 Configuração

1. Configure as variáveis de ambiente:

```bash
# Backend (.env)
cp backend/.env.example backend/.env
# Edite o arquivo .env com suas configurações

# Frontend (.env)
cp frontend/.env.example frontend/.env
# Edite o arquivo .env com suas configurações
```

2. Configure o banco de dados PostgreSQL e Redis conforme as variáveis de ambiente.

## 🏃‍♂️ Executando o Projeto

O projeto precisa ser executado em múltiplos terminais:

### Terminal 1 - Backend
```bash
cd /home/kali/Ibelieve/backend
npm run dev
```

### Terminal 2 - Blockchain Local (Hardhat)
```bash
cd /home/kali/Ibelieve/contracts
npx hardhat node
```

### Terminal 3 - Deploy dos Contratos
```bash
cd /home/kali/Ibelieve/contracts
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost
```

### Terminal 4 - Frontend
```bash
cd /home/kali/Ibelieve/frontend
npm start
```

### Terminal 5 - Modelo Gemma2 (Opcional)
```bash
ollama run gemma2
```

## 📝 Notas Importantes

1. **Ordem de Inicialização**:
   - Inicie primeiro o nó Hardhat
   - Em seguida, faça o deploy dos contratos
   - Depois inicie o backend
   - Por último, inicie o frontend

2. **Portas Padrão**:
   - Backend: 3000
   - Frontend: 3001
   - Hardhat: 8545
   - PostgreSQL: 5432
   - Redis: 6379

3. **Contratos**:
   - Após o deploy, copie os endereços dos contratos e atualize no arquivo de configuração do backend

## 🔍 Verificação

1. Acesse o frontend em: http://localhost:3001
2. Verifique se o backend está respondendo em: http://localhost:3000
3. Confirme se o nó Hardhat está rodando em: http://localhost:8545

## 🛠️ Scripts Disponíveis

### Backend
```bash
npm run dev        # Inicia o servidor em modo desenvolvimento
npm run build      # Compila o projeto
npm run test       # Executa os testes
```

### Frontend
```bash
npm start          # Inicia o servidor de desenvolvimento
npm run build      # Compila o projeto
npm run test       # Executa os testes
```

### Contratos
```bash
npx hardhat compile    # Compila os contratos
npx hardhat test       # Executa os testes
npx hardhat node       # Inicia o nó local
```

## 📚 Documentação

- [Documentação dos Circuitos](CIRCUITS.md)
- [Documentação dos Contratos](CONTRACTS.md)
- [Documentação da API](API.md)
- [Documentação do Frontend](FRONTEND.md)
- [Documentação do Backend](BACKEND.md)
- [Documentação de Testes](TESTING.md)
- [Documentação de Integração](INTEGRATION.md)

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

Para suporte, envie um email para suporte@ibelieve.finance ou abra uma issue no GitHub. 