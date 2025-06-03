import { AppDataSource } from '../config/database';
import { environment } from '../config/environment';

beforeAll(async () => {
  // Configurar ambiente de teste
  process.env.NODE_ENV = 'test';
  
  // Inicializar conexão com banco de dados de teste
  try {
    await AppDataSource.initialize();
  } catch (error) {
    console.error('Erro ao inicializar banco de dados de teste:', error);
    throw error;
  }
});

afterAll(async () => {
  // Fechar conexão com banco de dados
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

beforeEach(async () => {
  // Limpar todas as tabelas antes de cada teste
  try {
    const entities = AppDataSource.entityMetadatas;
    for (const entity of entities) {
      const repository = AppDataSource.getRepository(entity.name);
      await repository.clear();
    }
  } catch (error) {
    console.error('Erro ao limpar tabelas:', error);
    throw error;
  }
}); 