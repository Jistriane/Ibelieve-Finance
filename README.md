# Ibelieve Finance v2.0

Sistema de provas de solvência utilizando zk-SNARKs e blockchain.

## 🚀 Requisitos

* Node.js 16+
* npm ou yarn
* PostgreSQL
* Redis
* MetaMask ou carteira Web3 compatível
* Ollama (para execução local do modelo Gemma2)

## 📦 Instalação

1. Clone o repositório:

```bash
git clone https://github.com/Jistriane/Ibelieve-Finance.git
cd Ibelieve-Finance
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
cd backend
npm run dev
```

### Terminal 2 - Blockchain Local (Hardhat)

```bash
cd contracts
npx hardhat node
```

### Terminal 3 - Deploy dos Contratos

```bash
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost
```

### Terminal 4 - Frontend

```bash
cd frontend
npm start
```

### Terminal 5 - Modelo Gemma2 (Opcional)

```bash
ollama run gemma2
```

## 📝 Notas Importantes

1. **Ordem de Inicialização**:  
   * Inicie primeiro o nó Hardhat  
   * Em seguida, faça o deploy dos contratos  
   * Depois inicie o backend  
   * Por último, inicie o frontend

2. **Portas Padrão**:  
   * Backend: 3000  
   * Frontend: 3001  
   * Hardhat: 8545  
   * PostgreSQL: 5432  
   * Redis: 6379

3. **Contratos**:  
   * Após o deploy, copie os endereços dos contratos e atualize no arquivo de configuração do backend

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

* [Documentação dos Circuitos](docs/circuits.md)
* [Documentação dos Contratos](docs/contracts.md)
* [Documentação da API](docs/api.md)
* [Documentação do Frontend](docs/frontend.md)
* [Documentação do Backend](docs/backend.md)
* [Documentação de Testes](docs/tests.md)
* [Documentação de Integração](docs/integration.md)

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

## 👥 Autores

* Jistriane Brunielli Silva de Oliveira - [@Jistriane](https://github.com/Jistriane)

## 🙏 Agradecimentos

* Open Finance
* Comunidade Node.js
* Comunidade Docker
* Comunidade Blockchain
* Comunidade ZK-SNARKs
