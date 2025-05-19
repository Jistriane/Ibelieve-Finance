# Frontend - Ibelieve Finance

## 1. Visão Geral

Este documento descreve a implementação do frontend do Ibelieve Finance, incluindo estrutura, componentes, gerenciamento de estado e integrações.

## 2. Estrutura do Projeto

```
frontend/
├── public/
│   ├── index.html
│   └── assets/
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   └── features/
│   ├── pages/
│   ├── services/
│   ├── store/
│   ├── utils/
│   ├── hooks/
│   ├── styles/
│   └── App.tsx
├── package.json
└── tsconfig.json
```

## 3. Tecnologias Principais

- React 18
- TypeScript
- Redux Toolkit
- Material-UI
- Socket.IO Client
- React Query
- Jest + React Testing Library

## 4. Componentes

### 4.1 Layout

```typescript
// src/components/layout/MainLayout.tsx
import React from 'react';
import { Box, AppBar, Toolbar, Drawer } from '@mui/material';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const MainLayout: React.FC = ({ children }) => {
    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed">
                <Header />
            </AppBar>
            <Drawer variant="permanent">
                <Sidebar />
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                {children}
            </Box>
        </Box>
    );
};
```

### 4.2 Provas de Solvência

```typescript
// src/components/features/proofs/ProofGenerator.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { useGenerateProof } from '@/hooks/useGenerateProof';

export const ProofGenerator: React.FC = () => {
    const { register, handleSubmit } = useForm();
    const { generateProof, isLoading } = useGenerateProof();

    const onSubmit = async (data: any) => {
        try {
            await generateProof(data);
        } catch (error) {
            console.error('Erro ao gerar prova:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <input {...register('balance')} type="number" />
            <button type="submit" disabled={isLoading}>
                Gerar Prova
            </button>
        </form>
    );
};
```

### 4.3 Lista de Provas

```typescript
// src/components/features/proofs/ProofList.tsx
import React from 'react';
import { useQuery } from 'react-query';
import { getProofs } from '@/services/proofs';
import { ProofCard } from './ProofCard';

export const ProofList: React.FC = () => {
    const { data: proofs, isLoading } = useQuery('proofs', getProofs);

    if (isLoading) {
        return <div>Carregando...</div>;
    }

    return (
        <div>
            {proofs?.map(proof => (
                <ProofCard key={proof.id} proof={proof} />
            ))}
        </div>
    );
};
```

## 5. Gerenciamento de Estado

### 5.1 Redux Store

```typescript
// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import proofReducer from './slices/proofSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        proof: proofReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### 5.2 Slice de Autenticação

```typescript
// src/store/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
}

const initialState: AuthState = {
    user: null,
    token: null,
    isLoading: false
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        },
        setToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
        }
    }
});

export const { setUser, setToken, logout } = authSlice.actions;
export default authSlice.reducer;
```

## 6. Hooks Personalizados

### 6.1 Hook de Autenticação

```typescript
// src/hooks/useAuth.ts
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setUser, setToken, logout } from '@/store/slices/authSlice';
import { login as loginService } from '@/services/auth';

export const useAuth = () => {
    const dispatch = useDispatch();
    const { user, token, isLoading } = useSelector(
        (state: RootState) => state.auth
    );

    const login = async (email: string, password: string) => {
        try {
            const response = await loginService(email, password);
            dispatch(setUser(response.user));
            dispatch(setToken(response.token));
        } catch (error) {
            console.error('Erro no login:', error);
            throw error;
        }
    };

    const handleLogout = () => {
        dispatch(logout());
    };

    return {
        user,
        token,
        isLoading,
        login,
        logout: handleLogout
    };
};
```

### 6.2 Hook de Provas

```typescript
// src/hooks/useGenerateProof.ts
import { useMutation, useQueryClient } from 'react-query';
import { generateProof } from '@/services/proofs';

export const useGenerateProof = () => {
    const queryClient = useQueryClient();

    return useMutation(generateProof, {
        onSuccess: () => {
            queryClient.invalidateQueries('proofs');
        }
    });
};
```

## 7. Serviços

### 7.1 API Client

```typescript
// src/services/api.ts
import axios from 'axios';
import { store } from '@/store';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
});

api.interceptors.request.use((config) => {
    const token = store.getState().auth.token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            store.dispatch(logout());
        }
        return Promise.reject(error);
    }
);

export default api;
```

### 7.2 Serviço de Provas

```typescript
// src/services/proofs.ts
import api from './api';

export const getProofs = async () => {
    const response = await api.get('/proofs');
    return response.data;
};

export const generateProof = async (data: any) => {
    const response = await api.post('/proofs', data);
    return response.data;
};

export const verifyProof = async (id: string) => {
    const response = await api.post(`/proofs/${id}/verify`);
    return response.data;
};
```

## 8. WebSocket

### 8.1 Configuração

```typescript
// src/services/websocket.ts
import { io } from 'socket.io-client';
import { store } from '@/store';

const socket = io(process.env.REACT_APP_WS_URL!, {
    auth: {
        token: store.getState().auth.token
    }
});

socket.on('connect', () => {
    console.log('Conectado ao WebSocket');
});

socket.on('disconnect', () => {
    console.log('Desconectado do WebSocket');
});

export default socket;
```

### 8.2 Hook de WebSocket

```typescript
// src/hooks/useWebSocket.ts
import { useEffect } from 'react';
import socket from '@/services/websocket';

export const useWebSocket = (event: string, callback: (data: any) => void) => {
    useEffect(() => {
        socket.on(event, callback);

        return () => {
            socket.off(event, callback);
        };
    }, [event, callback]);
};
```

## 9. Testes

### 9.1 Teste de Componente

```typescript
// src/components/features/proofs/__tests__/ProofGenerator.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ProofGenerator } from '../ProofGenerator';
import { useGenerateProof } from '@/hooks/useGenerateProof';

jest.mock('@/hooks/useGenerateProof');

describe('ProofGenerator', () => {
    it('deve gerar prova quando o formulário for submetido', async () => {
        const mockGenerateProof = jest.fn();
        (useGenerateProof as jest.Mock).mockReturnValue({
            generateProof: mockGenerateProof,
            isLoading: false
        });

        render(<ProofGenerator />);

        fireEvent.change(screen.getByRole('spinbutton'), {
            target: { value: '1000' }
        });

        fireEvent.click(screen.getByRole('button'));

        expect(mockGenerateProof).toHaveBeenCalledWith({
            balance: 1000
        });
    });
});
```

### 9.2 Teste de Hook

```typescript
// src/hooks/__tests__/useAuth.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth } from '../useAuth';
import { login as loginService } from '@/services/auth';

jest.mock('@/services/auth');

describe('useAuth', () => {
    it('deve fazer login com sucesso', async () => {
        const mockUser = { id: 1, email: 'test@example.com' };
        const mockToken = 'token123';

        (loginService as jest.Mock).mockResolvedValue({
            user: mockUser,
            token: mockToken
        });

        const { result } = renderHook(() => useAuth());

        await act(async () => {
            await result.current.login('test@example.com', 'password');
        });

        expect(result.current.user).toEqual(mockUser);
        expect(result.current.token).toBe(mockToken);
    });
});
```

## 10. Estilização

### 10.1 Tema

```typescript
// src/styles/theme.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2'
        },
        secondary: {
            main: '#dc004e'
        }
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
    }
});
```

### 10.2 Estilos Globais

```typescript
// src/styles/global.ts
import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        font-family: 'Roboto', sans-serif;
        background-color: #f5f5f5;
    }
`;
```

## 11. Referências

- [React Documentation](https://reactjs.org)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org)
- [Material-UI Documentation](https://mui.com)
- [React Query Documentation](https://react-query.tanstack.com)
- [Jest Documentation](https://jestjs.io) 