# Instruções de Instalação

## Pré-requisitos

- Node.js (v16 ou superior)
- npm (v7 ou superior)
- Rust (última versão estável)
- Git
- build-essential (para compilação)

## Instalação do Circom

### 1. Instalar Dependências

```bash
# Atualizar repositórios
sudo apt-get update

# Instalar dependências
sudo apt-get install -y build-essential git nodejs npm

# Instalar Rust (se ainda não estiver instalado)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### 2. Instalar Circom

```bash
# Clonar repositório
git clone https://github.com/iden3/circom.git
cd circom

# Compilar
cargo build --release

# Instalar globalmente
sudo cp target/release/circom /usr/local/bin/

# Verificar instalação
circom --version
```

### 3. Instalar Dependências do Projeto

```bash
# Na pasta do projeto
cd frontend

# Instalar dependências
npm install

# Instalar snarkjs globalmente
npm install -g snarkjs
```

## Compilação do Circuito

Após instalar todas as dependências, você pode compilar o circuito:

```bash
# Na pasta do projeto
cd frontend

# Executar script de compilação
npm run compile-circuit
```

## Solução de Problemas

### Erro: "circom: command not found"
- Verifique se o circom foi instalado corretamente em `/usr/local/bin/`
- Verifique se o PATH inclui `/usr/local/bin/`

### Erro: "Permission denied"
- Certifique-se de ter permissões de sudo
- Execute os comandos de instalação com sudo

### Erro: "Rust not found"
- Execute `source $HOME/.cargo/env` após instalar o Rust
- Verifique a instalação com `rustc --version`

## Notas Adicionais

- O script de compilação (`compile-circuit.js`) requer os seguintes arquivos:
  - `solvency.circom` (circuito)
  - `pot12_final.ptau` (será baixado automaticamente)
  - `circomlib` (será instalado via npm)

- Os arquivos gerados serão:
  - `solvency.wasm`
  - `solvency.zkey`
  - `verification_key.json`

## Ambiente de Desenvolvimento

Este projeto foi testado nos seguintes ambientes:
- WSL2 (Kali Linux)
- Windows 10/11 com WSL2

## Suporte

Se encontrar problemas durante a instalação:
1. Verifique se todas as dependências estão instaladas corretamente
2. Consulte a [documentação oficial do Circom](https://docs.circom.io/)
3. Abra uma issue no repositório do projeto 