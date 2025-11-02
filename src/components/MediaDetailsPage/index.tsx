'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import StarRating from '@/components/StarRating';
import InteractiveStarRating from '@/components/InteractiveStarRating';
import QuickActions from '@/components/QuickActions';
import WatchLogModal from '@/components/WatchLogModal';
import ReviewModal from '@/components/ReviewModal';
import ReviewCard from '@/components/ReviewCard';
import ErrorMessage from '@/components/ErrorMessage';
import { useMediaDetails } from '@/hooks/useMediaDetails';
import { useAuth } from '@/contexts/AuthContext';
import { useInteractions } from '@/contexts/InteractionsContext';
import { getBackdropUrl, getPosterUrl } from '@/utils/tmdb';
import styles from './index.module.css';

interface MediaDetailsPageProps {
  mediaType: 'movie' | 'tv';
  id: string;
}

const MediaDetailsPage = ({ mediaType, id }: MediaDetailsPageProps) => {
  const { mediaData, trailerKey, loading, error, retry } = useMediaDetails(mediaType, id);
  const { isAuthenticated } = useAuth();
  const { getRating, setRating, getReview } = useInteractions();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWatchLogModalOpen, setIsWatchLogModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

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

  const mediaIdNum = parseInt(id);
  const userRating = isAuthenticated ? getRating(mediaIdNum, mediaType) : null;
  const userReview = isAuthenticated ? getReview(mediaIdNum, mediaType) : null;

  const handleRatingChange = (newRating: number) => {
    setRating(mediaIdNum, mediaType, newRating);
  };

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
            <span>{mediaData.vote_average?.toFixed(1)} (TMDB)</span>
          </div>

          {isAuthenticated && (
            <div className={styles.userRating}>
              <label>Sua avaliação:</label>
              <InteractiveStarRating
                rating={userRating?.rating || 0}
                onRatingChange={handleRatingChange}
                size="medium"
                showValue
              />
            </div>
          )}

          <div className={styles.quickActions}>
            <QuickActions
              mediaId={mediaIdNum}
              mediaType={mediaType}
              mediaTitle={title || ''}
              posterPath={mediaData.poster_path}
              showLabels
              onWatchClick={() => setIsWatchLogModalOpen(true)}
            />
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

          {isAuthenticated && (
            <div className={styles.reviewSection}>
              <button
                className={styles.reviewButton}
                onClick={() => setIsReviewModalOpen(true)}
              >
                {userReview ? 'Editar Crítica' : 'Escrever Crítica'}
              </button>
            </div>
          )}

          {userReview && (
            <div className={styles.userReviewSection}>
              <h3>Sua Crítica</h3>
              <ReviewCard
                username={userReview.username}
                userAvatar={userReview.userAvatar}
                rating={userReview.rating}
                reviewText={userReview.reviewText}
                containsSpoilers={userReview.containsSpoilers}
                likes={userReview.likes}
                createdAt={userReview.createdAt}
              />
            </div>
          )}
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

      <WatchLogModal
        isOpen={isWatchLogModalOpen}
        onClose={() => setIsWatchLogModalOpen(false)}
        mediaId={mediaIdNum}
        mediaType={mediaType}
        mediaTitle={title || ''}
        posterPath={mediaData.poster_path}
      />

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        mediaId={mediaIdNum}
        mediaType={mediaType}
        mediaTitle={title || ''}
        posterPath={mediaData.poster_path}
      />
    </div>
  );
};

export default MediaDetailsPage;
