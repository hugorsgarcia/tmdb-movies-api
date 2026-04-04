'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import './page.scss';

export default function SettingsPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Carregar dados do perfil
    const loadProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setDisplayName(data.display_name || '');
        setBio(data.bio || '');
        setLocation(data.location || '');
        setWebsite(data.website || '');
      }
    };

    loadProfile();
  }, [user, isAuthenticated, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim(),
          bio: bio.trim() || null,
          location: location.trim() || null,
          website: website.trim() || null,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;
      setSuccess('Perfil atualizado com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      setError('Não foi possível atualizar o perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        <h1>Configurações</h1>

        <form className="settings-form" onSubmit={handleSave}>
          <section className="settings-section">
            <h2>Perfil</h2>

            {error && <div className="settings-error">{error}</div>}
            {success && <div className="settings-success">{success}</div>}

            <div className="form-group">
              <label htmlFor="username">Nome de usuário</label>
              <input
                type="text"
                id="username"
                value={user.username}
                disabled
                className="input-disabled"
              />
              <small>O nome de usuário não pode ser alterado.</small>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={user.email}
                disabled
                className="input-disabled"
              />
            </div>

            <div className="form-group">
              <label htmlFor="displayName">Nome de exibição</label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                maxLength={100}
                placeholder="Seu nome de exibição"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={300}
                rows={3}
                placeholder="Conte um pouco sobre você..."
              />
              <small>{bio.length}/300</small>
            </div>

            <div className="form-group">
              <label htmlFor="location">Localização</label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                maxLength={100}
                placeholder="Ex: São Paulo, BR"
              />
            </div>

            <div className="form-group">
              <label htmlFor="website">Website</label>
              <input
                type="url"
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                maxLength={255}
                placeholder="https://seusite.com"
              />
            </div>

            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </section>
        </form>

        <section className="settings-section danger-zone">
          <h2>Conta</h2>
          <button className="btn-logout" onClick={handleLogout}>
            🚪 Sair da conta
          </button>
        </section>
      </div>
    </div>
  );
}
