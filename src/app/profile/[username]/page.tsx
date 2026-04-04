'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useInteractions } from '@/contexts/InteractionsContext';
import { UserProfile } from '@/types/user';
import { useParams, useRouter } from 'next/navigation';
import './page.scss';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const { 
    getAllWatchLogs, 
    getAllReviews, 
    getWatchlist, 
    getAllLikes,
    getAllRatings,
    getAllLists,
    createList,
    deleteList 
  } = useInteractions();
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const [activeTab, setActiveTab] = useState<'watched' | 'reviews' | 'lists' | 'likes'>('watched');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateListForm, setShowCreateListForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [listToDelete, setListToDelete] = useState<string | null>(null);

  useEffect(() => {
    // Carregar perfil com dados reais
    const loadProfile = () => {
      if (!user) {
        setLoading(false);
        return;
      }

      // Obter dados reais do InteractionsContext
      const watchLogs = getAllWatchLogs();
      const reviews = getAllReviews();
      const watchlist = getWatchlist();
      const ratings = getAllRatings();

      // Calcular estatísticas
      const currentYear = new Date().getFullYear();
      const thisYearWatched = watchLogs.filter((log: { watchedDate: string }) => 
        new Date(log.watchedDate).getFullYear() === currentYear
      ).length;

      const averageRating = ratings.length > 0
        ? ratings.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / ratings.length
        : 0;

      // Usar a estrutura nativa de WatchLog e MediaReview
      const recentWatched = watchLogs
        .sort((a, b) => new Date(b.watchedDate).getTime() - new Date(a.watchedDate).getTime());

      const recentReviews = reviews
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const realProfile: UserProfile = {
        ...user,
        stats: {
          totalWatched: watchLogs.length,
          totalReviews: reviews.length,
          totalLists: watchlist.length, // Usando watchlist como "listas" por enquanto
          thisYear: thisYearWatched,
          averageRating: averageRating,
        },
        recentWatched,
        recentReviews,
        lists: getAllLists(), 
      };

      setProfile(realProfile);
      setLoading(false);
    };

    loadProfile();
  }, [user, username, getAllWatchLogs, getAllReviews, getWatchlist, getAllLikes, getAllRatings]);

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
          <span className="stat-number">{getAllWatchLogs().length}</span>
          <span className="stat-label">Assistidos</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{getAllReviews().length}</span>
          <span className="stat-label">Avaliações</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{getAllLists().length}</span>
          <span className="stat-label">Listas</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{getAllLikes().length}</span>
          <span className="stat-label">Curtidas</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {getAllRatings().length > 0 
              ? (getAllRatings().reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / getAllRatings().length).toFixed(1)
              : '0.0'}
          </span>
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
          <button
            className={activeTab === 'likes' ? 'active' : ''}
            onClick={() => setActiveTab('likes')}
          >
            Curtidas
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
                      alt={movie.mediaTitle}
                      onClick={() => router.push(`/${movie.mediaType || 'movie'}/${movie.mediaId}`)}
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
                      alt={review.mediaTitle}
                      className="review-poster"
                    />
                    <div className="review-content">
                      <h3>{review.mediaTitle}</h3>
                      <div className="review-rating">
                        {'★'.repeat(review.rating || 0)}{'☆'.repeat(5 - (review.rating || 0))}
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
            <div className="lists-section">
              <div className="lists-header">
                <h3>Minhas Listas</h3>
                <button
                  className="btn-create-list"
                  onClick={() => setShowCreateListForm(!showCreateListForm)}
                >
                  {showCreateListForm ? 'Cancelar' : '+ Nova Lista'}
                </button>
              </div>

              {showCreateListForm && (
                <div className="create-list-form">
                  <input
                    type="text"
                    placeholder="Nome da lista"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    maxLength={50}
                  />
                  <textarea
                    placeholder="Descrição (opcional)"
                    value={newListDescription}
                    onChange={(e) => setNewListDescription(e.target.value)}
                    maxLength={200}
                    rows={3}
                  />
                  <button
                    className="btn-submit"
                    onClick={() => {
                      if (newListName.trim()) {
                        createList(newListName, newListDescription || undefined, true);
                        setNewListName('');
                        setNewListDescription('');
                        setShowCreateListForm(false);
                      }
                    }}
                    disabled={!newListName.trim()}
                  >
                    Criar Lista
                  </button>
                </div>
              )}

              <div className="lists-grid">
                {getAllLists().length > 0 ? (
                  getAllLists().map((list) => (
                    <div key={list.id} className="list-card">
                      <div className="list-header">
                        <h3>{list.name}</h3>
                        <div className="list-actions" style={{ marginLeft: 'auto' }}>
                          {listToDelete === list.id ? (
                            <div className="confirm-delete" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.8.5rem', color: 'var(--danger-color, #ff4d4d)' }}>Excluir lista?</span>
                              <button className="btn-delete confirm-btn" style={{ color: 'var(--danger-color, #ff4d4d)' }} onClick={() => {
                                deleteList(list.id);
                                setListToDelete(null);
                              }}>Sim</button>
                              <button className="btn-delete cancel-btn" onClick={() => setListToDelete(null)}>Não</button>
                            </div>
                          ) : (
                            <button
                              className="btn-delete"
                              onClick={() => setListToDelete(list.id)}
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>
                      {list.description && <p className="list-description">{list.description}</p>}
                      
                      {list.movies.length > 0 ? (
                        <div className="list-movies-preview">
                          {list.movies.slice(0, 4).map((movie) => (
                            <div key={`${movie.mediaId}-${movie.mediaType}`} className="mini-poster">
                              {movie.posterPath && (
                                <img
                                  src={`https://image.tmdb.org/t/p/w200${movie.posterPath}`}
                                  alt={movie.title}
                                  onClick={() => router.push(`/${movie.mediaType}/${movie.mediaId}`)}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="empty-list">Lista vazia</div>
                      )}
                      
                      <div className="list-meta">
                        <span>{list.movies.length} {list.movies.length === 1 ? 'filme' : 'filmes'}</span>
                        <span>{list.isPublic ? '🌍 Pública' : '🔒 Privada'}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-state">Nenhuma lista criada ainda. Crie sua primeira lista!</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'likes' && (
            <div className="watched-grid">
              {getAllLikes().length > 0 ? (
                getAllLikes().map((like) => (
                  <div key={like.id} className="movie-poster-card">
                    {like.posterPath && (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${like.posterPath}`}
                        alt={like.mediaTitle || 'Liked media'}
                        onClick={() => router.push(`/${like.mediaType}/${like.mediaId}`)}
                      />
                    )}
                    <div className="like-badge">
                      ❤️
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-state">Nenhum filme curtido ainda</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
