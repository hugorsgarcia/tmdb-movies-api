import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, describe, vi } from 'vitest';
import LoginForm from './index';
import React from 'react';

// Mock hooks
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockLogin = vi.fn();
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

describe('LoginForm (QA-001)', () => {
  test('renders email and password inputs', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Senha/i)).toBeInTheDocument();
  });

  test('shows loading text when submitting', async () => {
    // Delay resoluçao do mock para capturar o estado "Entrando..."
    mockLogin.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
    render(<LoginForm />);
    
    await userEvent.type(screen.getByLabelText(/Email/i), 't@t.com');
    await userEvent.type(screen.getByLabelText(/Senha/i), '123456');
    await userEvent.click(screen.getByRole('button', { name: /Entrar/i }));
    
    expect(screen.getByRole('button', { name: /Entrando.../i })).toBeInTheDocument();
  });

  test('calls login with correct credentials', async () => {
    render(<LoginForm />);
    
    await userEvent.type(screen.getByLabelText(/Email/i), 'test@test.com');
    await userEvent.type(screen.getByLabelText(/Senha/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /Entrar/i }));
    
    expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'password123');
  });
});
