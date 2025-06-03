import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

async function encryptFile(data: string, password: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  
  return JSON.stringify({
    salt: salt.toString('hex'),
    iv: iv.toString('hex'),
    encrypted,
    authTag: authTag.toString('hex')
  });
}

async function backupEnv() {
  try {
    // Criar diretório de backup se não existir
    const backupDir = path.join(process.cwd(), 'backups');
    await mkdir(backupDir, { recursive: true });

    // Ler arquivo .env-dev
    const envPath = path.join(process.cwd(), '.env-dev');
    const envContent = await readFile(envPath, 'utf8');

    // Gerar senha forte para criptografia
    const backupPassword = crypto.randomBytes(32).toString('hex');

    // Criptografar conteúdo
    const encrypted = await encryptFile(envContent, backupPassword);

    // Gerar nome do arquivo com timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `env-backup-${timestamp}.enc`);
    const keyPath = path.join(backupDir, `env-key-${timestamp}.txt`);

    // Salvar arquivo criptografado e chave
    await writeFile(backupPath, encrypted);
    await writeFile(keyPath, `Backup Password: ${backupPassword}\n`);

    console.log('✅ Backup realizado com sucesso!');
    console.log(`📁 Arquivo de backup: ${backupPath}`);
    console.log(`🔑 Arquivo com a chave: ${keyPath}`);
    console.log('\n⚠️  IMPORTANTE: Guarde o arquivo da chave em local seguro e separado do backup!');

  } catch (error) {
    console.error('❌ Erro ao realizar backup:', error);
    process.exit(1);
  }
}

// Executar backup
backupEnv(); 