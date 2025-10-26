'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import StarRating from '@/components/StarRating';
import ErrorMessage from '@/components/ErrorMessage';
import { useMediaDetails } from '@/hooks/useMediaDetails';
import { getBackdropUrl, getPosterUrl } from '@/utils/tmdb';
import styles from './index.module.css';

interface MediaDetailsPageProps {
  mediaType: 'movie' | 'tv';
  id: string;
}

const MediaDetailsPage = ({ mediaType, id }: MediaDetailsPageProps) => {
  const { mediaData, trailerKey, loading, error, retry } = useMediaDetails(mediaType, id);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Carregando...</p>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={retry} />;
  }

  if (!mediaData) {
    return <ErrorMessage message="Conteúdo não encontrado." />;
  }

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const title = mediaType === 'movie' ? mediaData.title : mediaData.name;
  const releaseDate = mediaType === 'movie' ? mediaData.release_date : mediaData.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
  const runtime = mediaType === 'movie' 
    ? mediaData.runtime 
    : (mediaData.episode_run_time && mediaData.episode_run_time.length > 0 ? mediaData.episode_run_time[0] : null);

  return (
    <div className={styles.moviePage}>
      <div 
        className={styles.backdrop}
        style={{ backgroundImage: `url(${getBackdropUrl(mediaData.backdrop_path)})` }}
      ></div>

      <div className={styles.content}>
        <Image 
          src={getPosterUrl(mediaData.poster_path ?? null) || '/placeholder.png'} 
          alt={title || 'Media poster'} 
          width={250}
          height={375}
          className={styles.poster}
          priority
        />
        <div className={styles.details}>
          <h1 className={styles.title}>{title}</h1>
          {mediaData.tagline && <p className={styles.tagline}>{mediaData.tagline}</p>}
          
          <div className={styles.rating}>
            <StarRating rating={mediaData.vote_average} />
            <span>{mediaData.vote_average?.toFixed(1)}</span>
          </div>

          <div className={styles.info}>
            <p>{year}</p>
            {runtime && <p>{formatRuntime(runtime)}</p>}
          </div>

          <div className={styles.genres}>
            {mediaData.genres?.map(genre => (
              <span key={genre.id} className={styles.genre}>{genre.name}</span>
            ))}
          </div>

          {trailerKey && (
            <button className={styles.trailerButton} onClick={() => setIsModalOpen(true)}>
              Assistir Trailer
            </button>
          )}

          <p className={styles.overview}>{mediaData.overview}</p>
        </div>
      </div>

      {isModalOpen && trailerKey && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>×</button>
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}`}
              title="YouTube video player"
              style={{ border: 0 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaDetailsPage;
