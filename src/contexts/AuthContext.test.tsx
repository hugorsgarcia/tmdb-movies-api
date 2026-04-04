import { render, screen, act, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { expect, test, describe, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import React from 'react';

// Mock Supabase
const mockSignUp = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignOut = vi.fn();
const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: (...args: unknown[]) => mockSignUp(...args),
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
      signOut: () => mockSignOut(),
      getSession: () => mockGetSession(),
      onAuthStateChange: () => {
        mockOnAuthStateChange();
        return {
          data: {
            subscription: { unsubscribe: vi.fn() },
          },
        };
      },
    },
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

const mockProfile = {
  id: 'test-uuid-123',
  username: 'testuser',
  email: 'test@test.com',
  display_name: 'Test User',
  avatar_url: 'https://ui-avatars.com/api/?name=Test+User&background=random',
  bio: '',
  location: null,
  website: null,
  joined_date: new Date().toISOString(),
};

describe('AuthContext com Supabase (DBA-001)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Default: no session
    mockGetSession.mockResolvedValue({ data: { session: null } });

    // Default: profile query
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
        }),
      }),
    });
  });

  test('signup deve chamar supabase.auth.signUp e não usar bcryptjs', async () => {
    mockSignUp.mockResolvedValue({
      data: { user: { id: 'test-uuid-123' } },
      error: null,
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signup('testuser', 'test@test.com', 'mypassword', 'Test User');
    });

    // Verificar que chamou supabase.auth.signUp
    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'mypassword',
      options: {
        data: {
          username: 'testuser',
          display_name: 'Test User',
          avatar_url: expect.stringContaining('ui-avatars.com'),
        },
      },
    });

    // Verificar que NÃO há bcryptjs no localStorage (dados ficam no Supabase agora)
    expect(localStorage.getItem('users')).toBeNull();
  });

  test('login deve chamar supabase.auth.signInWithPassword', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: { id: 'test-uuid-123' } },
      error: null,
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@test.com', 'mypassword');
    });

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'mypassword',
    });
  });

  test('deve bloquear login após 5 tentativas incorretas (SEC-004 — dupla camada)', async () => {
    localStorage.clear();

    // Simular falha de login no Supabase
    mockSignInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid login credentials' },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });

    // 5 tentativas com senha errada
    for (let i = 0; i < 5; i++) {
      try {
        await act(async () => {
          await result.current.login('rate@test.com', 'wrongpassword');
        });
      } catch {
        // Esperado
      }
    }

    // Sexta tentativa deve ser bloqueada pelo rate limit client-side
    let errorMessage = '';
    try {
      await act(async () => {
        await result.current.login('rate@test.com', 'wrongpassword');
      });
    } catch (e: unknown) {
      if (e instanceof Error) {
        errorMessage = e.message;
      }
    }

    expect(errorMessage).toContain('Muitas tentativas');

    // Verificar que o Supabase NÃO foi chamado na 6ª tentativa
    // (5 chamadas reais + 0 na 6ª = 5 total)
    expect(mockSignInWithPassword).toHaveBeenCalledTimes(5);
  });
});
