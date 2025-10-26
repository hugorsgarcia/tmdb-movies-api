'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import './index.scss';

interface Props {
  mediaType: 'movie' | 'tv';
  onMediaTypeChange: (type: 'movie' | 'tv') => void;
}

export default function Navbar({ mediaType, onMediaTypeChange }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}&type=${mediaType}`);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="logo" onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
          MyTMDB
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
        <span className="icon">👤</span>
        <span className="icon">⚙️</span>
        <span className="icon">🎨</span>
      </div>
    </nav>
  );
}
