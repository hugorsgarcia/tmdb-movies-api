'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useInteractions } from '@/contexts/InteractionsContext';
import { UserProfile } from '@/types/user';
import { MediaReview } from '@/types/interactions';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import './page.scss';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const { 
    interactions,
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

  const [activeTab, setActiveTab] = useState<'watched' | 'reviews' | 'lists' | 'likes'>('reviews');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateListForm, setShowCreateListForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [listToDelete, setListToDelete] = useState<string | null>(null);

  // Determinar se é o perfil do próprio usuário
  const isOwnProfile = useMemo(() => {
    return isAuthenticated && user?.username === username;
  }, [isAuthenticated, user?.username, username]);

  // DEV-007: useMemo para evitar chamadas repetidas no render
  const watchLogs = useMemo(() => getAllWatchLogs(), [interactions]); // eslint-disable-line react-hooks/exhaustive-deps
  const reviews = useMemo(() => getAllReviews(), [interactions]); // eslint-disable-line react-hooks/exhaustive-deps
  const watchlist = useMemo(() => getWatchlist(), [interactions]); // eslint-disable-line react-hooks/exhaustive-deps
  const likes = useMemo(() => getAllLikes(), [interactions]); // eslint-disable-line react-hooks/exhaustive-deps
  const ratings = useMemo(() => getAllRatings(), [interactions]); // eslint-disable-line react-hooks/exhaustive-deps
  const lists = useMemo(() => getAllLists(), [interactions]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);

      if (isOwnProfile && user) {
        // Perfil próprio: usar dados do context
        const currentYear = new Date().getFullYear();
        const thisYearWatched = watchLogs.filter((log) => 
          new Date(log.watchedDate).getFullYear() === currentYear
        ).length;

        const averageRating = ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
          : 0;

        const recentWatched = [...watchLogs]
          .sort((a, b) => new Date(b.watchedDate).getTime() - new Date(a.watchedDate).getTime());

        const recentReviews = [...reviews]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const realProfile: UserProfile = {
          ...user,
          stats: {
            totalWatched: watchLogs.length,
            totalReviews: reviews.length,
            totalLists: lists.length,
            thisYear: thisYearWatched,
            averageRating,
          },
          recentWatched,
          recentReviews,
          lists,
        };

        setProfile(realProfile);
        setActiveTab('watched');
        setLoading(false);
      } else {
        // PM-002: Perfil de terceiros — buscar dados públicos
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('username', username)
            .single();
          
          if (profileError || !profileData) {
            setProfile(null);
            setLoading(false);
            return;
          }

          // Buscar reviews públicas deste usuário
          const { data: publicReviews } = await supabase
            .from('reviews')
            .select('*')
            .eq('user_id', profileData.id)
            .order('created_at', { ascending: false });

          const mappedReviews: MediaReview[] = (publicReviews || []).map((r) => ({
            id: r.id,
            userId: r.user_id,
            username: profileData.username,
            userAvatar: profileData.avatar_url,
            mediaId: r.media_id,
            mediaType: r.media_type,
            mediaTitle: r.media_title,
            posterPath: r.poster_path,
            rating: r.rating ? Number(r.rating) : undefined,
            reviewText: r.review_text,
            containsSpoilers: r.contains_spoilers,
            likes: r.likes_count,
            createdAt: r.created_at,
            updatedAt: r.updated_at,
          }));

          const publicProfile: UserProfile = {
            id: profileData.id,
            username: profileData.username,
            email: '',
            displayName: profileData.display_name,
            avatar: profileData.avatar_url,
            bio: profileData.bio,
            location: profileData.location,
            website: profileData.website,
            joinedDate: profileData.joined_date,
            stats: {
              totalWatched: 0,
              totalReviews: mappedReviews.length,
              totalLists: 0,
              thisYear: 0,
              averageRating: 0,
            },
            recentWatched: [],
            recentReviews: mappedReviews,
            lists: [],
          };

          setProfile(publicProfile);
          setActiveTab('reviews');
        } catch (err) {
          console.error('Erro ao carregar perfil público:', err);
          setProfile(null);
        }
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, username, isOwnProfile, watchLogs, reviews, watchlist, likes, ratings, lists]);

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading">Carregando perfil...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="not-found">
          <h1>Usuário não encontrado</h1>
          <p>O perfil @{username} não existe.</p>
          <button onClick={() => router.push('/')} className="btn-primary">
            Voltar ao início
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
            <img src={profile.avatar} alt={`Avatar de ${profile.displayName}`} className="avatar" />
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
        {isOwnProfile && (
          <>
            <div className="stat-item">
              <span className="stat-number">{watchLogs.length}</span>
              <span className="stat-label">Assistidos</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{likes.length}</span>
              <span className="stat-label">Curtidas</span>
            </div>
          </>
        )}
        <div className="stat-item">
          <span className="stat-number">{profile.stats.totalReviews}</span>
          <span className="stat-label">Avaliações</span>
        </div>
        {isOwnProfile && (
          <>
            <div className="stat-item">
              <span className="stat-number">{lists.length}</span>
              <span className="stat-label">Listas</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {ratings.length > 0 
                  ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
                  : '0.0'}
              </span>
              <span className="stat-label">Média</span>
            </div>
          </>
        )}
      </div>

      <div className="profile-content">
        <div className="tabs">
          {isOwnProfile && (
            <button
              className={activeTab === 'watched' ? 'active' : ''}
              onClick={() => setActiveTab('watched')}
            >
              Assistidos
            </button>
          )}
          <button
            className={activeTab === 'reviews' ? 'active' : ''}
            onClick={() => setActiveTab('reviews')}
          >
            Avaliações
          </button>
          {isOwnProfile && (
            <>
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
            </>
          )}
        </div>

        <div className="tab-content">
          {activeTab === 'watched' && isOwnProfile && (
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

          {activeTab === 'lists' && isOwnProfile && (
            <div className="lists-section">
              <div className="lists-header">
                <h3>Minhas Listas</h3>
                <button
                  className="btn-create-list"
                  onClick={() => setShowCreateListForm(!showCreateListForm)}
                  aria-label={showCreateListForm ? 'Cancelar criação de lista' : 'Criar nova lista'}
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
                    aria-label="Nome da lista"
                  />
                  <textarea
                    placeholder="Descrição (opcional)"
                    value={newListDescription}
                    onChange={(e) => setNewListDescription(e.target.value)}
                    maxLength={200}
                    rows={3}
                    aria-label="Descrição da lista"
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
                {lists.length > 0 ? (
                  lists.map((list) => (
                    <div key={list.id} className="list-card">
                      <div className="list-header">
                        <h3>{list.name}</h3>
                        <div className="list-actions" style={{ marginLeft: 'auto' }}>
                          {listToDelete === list.id ? (
                            <div className="confirm-delete" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.85rem', color: 'var(--danger-color, #ff4d4d)' }}>Excluir lista?</span>
                              <button className="btn-delete confirm-btn" style={{ color: 'var(--danger-color, #ff4d4d)' }} onClick={() => {
                                deleteList(list.id);
                                setListToDelete(null);
                              }} aria-label="Confirmar exclusão">Sim</button>
                              <button className="btn-delete cancel-btn" onClick={() => setListToDelete(null)} aria-label="Cancelar exclusão">Não</button>
                            </div>
                          ) : (
                            <button
                              className="btn-delete"
                              onClick={() => setListToDelete(list.id)}
                              aria-label={`Excluir lista ${list.name}`}
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

          {activeTab === 'likes' && isOwnProfile && (
            <div className="watched-grid">
              {likes.length > 0 ? (
                likes.map((like) => (
                  <div key={like.id} className="movie-poster-card">
                    {like.posterPath && (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${like.posterPath}`}
                        alt={like.mediaTitle || 'Mídia curtida'}
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
