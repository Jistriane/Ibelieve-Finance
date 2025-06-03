import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { promisify } from 'util';
import readline from 'readline';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

async function decryptFile(encryptedData: string, password: string): Promise<string> {
  const data = JSON.parse(encryptedData);
  const salt = Buffer.from(data.salt, 'hex');
  const iv = Buffer.from(data.iv, 'hex');
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  
  decipher.setAuthTag(Buffer.from(data.authTag, 'hex'));
  let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

async function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

async function restoreEnv() {
  try {
    // Listar backups disponíveis
    const backupDir = path.join(process.cwd(), 'backups');
    const files = fs.readdirSync(backupDir).filter(f => f.startsWith('env-backup-'));
    
    if (files.length === 0) {
      console.error('❌ Nenhum backup encontrado!');
      process.exit(1);
    }

    console.log('Backups disponíveis:');
    files.forEach((file, index) => {
      console.log(`${index + 1}. ${file}`);
    });

    // Solicitar escolha do backup
    const choice = parseInt(await askQuestion('\nEscolha o número do backup para restaurar: '));
    if (isNaN(choice) || choice < 1 || choice > files.length) {
      console.error('❌ Escolha inválida!');
      process.exit(1);
    }

    const backupFile = files[choice - 1];
    const timestamp = backupFile.replace('env-backup-', '').replace('.enc', '');
    const keyFile = `env-key-${timestamp}.txt`;

    // Ler arquivo de backup e chave
    const backupPath = path.join(backupDir, backupFile);
    const keyPath = path.join(backupDir, keyFile);
    
    const encryptedContent = await readFile(backupPath, 'utf8');
    const keyContent = await readFile(keyPath, 'utf8');
    const password = keyContent.replace('Backup Password: ', '').trim();

    // Descriptografar conteúdo
    const decrypted = await decryptFile(encryptedContent, password);

    // Criar backup do .env-dev atual antes de restaurar
    const currentEnvPath = path.join(process.cwd(), '.env-dev');
    if (fs.existsSync(currentEnvPath)) {
      const backupTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
      await writeFile(
        path.join(process.cwd(), `.env-dev.backup-${backupTimestamp}`),
        await readFile(currentEnvPath, 'utf8')
      );
    }

    // Restaurar backup
    await writeFile(currentEnvPath, decrypted);

    console.log('✅ Backup restaurado com sucesso!');
    console.log(`📝 Um backup do arquivo .env-dev atual foi criado antes da restauração.`);

  } catch (error) {
    console.error('❌ Erro ao restaurar backup:', error);
    process.exit(1);
  }
}

// Executar restauração
restoreEnv(); 