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
});
