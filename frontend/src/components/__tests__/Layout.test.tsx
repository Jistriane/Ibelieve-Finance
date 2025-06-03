import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from '../Layout';
import { ThemeProvider } from '../../contexts/ThemeContext';

const mockOutlet = jest.fn(() => <div>Conteúdo da Página</div>);

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Outlet: () => mockOutlet(),
}));

describe('Layout', () => {
  it('deve renderizar o título da aplicação', () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <Layout />
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('I Believe Finance')).toBeInTheDocument();
  });

  it('deve renderizar o ThemeToggle', () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <Layout />
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('deve renderizar o conteúdo da página através do Outlet', () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <Layout />
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Conteúdo da Página')).toBeInTheDocument();
  });
}); 