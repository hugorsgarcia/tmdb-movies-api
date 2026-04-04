'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MediaTypeContextType {
  mediaType: 'movie' | 'tv';
  setMediaType: (type: 'movie' | 'tv') => void;
}

const MediaTypeContext = createContext<MediaTypeContextType | undefined>(undefined);

export function MediaTypeProvider({ children }: { children: ReactNode }) {
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');

  return (
    <MediaTypeContext.Provider value={{ mediaType, setMediaType }}>
      {children}
    </MediaTypeContext.Provider>
  );
}

export function useMediaType() {
  const context = useContext(MediaTypeContext);
  if (context === undefined) {
    throw new Error('useMediaType deve ser usado dentro de um MediaTypeProvider');
  }
  return context;
}
