'use client';
import { useState, useEffect, useRef, useCallback } from "react";
import './index.scss';
import { MediaItem } from "@/types/media";
import MediaCard from "../MediaCard";
import ErrorMessage from "../ErrorMessage";
import { fetchDiscover } from "@/utils/tmdb";

import SkeletonCard from "../SkeletonCard";

interface Props {
  selectedGenre: number | null;
  mediaType: 'movie' | 'tv';
}

export default function MovieList({ selectedGenre, mediaType }: Props) {
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const observer = useRef<IntersectionObserver | null>(null);
    const isFetchingRef = useRef(false);

    useEffect(() => {
        setMediaItems([]);
        setPage(1);
        setHasMore(true);
        setError(null);
    }, [selectedGenre, mediaType]);

    useEffect(() => {
        let isMounted = true;
        const getMediaItems = async () => {
            if (isFetchingRef.current) return;
            isFetchingRef.current = true;
            setLoading(true);
            setError(null);
            
            try {
                const data = await fetchDiscover(mediaType, page, selectedGenre);
                if (!isMounted) return;
                
                if (data.results && Array.isArray(data.results)) {
                    setMediaItems(prevItems => page === 1 ? data.results : [...prevItems, ...data.results]);
                    setHasMore(data.page < data.total_pages);
                } else {
                    setHasMore(false);
                }
            } catch (err) {
                if (!isMounted) return;
                console.error("Error fetching media items:", err);
                setError(`Erro ao carregar ${mediaType === 'movie' ? 'filmes' : 'séries'}. Por favor, tente novamente.`);
            } finally {
                if (isMounted) {
                    setLoading(false);
                    isFetchingRef.current = false;
                }
            }
        };

        getMediaItems();

        return () => {
            isMounted = false;
        };
    }, [page, selectedGenre, mediaType]); // Apenas as variáveis de controle real da busca

    const lastMediaItemElementRef = useCallback((node: Element | null) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !loading) {
                setPage(prevPage => prevPage + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const handleRetry = () => {
        setError(null);
        setPage(1);
        setMediaItems([]);
        setHasMore(true);
    };

    if (error && mediaItems.length === 0) {
        return <ErrorMessage message={error} onRetry={handleRetry} />;
    }

    return (
        <div>
            <ul className="movie-list">
                {mediaItems.filter(item => item && item.poster_path).map((item, index) => {
                    const key = `${item.id}-${selectedGenre ?? 'all'}-${mediaType}-${index}`;

                    if (mediaItems.length === index + 1) {
                        return <MediaCard ref={lastMediaItemElementRef} key={key} mediaItem={item} mediaType={mediaType} />;
                    }
                    return <MediaCard key={key} mediaItem={item} mediaType={mediaType} />;
                })}
            </ul>
            {loading && (
                <ul className="movie-list" style={{ marginTop: mediaItems.length > 0 ? '16px' : '0' }}>
                    {[...Array(10)].map((_, i) => (
                        <SkeletonCard key={`skeleton-${i}`} />
                    ))}
                </ul>
            )}
            {error && mediaItems.length > 0 && <ErrorMessage message={error} onRetry={handleRetry} />}
            {!hasMore && mediaItems.length > 0 && <p className="end-of-list-indicator">Você chegou ao fim.</p>}
            {!loading && !error && mediaItems.length === 0 && <p className="end-of-list-indicator">Nenhum {mediaType === 'movie' ? 'filme' : 'série'} encontrado para este gênero.</p>}
        </div>
    );
}