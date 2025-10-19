'use client';
import React from 'react';
import './index.scss';

interface Props {
  mediaType: 'movie' | 'tv';
  onMediaTypeChange: (type: 'movie' | 'tv') => void;
}

export default function Navbar({ mediaType, onMediaTypeChange }: Props) {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="logo">MyTMDB</span>
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
        <div className="search-bar">
          <input type="text" placeholder="Buscar..." suppressHydrationWarning={true} />
          {/* Search icon would go here */}
        </div>
      </div>
      <div className="navbar-right">
        {/* Icons for user, settings, etc. would go here */}
        <span className="icon">👤</span>
        <span className="icon">⚙️</span>
        <span className="icon">🎨</span>
      </div>
    </nav>
  );
}
