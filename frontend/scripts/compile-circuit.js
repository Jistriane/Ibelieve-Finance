const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Diretórios
const CIRCUITS_DIR = path.join(__dirname, '../circuits');
const PUBLIC_DIR = path.join(__dirname, '../public/circuits');

// Garante que os diretórios existem
if (!fs.existsSync(CIRCUITS_DIR)) {
  console.log('Criando diretório circuits...');
  fs.mkdirSync(CIRCUITS_DIR, { recursive: true });
}

if (!fs.existsSync(PUBLIC_DIR)) {
  console.log('Criando diretório public/circuits...');
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

// Verifica se o arquivo powersOfTau28_hez_final_12.ptau existe
const potFile = path.join(CIRCUITS_DIR, 'powersOfTau28_hez_final_12.ptau');
if (!fs.existsSync(potFile)) {
  throw new Error('Arquivo powersOfTau28_hez_final_12.ptau não encontrado. Por favor, baixe-o manualmente.');
}

// Compila o circuito
console.log('Compilando circuito...');
execSync(`circom ${CIRCUITS_DIR}/solvency.circom --r1cs --wasm --sym -o ${CIRCUITS_DIR}`);

// Gera a chave de prova
console.log('Gerando chave de prova...');
execSync(`snarkjs groth16 setup ${CIRCUITS_DIR}/solvency.r1cs ${potFile} ${CIRCUITS_DIR}/solvency.zkey`);

// Exporta a chave de verificação
console.log('Exportando chave de verificação...');
const verificationKeyPath = path.join(PUBLIC_DIR, 'verification_key.json');
execSync(`snarkjs zkey export verificationkey ${CIRCUITS_DIR}/solvency.zkey ${verificationKeyPath}`);

// Verifica se o arquivo de verificação foi gerado corretamente
if (!fs.existsSync(verificationKeyPath)) {
  throw new Error('Arquivo de verificação não foi gerado corretamente');
}

// Verifica se o arquivo de verificação é um JSON válido
try {
  const verificationKey = JSON.parse(fs.readFileSync(verificationKeyPath, 'utf8'));
  console.log('Arquivo de verificação é um JSON válido');
} catch (error) {
  throw new Error('Arquivo de verificação não é um JSON válido');
}

// Copia os arquivos necessários para o diretório public
console.log('Copiando arquivos para o diretório public...');
fs.copyFileSync(
  path.join(CIRCUITS_DIR, 'solvency_js', 'solvency.wasm'),
  path.join(PUBLIC_DIR, 'solvency.wasm')
);

fs.copyFileSync(
  path.join(CIRCUITS_DIR, 'solvency.zkey'),
  path.join(PUBLIC_DIR, 'solvency.zkey')
);

// Verifica se os arquivos foram copiados corretamente
console.log('Verificando arquivos copiados...');
const files = fs.readdirSync(PUBLIC_DIR);
console.log('Arquivos em public/circuits:', files);

// Verifica o conteúdo de cada arquivo
files.forEach(file => {
  const filePath = path.join(PUBLIC_DIR, file);
  const stats = fs.statSync(filePath);
  console.log(`Arquivo ${file}: ${stats.size} bytes`);
});

console.log('Compilação concluída com sucesso!'); 