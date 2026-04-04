import { render, screen, act, waitFor } from '@testing-library/react';
import { expect, test, describe } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import bcrypt from 'bcryptjs';

const TestComponent = () => {
  const { user, signup, login, isAuthenticated } = useAuth();

  return (
    <div>
      <div data-testid="is-authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="username">{user?.username || 'none'}</div>
      <button onClick={() => signup('testuser', 'test@test.com', 'mypassword', 'Test User')}>
        Signup
      </button>
      <button onClick={() => login('test@test.com', 'mypassword')}>
        Login
      </button>
    </div>
  );
};

describe('AuthContext SEC-001 Fix', () => {
  test('senhas não devem ser salvas em texto plano e o login deve funcionar com bcrypt (SEC-001)', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initial state
    expect(screen.getByTestId('is-authenticated').textContent).toBe('false');

    // Simulate Signup
    await act(async () => {
      screen.getByText('Signup').click();
    });

    // Check if logged in
    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated').textContent).toBe('true');
    });
    expect(screen.getByTestId('username').textContent).toBe('testuser');

    // SEC-001 Verify Storage
    const usersJson = localStorage.getItem('users');
    expect(usersJson).not.toBeNull();
    
    if (usersJson) {
      const users = JSON.parse(usersJson);
      expect(users.length).toBe(1);
      
      const storedUser = users[0];
      // Assert password is NOT stored as plaintext
      expect(storedUser.password).not.toBe('mypassword');
      
      // Assert password is a valid bcrypt hash
      const isValidHash = await bcrypt.compare('mypassword', storedUser.password);
      expect(isValidHash).toBe(true);
    }
  });

  test('deve bloquear login após 5 tentativas incorretas (SEC-004)', async () => {
    localStorage.clear();
    const { renderHook } = await import('@testing-library/react');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Setup: Create a user
    await act(async () => {
      await result.current.signup('rate', 'rate@test.com', 'mypassword', 'Rate User');
    });

    // Logout
    act(() => {
      result.current.logout();
    });

    // 5 Erros propositais
    for (let i = 0; i < 5; i++) {
      let threw = false;
      try {
        await act(async () => {
          await result.current.login('rate@test.com', 'wrongpassword');
        });
      } catch (e) {
        threw = true;
      }
      expect(threw).toBe(true);
    }

    // Sexta tentativa deve ser bloqueada imediatamente pelo brute force shield
    let errorMessage = '';
    try {
      await act(async () => {
        await result.current.login('rate@test.com', 'wrongpassword');
      });
    } catch (e: any) {
      errorMessage = e.message;
    }

    expect(errorMessage).toContain('Muitas tentativas');
  });
});
