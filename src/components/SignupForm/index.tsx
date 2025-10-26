'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import './index.scss';

export default function SignupForm() {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (username.length < 3) {
      setError('O username deve ter no mínimo 3 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      await signup(username, email, password, displayName);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <form className="auth-form signup-form" onSubmit={handleSubmit}>
        <h1>Criar Conta</h1>
        <p className="subtitle">Junte-se à comunidade de amantes de cinema.</p>

        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            required
            placeholder="seuusername"
            disabled={isLoading}
            minLength={3}
          />
          <small className="input-hint">Apenas letras minúsculas, números e underscores</small>
        </div>

        <div className="form-group">
          <label htmlFor="displayName">Nome de Exibição</label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            placeholder="Seu Nome"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="seu@email.com"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Senha</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            disabled={isLoading}
            minLength={6}
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar Senha</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="••••••••"
            disabled={isLoading}
            minLength={6}
          />
        </div>

        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? 'Criando conta...' : 'Criar Conta'}
        </button>

        <div className="form-footer">
          <p>
            Já tem uma conta?{' '}
            <a href="/login" className="link">
              Entrar
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
