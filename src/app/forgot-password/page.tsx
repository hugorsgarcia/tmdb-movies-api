'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import './page.scss';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (resetError) throw resetError;
      setSent(true);
    } catch (err) {
      console.error('Erro ao enviar email de reset:', err);
      setError('Não foi possível enviar o email. Verifique o endereço e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      {sent ? (
        <div className="auth-form">
          <h1>Email enviado!</h1>
          <p className="subtitle">
            Se uma conta existir com o email <strong>{email}</strong>, você receberá um link para redefinir sua senha.
          </p>
          <Link href="/login" className="back-link">
            ← Voltar para o login
          </Link>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          <h1>Esqueci minha senha</h1>
          <p className="subtitle">
            Digite seu email e enviaremos um link para redefinir sua senha.
          </p>

          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
              disabled={loading}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar link de redefinição'}
          </button>

          <div className="form-footer">
            <p>
              Lembrou sua senha?{' '}
              <Link href="/login" className="link">
                Voltar para login
              </Link>
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
