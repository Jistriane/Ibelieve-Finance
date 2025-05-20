import api from './api';

export async function login(email: string, password: string) {
  const response = await api.post('/api/auth/login', { email, password });
  localStorage.setItem('token', response.data.token);
  return response.data.user;
}

export function logout() {
  localStorage.removeItem('token');
  window.location.href = '/';
} 