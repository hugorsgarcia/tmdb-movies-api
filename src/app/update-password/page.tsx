'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import './page.scss';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // O Supabase processa o token automaticamente via hash na URL
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Usuário chegou via link de reset — está autenticado temporariamente
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => router.push('/'), 3000);
    } catch (err) {
      console.error('Erro ao atualizar senha:', err);
      setError('Não foi possível atualizar a senha. O link pode ter expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      {success ? (
        <div className="auth-form">
          <h1>Senha atualizada!</h1>
          <p className="subtitle">
            Sua senha foi alterada com sucesso. Redirecionando...
          </p>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          <h1>Nova senha</h1>
          <p className="subtitle">
            Escolha uma nova senha para sua conta.
          </p>

          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="password">Nova senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              disabled={loading}
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar nova senha</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              disabled={loading}
              minLength={6}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Atualizando...' : 'Atualizar senha'}
          </button>

          <div className="form-footer">
            <Link href="/login" className="link">
              Voltar para login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
