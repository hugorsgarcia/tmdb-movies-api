'use client';

import React, { useState, useEffect, use } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { Movie } from '@/types/movie';
import StarRating from '@/components/StarRating';
import styles from './page.module.css';

interface PageProps {
  params: Promise<{ id: string }>;
}

const MovieDetailsPage = ({ params }: PageProps) => {
  const { id } = use(params);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const getMovieDetails = async () => {
      try {
        const movieResponse = await axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
          params: {
            api_key: 'acc2bc295985c96b273c383bf2c6e62a',
            language: 'pt-BR',
          },
        });
        setMovie(movieResponse.data);

        const videosResponse = await axios.get(`https://api.themoviedb.org/3/movie/${id}/videos`, {
          params: {
            api_key: 'acc2bc295985c96b273c383bf2c6e62a',
            language: 'en-US', 
          },
        });

        interface VideoResult {
          type: string;
          site: string;
          key: string;
        }

        const officialTrailer = (videosResponse.data.results as VideoResult[]).find(
          (video) => video.type === 'Trailer' && video.site === 'YouTube'
        );

        setTrailerKey(officialTrailer?.key || null);

      } catch (error) {
        console.error('Error fetching movie details:', error);
      }
    };

    getMovieDetails();
  }, [id]);

  if (!movie) {
    return <div>Loading...</div>;
  }

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className={styles.moviePage}>
      <div 
        className={styles.backdrop}
        style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})` }}
      ></div>

      <div className={styles.content}>
        <Image 
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
          alt={movie.title} 
          width={250}
          height={375}
          className={styles.poster}
          priority
        />
        <div className={styles.details}>
          <h1 className={styles.title}>{movie.title}</h1>
          {movie.tagline && <p className={styles.tagline}>{movie.tagline}</p>}
          
          <div className={styles.rating}>
            <StarRating rating={movie.vote_average} />
            <span>{movie.vote_average.toFixed(1)}</span>
          </div>

          <div className={styles.info}>
            <p>{new Date(movie.release_date).getFullYear()}</p>
            {movie.runtime && <p>{formatRuntime(movie.runtime)}</p>}
          </div>

          <div className={styles.genres}>
            {movie.genres.map(genre => (
              <span key={genre.id} className={styles.genre}>{genre.name}</span>
            ))}
          </div>

          {trailerKey && (
            <button className={styles.trailerButton} onClick={() => setIsModalOpen(true)}>
              Assistir Trailer
            </button>
          )}

          <p className={styles.overview}>{movie.overview}</p>
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

export default MovieDetailsPage;
