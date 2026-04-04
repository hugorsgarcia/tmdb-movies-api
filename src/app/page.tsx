'use client';
import { useState, useEffect } from 'react';
import MovieList from "@/components/MovieList";
import Header from '@/components/Header';
import { useMediaType } from '@/contexts/MediaTypeContext';

export default function Home() {
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const { mediaType } = useMediaType();

  // Reset gênero ao trocar o tipo de mídia
  useEffect(() => {
    setSelectedGenre(null);
  }, [mediaType]);

  const handleSelectGenre = (genreId: number | null) => {
    setSelectedGenre(genreId);
  };

  return (
    <div>
      <Header selectedGenre={selectedGenre} onSelectGenre={handleSelectGenre} mediaType={mediaType} />
      <MovieList selectedGenre={selectedGenre} mediaType={mediaType} />
    </div>
  );
}
