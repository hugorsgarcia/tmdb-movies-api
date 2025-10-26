'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import './index.scss';

interface Props {
  mediaType: 'movie' | 'tv';
  onMediaTypeChange: (type: 'movie' | 'tv') => void;
}

export default function Navbar({ mediaType, onMediaTypeChange }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}&type=${mediaType}`);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    router.push('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="logo" onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
          MyLetterboxd
        </span>
        <div className="media-toggle">
          <button 
            className={mediaType === 'movie' ? 'active' : ''} 
            onClick={() => onMediaTypeChange('movie')}
          >
            Filmes
          </button>
          <button 
            className={mediaType === 'tv' ? 'active' : ''} 
            onClick={() => onMediaTypeChange('tv')}
          >
            Séries
          </button>
        </div>
      </div>
      <div className="navbar-center">
        <form className="search-bar" onSubmit={handleSearch}>
          <input 
            type="text" 
            placeholder="Buscar..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            suppressHydrationWarning={true} 
          />
          <button type="submit" className="search-button" aria-label="Buscar">
            🔍
          </button>
        </form>
      </div>
      <div className="navbar-right">
        {isAuthenticated && user ? (
          <div className="user-menu">
            <button 
              className="user-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <span className="user-avatar">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.displayName} />
                ) : (
                  <span className="avatar-placeholder">
                    {user.displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </span>
              <span className="user-name">{user.displayName}</span>
            </button>
            {showUserMenu && (
              <div className="dropdown-menu">
                <button onClick={() => {
                  router.push(`/profile/${user.username}`);
                  setShowUserMenu(false);
                }}>
                  👤 Meu Perfil
                </button>
                <button onClick={() => {
                  setShowUserMenu(false);
                }}>
                  ⚙️ Configurações
                </button>
                <div className="menu-divider"></div>
                <button onClick={handleLogout} className="logout-button">
                  🚪 Sair
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-buttons">
            <button 
              className="btn-login"
              onClick={() => router.push('/login')}
            >
              Entrar
            </button>
            <button 
              className="btn-signup"
              onClick={() => router.push('/signup')}
            >
              Criar Conta
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
