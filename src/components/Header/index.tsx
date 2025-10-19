'use client';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './index.scss';

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
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const getGenres = async () => {
      try {
        const response = await axios.get(`https://api.themoviedb.org/3/genre/${mediaType}/list`, {
          params: {
            api_key: 'acc2bc295985c96b273c383bf2c6e62a',
            language: 'pt-BR',
          },
        });
        setGenres(response.data.genres);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };
    getGenres();
  }, [mediaType]); // Re-fetch genres when mediaType changes

  const scroll = (scrollOffset: number) => {
    if (listRef.current) {
      listRef.current.scrollLeft += scrollOffset;
    }
  };

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