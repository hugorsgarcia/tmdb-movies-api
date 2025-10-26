'use client';
import { useEffect, useState, useRef } from 'react';
import './index.scss';
import { fetchGenres } from '@/utils/tmdb';

interface Genre {
  id: number;
  name: string;
}

interface Props {
  mediaType: 'movie' | 'tv';
  selectedGenre: number | null;
  onSelectGenre: (genreId: number | null) => void;
}

export default function Header({ mediaType, selectedGenre, onSelectGenre }: Props) {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [error, setError] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const getGenres = async () => {
      try {
        setError(false);
        const data = await fetchGenres(mediaType);
        setGenres(data);
      } catch (err) {
        console.error('Error fetching genres:', err);
        setError(true);
      }
    };
    getGenres();
  }, [mediaType]);

  const scroll = (scrollOffset: number) => {
    if (listRef.current) {
      listRef.current.scrollLeft += scrollOffset;
    }
  };

  if (error) {
    return (
      <header className="header-container">
        <p style={{ color: '#ff3b30', textAlign: 'center', padding: '1rem' }}>
          Erro ao carregar gêneros
        </p>
      </header>
    );
  }

  return (
    <header className="header-container">
      <button className="scroll-button left" onClick={() => scroll(-200)}>‹</button>
      <ul className="genres-list" ref={listRef}>
        <li 
          key="inicio"
          className={`genre-item ${selectedGenre === null ? 'active' : ''}`}
          onClick={() => onSelectGenre(null)}
        >
          Início
        </li>
        {genres.map((genre) => (
          <li 
            key={genre.id} 
            className={`genre-item ${selectedGenre === genre.id ? 'active' : ''}`}
            onClick={() => onSelectGenre(genre.id)}
          >
            {genre.name}
          </li>
        ))}
      </ul>
      <button className="scroll-button right" onClick={() => scroll(200)}>›</button>
    </header>
  );
}