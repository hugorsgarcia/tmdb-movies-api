'use client';
'use client';
import { useState } from 'react';
import MovieList from "@/components/MovieList";
import Header from '@/components/Header';
import Navbar from '@/components/Navbar'; // Import Navbar

export default function Home() {
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie'); // Add mediaType state

  const handleSelectGenre = (genreId: number | null) => {
    setSelectedGenre(genreId);
  };

  const handleMediaTypeChange = (type: 'movie' | 'tv') => { // Add handler for mediaType change
    setMediaType(type);
    setSelectedGenre(null); // Reset genre when media type changes
  };

  return (
    <div>
      <Navbar mediaType={mediaType} onMediaTypeChange={handleMediaTypeChange} />
      <Header selectedGenre={selectedGenre} onSelectGenre={handleSelectGenre} mediaType={mediaType} />
      <MovieList selectedGenre={selectedGenre} mediaType={mediaType} />
    </div>
  );
}
