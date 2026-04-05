'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useMediaType } from '@/contexts/MediaTypeContext';
import './index.scss';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { mediaType, setMediaType } = useMediaType();

  // Mostrar o toggle de media type apenas na home
  const showMediaToggle = pathname === '/';

  // DEV-011: Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

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
        <span className="logo" onClick={() => router.push('/')} style={{ cursor: 'pointer' }} role="button" tabIndex={0} aria-label="Ir para página inicial">
          <span className="logo-text">CineSync</span>
        </span>
        {showMediaToggle && (
          <div className="media-toggle">
            <button 
              className={mediaType === 'movie' ? 'active' : ''} 
              onClick={() => setMediaType('movie')}
              aria-label="Mostrar filmes"
            >
              Filmes
            </button>
            <button 
              className={mediaType === 'tv' ? 'active' : ''} 
              onClick={() => setMediaType('tv')}
              aria-label="Mostrar séries"
            >
              Séries
            </button>
          </div>
        )}
      </div>
      <div className="navbar-center">
        <form className="search-bar" onSubmit={handleSearch} role="search">
          <input 
            type="text" 
            placeholder="Buscar..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Campo de busca"
            suppressHydrationWarning={true} 
          />
          <button type="submit" className="search-button" aria-label="Buscar">
            🔍
          </button>
        </form>
      </div>
      <div className="navbar-right">
        {isAuthenticated && user ? (
          <div className="user-menu" ref={menuRef}>
            <button
              className="feed-link"
              onClick={() => router.push('/feed')}
              aria-label="Ver feed de atividades"
            >
              📰 Feed
            </button>
            <button 
              className="user-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-expanded={showUserMenu}
              aria-haspopup="true"
              aria-label="Menu do usuário"
            >
              <span className="user-avatar">
                {user.avatar ? (
                  <img src={user.avatar} alt={`Avatar de ${user.displayName}`} />
                ) : (
                  <span className="avatar-placeholder">
                    {user.displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </span>
              <span className="user-name">{user.displayName}</span>
            </button>
            {showUserMenu && (
              <div className="dropdown-menu" role="menu">
                <button role="menuitem" onClick={() => {
                  router.push(`/profile/${user.username}`);
                  setShowUserMenu(false);
                }}>
                  👤 Meu Perfil
                </button>
                <button role="menuitem" onClick={() => {
                  router.push('/settings');
                  setShowUserMenu(false);
                }}>
                  ⚙️ Configurações
                </button>
                <div className="menu-divider"></div>
                <button role="menuitem" onClick={handleLogout} className="logout-button">
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
              aria-label="Entrar na conta"
            >
              Entrar
            </button>
            <button 
              className="btn-signup"
              onClick={() => router.push('/signup')}
              aria-label="Criar nova conta"
            >
              Criar Conta
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
