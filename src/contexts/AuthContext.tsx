'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '@/types/user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carregar usuário do localStorage ao iniciar
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulação de login (substituir pela API real posteriormente)
      // Verificar se é um usuário já cadastrado no localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const existingUser = users.find((u: User & { password: string }) => u.email === email && u.password === password);

      if (existingUser) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _pwd, ...userWithoutPassword } = existingUser;
        setUser(userWithoutPassword);
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      } else {
        throw new Error('Email ou senha incorretos');
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (username: string, email: string, password: string, displayName: string) => {
    setLoading(true);
    try {
      // Simulação de cadastro (substituir pela API real posteriormente)
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Verificar se já existe usuário com esse email ou username
      if (users.some((u: User & { password: string }) => u.email === email)) {
        throw new Error('Email já cadastrado');
      }
      if (users.some((u: User & { password: string }) => u.username === username)) {
        throw new Error('Username já em uso');
      }

      const newUser: User & { password: string } = {
        id: Date.now().toString(),
        username,
        email,
        displayName,
        avatar: `https://ui-avatars.com/api/?name=${displayName}&background=random`,
        bio: '',
        joinedDate: new Date().toISOString(),
        password, // Armazenar senha (em produção, seria hash)
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      // Fazer login automático após cadastro
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _pwd, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
