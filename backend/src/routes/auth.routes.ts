import { Router } from 'express';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    // TODO: Implementar lógica de login
    res.json({ message: 'Login route' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/register', async (req, res) => {
  try {
    // TODO: Implementar lógica de registro
    res.json({ message: 'Register route' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 