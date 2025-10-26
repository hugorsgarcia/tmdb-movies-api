'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from '@/types/user';
import { useParams, useRouter } from 'next/navigation';
import './page.scss';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const [activeTab, setActiveTab] = useState<'watched' | 'reviews' | 'lists'>('watched');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de perfil
    const loadProfile = () => {
      if (!user) {
        setLoading(false);
        return;
      }

      // Dados mockados do perfil
      const mockProfile: UserProfile = {
        ...user,
        stats: {
          totalWatched: 127,
          totalReviews: 45,
          totalLists: 8,
          thisYear: 32,
          averageRating: 4.2,
        },
        recentWatched: [
          {
            id: 1,
            movieId: 550,
            title: 'Clube da Luta',
            posterPath: '/bptfVGEQuv6vDTIMVCHjJ9Dz8PX.jpg',
            watchedDate: new Date().toISOString(),
            rating: 5,
          },
          {
            id: 2,
            movieId: 680,
            title: 'Pulp Fiction',
            posterPath: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
            watchedDate: new Date(Date.now() - 86400000).toISOString(),
            rating: 4.5,
          },
        ],
        recentReviews: [
          {
            id: '1',
            movieId: 550,
            movieTitle: 'Clube da Luta',
            posterPath: '/bptfVGEQuv6vDTIMVCHjJ9Dz8PX.jpg',
            userId: user.id,
            username: user.username,
            rating: 5,
            reviewText: 'Uma obra-prima do cinema contemporâneo. A direção de Fincher é impecável.',
            createdAt: new Date().toISOString(),
            likes: 12,
          },
        ],
        lists: [
          {
            id: '1',
            name: 'Favoritos de 2024',
            description: 'Meus filmes favoritos de 2024',
            userId: user.id,
            movies: [],
            isPublic: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      };

      setProfile(mockProfile);
      setLoading(false);
    };

    loadProfile();
  }, [user, username]);

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading">Carregando perfil...</div>
      </div>
    );
  }

  if (!isAuthenticated || !profile) {
    return (
      <div className="profile-page">
        <div className="not-found">
          <h1>Faça login para ver seu perfil</h1>
          <button onClick={() => router.push('/login')} className="btn-primary">
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-banner"></div>
        <div className="profile-info">
          <div className="avatar-container">
            <img src={profile.avatar} alt={profile.displayName} className="avatar" />
          </div>
          <div className="user-details">
            <h1>{profile.displayName}</h1>
            <p className="username">@{profile.username}</p>
            {profile.bio && <p className="bio">{profile.bio}</p>}
            <div className="meta-info">
              {profile.location && <span>📍 {profile.location}</span>}
              <span>📅 Entrou em {formatDate(profile.joinedDate)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-item">
          <span className="stat-number">{profile.stats.totalWatched}</span>
          <span className="stat-label">Filmes</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{profile.stats.thisYear}</span>
          <span className="stat-label">Este ano</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{profile.stats.totalReviews}</span>
          <span className="stat-label">Avaliações</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{profile.stats.totalLists}</span>
          <span className="stat-label">Listas</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{profile.stats.averageRating.toFixed(1)}</span>
          <span className="stat-label">Média</span>
        </div>
      </div>

      <div className="profile-content">
        <div className="tabs">
          <button
            className={activeTab === 'watched' ? 'active' : ''}
            onClick={() => setActiveTab('watched')}
          >
            Assistidos
          </button>
          <button
            className={activeTab === 'reviews' ? 'active' : ''}
            onClick={() => setActiveTab('reviews')}
          >
            Avaliações
          </button>
          <button
            className={activeTab === 'lists' ? 'active' : ''}
            onClick={() => setActiveTab('lists')}
          >
            Listas
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'watched' && (
            <div className="watched-grid">
              {profile.recentWatched.length > 0 ? (
                profile.recentWatched.map((movie) => (
                  <div key={movie.id} className="movie-poster-card">
                    <img
                      src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                      alt={movie.title}
                      onClick={() => router.push(`/movie/${movie.movieId}`)}
                    />
                    {movie.rating && (
                      <div className="rating-badge">
                        ⭐ {movie.rating}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="empty-state">Nenhum filme assistido ainda</p>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-list">
              {profile.recentReviews.length > 0 ? (
                profile.recentReviews.map((review) => (
                  <div key={review.id} className="review-card">
                    <img
                      src={`https://image.tmdb.org/t/p/w200${review.posterPath}`}
                      alt={review.movieTitle}
                      className="review-poster"
                    />
                    <div className="review-content">
                      <h3>{review.movieTitle}</h3>
                      <div className="review-rating">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </div>
                      <p className="review-text">{review.reviewText}</p>
                      <div className="review-meta">
                        <span>{formatDate(review.createdAt)}</span>
                        <span>❤️ {review.likes}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-state">Nenhuma avaliação ainda</p>
              )}
            </div>
          )}

          {activeTab === 'lists' && (
            <div className="lists-grid">
              {profile.lists.length > 0 ? (
                profile.lists.map((list) => (
                  <div key={list.id} className="list-card">
                    <h3>{list.name}</h3>
                    {list.description && <p>{list.description}</p>}
                    <div className="list-meta">
                      <span>{list.movies.length} filmes</span>
                      <span>{list.isPublic ? '🌍 Pública' : '🔒 Privada'}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-state">Nenhuma lista criada ainda</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
