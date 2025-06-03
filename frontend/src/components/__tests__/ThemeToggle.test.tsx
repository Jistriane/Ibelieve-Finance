import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '../ThemeToggle';
import { ThemeProvider } from '../../contexts/ThemeContext';

const mockToggleTheme = jest.fn();

jest.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({
    themeMode: 'light',
    toggleTheme: mockToggleTheme,
  }),
}));

describe('ThemeToggle', () => {
  it('deve renderizar o botão de toggle', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('deve chamar toggleTheme quando o botão for clicado', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(mockToggleTheme).toHaveBeenCalled();
  });

  it('deve mostrar o ícone correto baseado no tema atual', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    expect(screen.getByTestId('Brightness4Icon')).toBeInTheDocument();
  });
}); 