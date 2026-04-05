'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import './page.scss';

type ActivityType = 'watched' | 'rated' | 'reviewed';

interface ActivityItem {
  id: string;
  type: ActivityType;
  userId: string;
  username: string;
  displayName: string;
  avatar: string | null;
  mediaId: number;
  mediaType: string;
  mediaTitle: string;
  posterPath: string | null;
  rating?: number;
  reviewText?: string;
  createdAt: string;
}

const TYPE_LABEL: Record<ActivityType, string> = {
  watched: 'assistiu',
  rated: 'avaliou',
  reviewed: 'escreveu uma crítica de',
};

const TYPE_ICON: Record<ActivityType, string> = {
  watched: '👁',
  rated: '⭐',
  reviewed: '✍️',
};

export default function FeedPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setLoading(false);
      return;
    }

    const loadFeed = async () => {
      setLoading(true);

      // 1. Get IDs of users the current user follows
      const { data: followsData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      const followingIds = (followsData ?? []).map((f) => f.following_id as string);
      setFollowingCount(followingIds.length);

      if (followingIds.length === 0) {
        setActivities([]);
        setLoading(false);
        return;
      }

      // 2. Fetch profiles for followed users in one query
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', followingIds);

      const profileMap = new Map(
        (profilesData ?? []).map((p) => [
          p.id as string,
          { username: p.username as string, displayName: p.display_name as string, avatar: p.avatar_url as string | null },
        ])
      );

      // 3. Fetch recent activity in parallel (last 30 days)
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const [watchLogsRes, ratingsRes, reviewsRes] = await Promise.all([
        supabase
          .from('watch_logs')
          .select('id, user_id, media_id, media_type, media_title, poster_path, created_at')
          .in('user_id', followingIds)
          .gte('created_at', since)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('ratings')
          .select('id, user_id, media_id, media_type, rating, created_at')
          .in('user_id', followingIds)
          .gte('created_at', since)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('reviews')
          .select('id, user_id, media_id, media_type, media_title, poster_path, rating, review_text, created_at')
          .in('user_id', followingIds)
          .gte('created_at', since)
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      // 4. Map to unified ActivityItem[]
      const watchItems: ActivityItem[] = (watchLogsRes.data ?? []).map((w) => {
        const profile = profileMap.get(w.user_id) ?? { username: '', displayName: 'Usuário', avatar: null };
        return {
          id: `watch-${w.id}`,
          type: 'watched',
          userId: w.user_id,
          username: profile.username,
          displayName: profile.displayName,
          avatar: profile.avatar,
          mediaId: w.media_id,
          mediaType: w.media_type,
          mediaTitle: w.media_title,
          posterPath: w.poster_path,
          createdAt: w.created_at,
        };
      });

      const ratingItems: ActivityItem[] = (ratingsRes.data ?? []).map((r) => {
        const profile = profileMap.get(r.user_id) ?? { username: '', displayName: 'Usuário', avatar: null };
        return {
          id: `rating-${r.id}`,
          type: 'rated',
          userId: r.user_id,
          username: profile.username,
          displayName: profile.displayName,
          avatar: profile.avatar,
          mediaId: r.media_id,
          mediaType: r.media_type,
          mediaTitle: '',
          posterPath: null,
          rating: r.rating,
          createdAt: r.created_at,
        };
      });

      const reviewItems: ActivityItem[] = (reviewsRes.data ?? []).map((r) => {
        const profile = profileMap.get(r.user_id) ?? { username: '', displayName: 'Usuário', avatar: null };
        return {
          id: `review-${r.id}`,
          type: 'reviewed',
          userId: r.user_id,
          username: profile.username,
          displayName: profile.displayName,
          avatar: profile.avatar,
          mediaId: r.media_id,
          mediaType: r.media_type,
          mediaTitle: r.media_title,
          posterPath: r.poster_path,
          rating: r.rating ? Number(r.rating) : undefined,
          reviewText: r.review_text,
          createdAt: r.created_at,
        };
      });

      // 5. Merge and sort chronologically
      const all = [...watchItems, ...ratingItems, ...reviewItems].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setActivities(all);
      setLoading(false);
    };

    loadFeed();
  }, [isAuthenticated, user?.id]);

  if (!isAuthenticated) {
    return (
      <div className="feed-page">
        <div className="feed-empty">
          <div className="feed-empty-icon">🔒</div>
          <h2>Faça login para ver o feed</h2>
          <button className="btn-primary" onClick={() => router.push('/login')}>
            Entrar
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="feed-page">
        <div className="feed-loading">Carregando feed...</div>
      </div>
    );
  }

  if (followingCount === 0) {
    return (
      <div className="feed-page">
        <h1 className="feed-title">Feed de Atividades</h1>
        <div className="feed-empty">
          <div className="feed-empty-icon">🎬</div>
          <h2>Seu feed está vazio</h2>
          <p>Siga outros usuários para ver as atividades deles aqui.</p>
          <button className="btn-primary" onClick={() => router.push('/')}>
            Explorar CineSync
          </button>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="feed-page">
        <h1 className="feed-title">Feed de Atividades</h1>
        <div className="feed-empty">
          <div className="feed-empty-icon">📭</div>
          <h2>Nenhuma atividade recente</h2>
          <p>As pessoas que você segue ainda não registraram nada nos últimos 30 dias.</p>
        </div>
      </div>
    );
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="feed-page">
      <h1 className="feed-title">Feed de Atividades</h1>
      <ul className="activity-list">
        {activities.map((item) => (
          <li key={item.id} className="activity-item">
            <div
              className="activity-avatar"
              onClick={() => item.username && router.push(`/profile/${item.username}`)}
              role="button"
              tabIndex={0}
              aria-label={`Perfil de ${item.displayName}`}
            >
              {item.avatar ? (
                <img src={item.avatar} alt={`Avatar de ${item.displayName}`} />
              ) : (
                <span className="avatar-placeholder">{item.displayName.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div className="activity-body">
              <p className="activity-text">
                <button
                  className="activity-user"
                  onClick={() => item.username && router.push(`/profile/${item.username}`)}
                >
                  {item.displayName}
                </button>
                {' '}
                <span className="activity-icon">{TYPE_ICON[item.type]}</span>
                {' '}
                {TYPE_LABEL[item.type]}
                {' '}
                <button
                  className="activity-media"
                  onClick={() => router.push(`/${item.mediaType}/${item.mediaId}`)}
                >
                  {item.mediaTitle || `#${item.mediaId}`}
                </button>
                {item.rating ? <span className="activity-rating"> · {'⭐'.repeat(Math.round(item.rating))}</span> : null}
              </p>
              {item.reviewText && (
                <p className="activity-review-excerpt">
                  "{item.reviewText.length > 120 ? item.reviewText.slice(0, 120) + '…' : item.reviewText}"
                </p>
              )}
              <span className="activity-date">{formatDate(item.createdAt)}</span>
            </div>

            {item.posterPath && (
              <img
                className="activity-poster"
                src={`https://image.tmdb.org/t/p/w92${item.posterPath}`}
                alt={item.mediaTitle}
                onClick={() => router.push(`/${item.mediaType}/${item.mediaId}`)}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
