'use client';
import { useState, useEffect, useRef, useCallback } from "react";
import './index.scss';
import axios from "axios";
import { MediaItem } from "@/types/media";
import { Movie } from "@/types/movie";
import MovieCard from "../MovieCard";

interface Props {
  selectedGenre: number | null;
  mediaType: 'movie' | 'tv';
}

export default function MovieList({ selectedGenre, mediaType }: Props) {
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const observer = useRef<IntersectionObserver | null>(null);
    const isFetchingRef = useRef(false);

    useEffect(() => {
        setMediaItems([]);
        setPage(1);
        setHasMore(true);
    }, [selectedGenre, mediaType]);

    useEffect(() => {
        const getMediaItems = async () => {
            if (loading || !hasMore || isFetchingRef.current) return;
            isFetchingRef.current = true;
            setLoading(true);
            try {
                const params: Record<string, string | number> = {
                    api_key: 'acc2bc295985c96b273c383bf2c6e62a',
                    language: 'pt-BR',
                    page: page,
                };
                if (selectedGenre) {
                    params.with_genres = selectedGenre;
                }

                const response = await axios.get(`https://api.themoviedb.org/3/discover/${mediaType}`, { params });
                
                if (response.data.results && Array.isArray(response.data.results)) {
                    setMediaItems(prevItems => page === 1 ? response.data.results : [...prevItems, ...response.data.results]);
                    setHasMore(response.data.page < response.data.total_pages);
                } else {
                    setHasMore(false);
                }
            } catch (error) {
                console.error("Error fetching media items:", error);
            } finally {
                setLoading(false);
                isFetchingRef.current = false;
            }
        };

        if(hasMore) {
          getMediaItems();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, selectedGenre, mediaType]);

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

    return (
        <div>
            <ul className="movie-list">
                {mediaItems.filter(item => item && item.poster_path).map((item, index) => {
                    const key = `${item.id}-${selectedGenre ?? 'all'}-${mediaType}-${index}`;
                    const movieProps: Movie = {
                        id: item.id,
                        title: item.title ?? item.name ?? '',
                        release_date: item.release_date ?? item.first_air_date ?? '',
                        poster_path: item.poster_path ?? '',
                        overview: item.overview,
                        vote_average: item.vote_average,
                        backdrop_path: item.backdrop_path,
                        genres: item.genres,
                        runtime: item.runtime ?? (item.episode_run_time?.[0] || 0),
                        tagline: item.tagline,
                    };

                    if (mediaItems.length === index + 1) {
                        return <MovieCard ref={lastMediaItemElementRef} key={key} movie={movieProps} mediaType={mediaType} />;
                    }
                    return <MovieCard key={key} movie={movieProps} mediaType={mediaType} />;
                })}
            </ul>
            {loading && <p className="loading-indicator">Carregando mais {mediaType === 'movie' ? 'filmes' : 'séries'}...</p>}
            {!hasMore && mediaItems.length > 0 && <p className="end-of-list-indicator">Você chegou ao fim.</p>}
            {!loading && mediaItems.length === 0 && <p className="end-of-list-indicator">Nenhum {mediaType === 'movie' ? 'filme' : 'série'} encontrado para este gênero.</p>}
        </div>
    );
}