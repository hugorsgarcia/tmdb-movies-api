"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StarRating from '@/components/StarRating';
import { MediaItem } from '@/types/media';
import styles from './page.module.css';

const TvDetailsPage = ({ params }: { params: { id: string } }) => {
  const [tv, setTv] = useState<MediaItem | null>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const getTvDetails = async () => {
      try {
        const tvResponse = await axios.get(`https://api.themoviedb.org/3/tv/${params.id}`, {
          params: {
            api_key: 'acc2bc295985c96b273c383bf2c6e62a',
            language: 'pt-BR',
          },
        });
        setTv(tvResponse.data);

        const videosResponse = await axios.get(`https://api.themoviedb.org/3/tv/${params.id}/videos`, {
          params: {
            api_key: 'acc2bc295985c96b273c383bf2c6e62a',
            language: 'en-US',
          },
        });

        const officialTrailer = (videosResponse.data.results as Array<{ type: string; site: string; key: string; }>).find(
          (video) => video.type === 'Trailer' && video.site === 'YouTube'
        );

        setTrailerKey(officialTrailer?.key || null);

      } catch (error) {
        console.error('Error fetching TV details:', error);
      }
    };

    getTvDetails();
  }, [params.id]);

  if (!tv) {
    return <div>Loading...</div>;
  }

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const title = tv.name;
  const year = tv.first_air_date ? new Date(tv.first_air_date).getFullYear() : '';

  const runtime = tv.episode_run_time && tv.episode_run_time.length > 0 ? tv.episode_run_time[0] : null;

  return (
    <div className={styles.moviePage}>
      <div 
        className={styles.backdrop}
        style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${tv.backdrop_path})` }}
      ></div>

      <div className={styles.content}>
        <img 
          src={`https://image.tmdb.org/t/p/w500${tv.poster_path}`} 
          alt={title}
          className={styles.poster}
        />
        <div className={styles.details}>
          <h1 className={styles.title}>{title}</h1>
          {tv.tagline && <p className={styles.tagline}>{tv.tagline}</p>}
          
          <div className={styles.rating}>
            <StarRating rating={tv.vote_average} />
            <span>{tv.vote_average?.toFixed(1)}</span>
          </div>

          <div className={styles.info}>
            <p>{year}</p>
            {runtime && <p>{formatRuntime(runtime)}</p>}
          </div>

          <div className={styles.genres}>
            {tv.genres.map((genre: any) => (
              <span key={genre.id} className={styles.genre}>{genre.name}</span>
            ))}
          </div>

          {trailerKey && (
            <button className={styles.trailerButton} onClick={() => setIsModalOpen(true)}>
              Assistir Trailer
            </button>
          )}

          <p className={styles.overview}>{tv.overview}</p>
        </div>
      </div>

      {isModalOpen && trailerKey && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>×</button>
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default TvDetailsPage;
