# IbelieveFinance Frontend

Frontend da aplicação IbelieveFinance, uma plataforma de empréstimos descentralizada que utiliza provas zero-knowledge (ZK) e inteligência artificial para análise de risco.

## Funcionalidades

- Conexão com carteiras (MetaMask e SubWallet)
- Geração e registro de provas ZK
- Análise de risco com IA
- Detecção de fraude
- Monitoramento de pagamentos
- Interface moderna e responsiva

## Requisitos

- Node.js >= 14
- Yarn ou npm
- MetaMask ou SubWallet instalado
- Acesso à rede Sepolia

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/ibelieve-finance/frontend.git
cd frontend
```

2. Instale as dependências:
```bash
yarn install
```

3. Configure as variáveis de ambiente:
```bash
cp .env-dev .env
# Edite o arquivo .env com suas configurações
```

4. Inicie o servidor de desenvolvimento:
```bash
yarn start
```

## Scripts Disponíveis

- `yarn start`: Inicia o servidor de desenvolvimento
- `yarn build`: Cria a build de produção
- `yarn test`: Executa os testes
- `yarn lint`: Verifica o código com ESLint
- `yarn lint:fix`: Corrige problemas de linting
- `yarn format`: Formata o código com Prettier

## Estrutura do Projeto

```
src/
  components/     # Componentes React
  hooks/         # Custom hooks
  services/      # Serviços (API, Web3, etc)
  utils/         # Utilitários e tipos
  theme.ts       # Configuração do tema
  App.tsx        # Componente principal
```

## Tecnologias Utilizadas

- React 18
- TypeScript
- Material-UI
- Ethers.js
- Web3.js
- Ollama (IA)
- ZKProof

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.
