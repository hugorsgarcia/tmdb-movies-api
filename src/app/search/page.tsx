'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import MediaCard from '@/components/MediaCard';
import ErrorMessage from '@/components/ErrorMessage';
import { searchMedia } from '@/utils/tmdb';
import { MediaItem } from '@/types/media';
import './page.scss';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const type = (searchParams.get('type') || 'movie') as 'movie' | 'tv';

  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setResults([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, [query, type]);

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await searchMedia(type, query, page);
        
        if (data.results && Array.isArray(data.results)) {
          setResults(prevResults => page === 1 ? data.results : [...prevResults, ...data.results]);
          setHasMore(data.page < data.total_pages);
        } else {
          setHasMore(false);
        }
      } catch (err) {
        console.error('Error searching:', err);
        setError('Erro ao realizar a busca. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query, type, page]);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const handleRetry = () => {
    setError(null);
    setPage(1);
    setResults([]);
    setHasMore(true);
  };

  if (!query.trim()) {
    return (
      <div className="search-page">
        <div className="search-empty">
          <p>Digite algo na barra de busca para encontrar {type === 'movie' ? 'filmes' : 'séries'}.</p>
        </div>
      </div>
    );
  }

  if (error && results.length === 0) {
    return (
      <div className="search-page">
        <ErrorMessage message={error} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>Resultados para: &quot;{query}&quot;</h1>
        <p className="results-count">
          {results.length} {results.length === 1 ? 'resultado' : 'resultados'} encontrados
        </p>
      </div>

      {results.length > 0 ? (
        <>
          <ul className="search-results">
            {results.filter(item => item && item.poster_path).map((item) => (
              <MediaCard key={item.id} mediaItem={item} mediaType={type} />
            ))}
          </ul>
          
          {hasMore && (
            <div className="load-more-container">
              <button 
                className="load-more-button" 
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? 'Carregando...' : 'Carregar Mais'}
              </button>
            </div>
          )}

          {!hasMore && (
            <p className="end-message">Todos os resultados foram carregados.</p>
          )}
        </>
      ) : (
        !loading && (
          <div className="no-results">
            <p>Nenhum resultado encontrado para &quot;{query}&quot;.</p>
            <p>Tente buscar com outras palavras-chave.</p>
          </div>
        )
      )}

      {loading && page === 1 && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Buscando...</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="search-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando busca...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
