'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';
import {
  InteractionsContextType,
  UserInteractions,
  MediaRating,
  WatchLog,
  MediaReview,
  WatchlistItem,
  MediaLike,
  MediaList,
} from '@/types/interactions';

const InteractionsContext = createContext<InteractionsContextType | undefined>(undefined);

const EMPTY_INTERACTIONS: UserInteractions = {
  ratings: [],
  watchLogs: [],
  reviews: [],
  watchlist: [],
  likes: [],
  lists: [],
};

export function InteractionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [interactions, setInteractions] = useState<UserInteractions>(EMPTY_INTERACTIONS);
  const [loading, setLoading] = useState(true);

  // ===== LOAD ALL DATA FROM SUPABASE =====
  const loadInteractions = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const [ratingsRes, watchLogsRes, reviewsRes, watchlistRes, likesRes, listsRes] =
        await Promise.all([
          supabase.from('ratings').select('*').eq('user_id', userId),
          supabase.from('watch_logs').select('*').eq('user_id', userId),
          supabase.from('reviews').select('*').eq('user_id', userId),
          supabase.from('watchlist').select('*').eq('user_id', userId),
          supabase.from('likes').select('*').eq('user_id', userId),
          supabase.from('lists').select('*').eq('user_id', userId),
        ]);

      // Para cada lista, carregar seus items
      const listsData = listsRes.data || [];
      const listsWithItems: MediaList[] = await Promise.all(
        listsData.map(async (list) => {
          const { data: items } = await supabase
            .from('list_items')
            .select('*')
            .eq('list_id', list.id);

          return {
            id: list.id,
            name: list.name,
            description: list.description,
            userId: list.user_id,
            movies: (items || []).map((item) => ({
              mediaId: item.media_id,
              mediaType: item.media_type,
              title: item.title,
              posterPath: item.poster_path,
              addedDate: item.added_at,
            })),
            isPublic: list.is_public,
            createdAt: list.created_at,
            updatedAt: list.updated_at,
          };
        })
      );

      // Mapear snake_case → camelCase
      setInteractions({
        ratings: (ratingsRes.data || []).map((r) => ({
          id: r.id,
          userId: r.user_id,
          mediaId: r.media_id,
          mediaType: r.media_type,
          rating: Number(r.rating),
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        })),
        watchLogs: (watchLogsRes.data || []).map((w) => ({
          id: w.id,
          userId: w.user_id,
          mediaId: w.media_id,
          mediaType: w.media_type,
          mediaTitle: w.media_title,
          posterPath: w.poster_path,
          watchedDate: w.watched_date,
          rating: w.rating ? Number(w.rating) : undefined,
          review: w.review,
          createdAt: w.created_at,
        })),
        reviews: (reviewsRes.data || []).map((r) => ({
          id: r.id,
          userId: r.user_id,
          username: '', // será preenchido depois se necessário
          userAvatar: undefined,
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
        })),
        watchlist: (watchlistRes.data || []).map((w) => ({
          id: w.id,
          userId: w.user_id,
          mediaId: w.media_id,
          mediaType: w.media_type,
          mediaTitle: w.media_title,
          posterPath: w.poster_path,
          addedAt: w.added_at,
        })),
        likes: (likesRes.data || []).map((l) => ({
          id: l.id,
          userId: l.user_id,
          mediaId: l.media_id,
          mediaType: l.media_type,
          mediaTitle: l.media_title,
          posterPath: l.poster_path,
          likedAt: l.liked_at,
        })),
        lists: listsWithItems,
      });
    } catch (error) {
      console.error('Erro ao carregar interações do Supabase:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadInteractions(user.id);
    } else {
      setInteractions(EMPTY_INTERACTIONS);
      setLoading(false);
    }
  }, [user, loadInteractions]);

  // ===== RATINGS =====
  const getRating = (mediaId: number, mediaType: 'movie' | 'tv') => {
    return interactions.ratings.find(
      (r) => r.mediaId === mediaId && r.mediaType === mediaType
    );
  };

  const setRating = async (mediaId: number, mediaType: 'movie' | 'tv', rating: number) => {
    if (!user) return;

    const now = new Date().toISOString();
    const existingRating = getRating(mediaId, mediaType);

    // Optimistic update
    if (existingRating) {
      setInteractions((prev) => ({
        ...prev,
        ratings: prev.ratings.map((r) =>
          r.mediaId === mediaId && r.mediaType === mediaType
            ? { ...r, rating, updatedAt: now }
            : r
        ),
      }));
    } else {
      const tempId = crypto.randomUUID();
      const newRating: MediaRating = {
        id: tempId,
        userId: user.id,
        mediaId,
        mediaType,
        rating,
        createdAt: now,
        updatedAt: now,
      };
      setInteractions((prev) => ({
        ...prev,
        ratings: [...prev.ratings, newRating],
      }));
    }

    // Persist to Supabase
    await supabase.from('ratings').upsert(
      {
        user_id: user.id,
        media_id: mediaId,
        media_type: mediaType,
        rating,
        updated_at: now,
      },
      { onConflict: 'user_id,media_id,media_type' }
    );
  };

  const removeRating = async (mediaId: number, mediaType: 'movie' | 'tv') => {
    if (!user) return;

    setInteractions((prev) => ({
      ...prev,
      ratings: prev.ratings.filter(
        (r) => !(r.mediaId === mediaId && r.mediaType === mediaType)
      ),
    }));

    await supabase
      .from('ratings')
      .delete()
      .eq('user_id', user.id)
      .eq('media_id', mediaId)
      .eq('media_type', mediaType);
  };

  // ===== WATCH LOGS =====
  const isWatched = (mediaId: number, mediaType: 'movie' | 'tv') => {
    return interactions.watchLogs.some(
      (log) => log.mediaId === mediaId && log.mediaType === mediaType
    );
  };

  const getWatchLog = (mediaId: number, mediaType: 'movie' | 'tv') => {
    return interactions.watchLogs.find(
      (log) => log.mediaId === mediaId && log.mediaType === mediaType
    );
  };

  const addWatchLog = async (log: Omit<WatchLog, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;

    const tempId = crypto.randomUUID();
    const newLog: WatchLog = {
      ...log,
      id: tempId,
      userId: user.id,
      createdAt: new Date().toISOString(),
    };

    // Optimistic update
    setInteractions((prev) => ({
      ...prev,
      watchLogs: [...prev.watchLogs, newLog],
    }));

    // Persist
    const { data } = await supabase
      .from('watch_logs')
      .insert({
        user_id: user.id,
        media_id: log.mediaId,
        media_type: log.mediaType,
        media_title: log.mediaTitle,
        poster_path: log.posterPath,
        watched_date: log.watchedDate,
        rating: log.rating,
        review: log.review,
      })
      .select()
      .single();

    // Replace temp id with real id
    if (data) {
      setInteractions((prev) => ({
        ...prev,
        watchLogs: prev.watchLogs.map((w) =>
          w.id === tempId ? { ...w, id: data.id } : w
        ),
      }));
    }
  };

  const removeWatchLog = async (mediaId: number, mediaType: 'movie' | 'tv') => {
    if (!user) return;

    setInteractions((prev) => ({
      ...prev,
      watchLogs: prev.watchLogs.filter(
        (log) => !(log.mediaId === mediaId && log.mediaType === mediaType)
      ),
    }));

    await supabase
      .from('watch_logs')
      .delete()
      .eq('user_id', user.id)
      .eq('media_id', mediaId)
      .eq('media_type', mediaType);
  };

  // ===== REVIEWS =====
  const getReview = (mediaId: number, mediaType: 'movie' | 'tv') => {
    return interactions.reviews.find(
      (r) => r.mediaId === mediaId && r.mediaType === mediaType
    );
  };

  const addReview = async (
    review: Omit<
      MediaReview,
      'id' | 'userId' | 'username' | 'userAvatar' | 'likes' | 'createdAt' | 'updatedAt'
    >
  ) => {
    if (!user) return;

    const now = new Date().toISOString();
    const existingReview = getReview(review.mediaId, review.mediaType);

    if (existingReview) {
      // Optimistic update
      setInteractions((prev) => ({
        ...prev,
        reviews: prev.reviews.map((r) =>
          r.mediaId === review.mediaId && r.mediaType === review.mediaType
            ? { ...r, ...review, updatedAt: now }
            : r
        ),
      }));

      await supabase
        .from('reviews')
        .update({
          rating: review.rating,
          review_text: review.reviewText,
          contains_spoilers: review.containsSpoilers,
          updated_at: now,
        })
        .eq('user_id', user.id)
        .eq('media_id', review.mediaId)
        .eq('media_type', review.mediaType);
    } else {
      const tempId = crypto.randomUUID();
      const newReview: MediaReview = {
        ...review,
        id: tempId,
        userId: user.id,
        username: user.username,
        userAvatar: user.avatar,
        likes: 0,
        createdAt: now,
        updatedAt: now,
      };

      setInteractions((prev) => ({
        ...prev,
        reviews: [...prev.reviews, newReview],
      }));

      const { data } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          media_id: review.mediaId,
          media_type: review.mediaType,
          media_title: review.mediaTitle,
          poster_path: review.posterPath,
          rating: review.rating,
          review_text: review.reviewText,
          contains_spoilers: review.containsSpoilers,
        })
        .select()
        .single();

      if (data) {
        setInteractions((prev) => ({
          ...prev,
          reviews: prev.reviews.map((r) =>
            r.id === tempId ? { ...r, id: data.id } : r
          ),
        }));
      }
    }
  };

  const updateReview = async (reviewId: string, reviewText: string, containsSpoilers: boolean) => {
    const now = new Date().toISOString();

    setInteractions((prev) => ({
      ...prev,
      reviews: prev.reviews.map((r) =>
        r.id === reviewId
          ? { ...r, reviewText, containsSpoilers, updatedAt: now }
          : r
      ),
    }));

    await supabase
      .from('reviews')
      .update({
        review_text: reviewText,
        contains_spoilers: containsSpoilers,
        updated_at: now,
      })
      .eq('id', reviewId);
  };

  const deleteReview = async (reviewId: string) => {
    setInteractions((prev) => ({
      ...prev,
      reviews: prev.reviews.filter((r) => r.id !== reviewId),
    }));

    await supabase.from('reviews').delete().eq('id', reviewId);
  };

  // ===== WATCHLIST =====
  const isInWatchlist = (mediaId: number, mediaType: 'movie' | 'tv') => {
    return interactions.watchlist.some(
      (item) => item.mediaId === mediaId && item.mediaType === mediaType
    );
  };

  const addToWatchlist = async (item: Omit<WatchlistItem, 'id' | 'userId' | 'addedAt'>) => {
    if (!user) return;

    const tempId = crypto.randomUUID();
    const newItem: WatchlistItem = {
      ...item,
      id: tempId,
      userId: user.id,
      addedAt: new Date().toISOString(),
    };

    setInteractions((prev) => ({
      ...prev,
      watchlist: [...prev.watchlist, newItem],
    }));

    const { data } = await supabase
      .from('watchlist')
      .insert({
        user_id: user.id,
        media_id: item.mediaId,
        media_type: item.mediaType,
        media_title: item.mediaTitle,
        poster_path: item.posterPath,
      })
      .select()
      .single();

    if (data) {
      setInteractions((prev) => ({
        ...prev,
        watchlist: prev.watchlist.map((w) =>
          w.id === tempId ? { ...w, id: data.id } : w
        ),
      }));
    }
  };

  const removeFromWatchlist = async (mediaId: number, mediaType: 'movie' | 'tv') => {
    if (!user) return;

    setInteractions((prev) => ({
      ...prev,
      watchlist: prev.watchlist.filter(
        (item) => !(item.mediaId === mediaId && item.mediaType === mediaType)
      ),
    }));

    await supabase
      .from('watchlist')
      .delete()
      .eq('user_id', user.id)
      .eq('media_id', mediaId)
      .eq('media_type', mediaType);
  };

  // ===== LIKES =====
  const isLiked = (mediaId: number, mediaType: 'movie' | 'tv') => {
    return interactions.likes.some(
      (like) => like.mediaId === mediaId && like.mediaType === mediaType
    );
  };

  const toggleLike = async (mediaId: number, mediaType: 'movie' | 'tv', mediaTitle?: string, posterPath?: string) => {
    if (!user) return;

    if (isLiked(mediaId, mediaType)) {
      // Remove
      setInteractions((prev) => ({
        ...prev,
        likes: prev.likes.filter(
          (like) => !(like.mediaId === mediaId && like.mediaType === mediaType)
        ),
      }));

      await supabase
        .from('likes')
        .delete()
        .eq('user_id', user.id)
        .eq('media_id', mediaId)
        .eq('media_type', mediaType);
    } else {
      // Add
      const tempId = crypto.randomUUID();
      const newLike: MediaLike = {
        id: tempId,
        userId: user.id,
        mediaId,
        mediaType,
        mediaTitle,
        posterPath,
        likedAt: new Date().toISOString(),
      };

      setInteractions((prev) => ({
        ...prev,
        likes: [...prev.likes, newLike],
      }));

      const { data } = await supabase
        .from('likes')
        .insert({
          user_id: user.id,
          media_id: mediaId,
          media_type: mediaType,
          media_title: mediaTitle,
          poster_path: posterPath,
        })
        .select()
        .single();

      if (data) {
        setInteractions((prev) => ({
          ...prev,
          likes: prev.likes.map((l) =>
            l.id === tempId ? { ...l, id: data.id } : l
          ),
        }));
      }
    }
  };

  // ===== GET ALL DATA FOR PROFILE =====
  const getAllWatchLogs = () => interactions.watchLogs;
  const getAllReviews = () => interactions.reviews;
  const getWatchlist = () => interactions.watchlist;
  const getAllLikes = () => interactions.likes;
  const getAllRatings = () => interactions.ratings;

  // ===== LISTS =====
  const getAllLists = () => interactions.lists || [];

  const createList = (name: string, description?: string, isPublic: boolean = true): MediaList => {
    if (!user) throw new Error('User must be authenticated');

    const tempId = crypto.randomUUID();
    const newList: MediaList = {
      id: tempId,
      name,
      description,
      userId: user.id,
      movies: [],
      isPublic,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setInteractions((prev) => ({
      ...prev,
      lists: [...prev.lists, newList],
    }));

    // Persist async (fire-and-forget com id replacement)
    (async () => {
      const { data } = await supabase
        .from('lists')
        .insert({
          user_id: user.id,
          name,
          description,
          is_public: isPublic,
        })
        .select()
        .single();

      if (data) {
        setInteractions((prev) => ({
          ...prev,
          lists: prev.lists.map((l) =>
            l.id === tempId ? { ...l, id: data.id } : l
          ),
        }));
      }
    })();

    return newList;
  };

  const deleteList = async (listId: string) => {
    setInteractions((prev) => ({
      ...prev,
      lists: prev.lists.filter((list) => list.id !== listId),
    }));

    await supabase.from('lists').delete().eq('id', listId);
  };

  const addToList = async (
    listId: string,
    mediaId: number,
    mediaType: 'movie' | 'tv',
    title: string,
    posterPath?: string
  ) => {
    // Optimistic update
    setInteractions((prev) => ({
      ...prev,
      lists: prev.lists.map((list) => {
        if (list.id === listId) {
          const exists = list.movies.some(
            (m) => m.mediaId === mediaId && m.mediaType === mediaType
          );
          if (exists) return list;

          return {
            ...list,
            movies: [
              ...list.movies,
              {
                mediaId,
                mediaType,
                title,
                posterPath,
                addedDate: new Date().toISOString(),
              },
            ],
            updatedAt: new Date().toISOString(),
          };
        }
        return list;
      }),
    }));

    await supabase.from('list_items').insert({
      list_id: listId,
      media_id: mediaId,
      media_type: mediaType,
      title,
      poster_path: posterPath,
    });

    // Update list timestamp
    await supabase
      .from('lists')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', listId);
  };

  const removeFromList = async (listId: string, mediaId: number, mediaType: 'movie' | 'tv') => {
    setInteractions((prev) => ({
      ...prev,
      lists: prev.lists.map((list) => {
        if (list.id === listId) {
          return {
            ...list,
            movies: list.movies.filter(
              (m) => !(m.mediaId === mediaId && m.mediaType === mediaType)
            ),
            updatedAt: new Date().toISOString(),
          };
        }
        return list;
      }),
    }));

    await supabase
      .from('list_items')
      .delete()
      .eq('list_id', listId)
      .eq('media_id', mediaId)
      .eq('media_type', mediaType);
  };

  const isInList = (listId: string, mediaId: number, mediaType: 'movie' | 'tv'): boolean => {
    const list = interactions.lists.find((l) => l.id === listId);
    if (!list) return false;
    return list.movies.some((m) => m.mediaId === mediaId && m.mediaType === mediaType);
  };

  const value: InteractionsContextType = {
    interactions,
    getRating,
    setRating,
    removeRating,
    isWatched,
    getWatchLog,
    addWatchLog,
    removeWatchLog,
    getReview,
    addReview,
    updateReview,
    deleteReview,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    isLiked,
    toggleLike,
    getAllWatchLogs,
    getAllReviews,
    getWatchlist,
    getAllLikes,
    getAllRatings,
    getAllLists,
    createList,
    deleteList,
    addToList,
    removeFromList,
    isInList,
    loading,
  };

  return (
    <InteractionsContext.Provider value={value}>{children}</InteractionsContext.Provider>
  );
}

export function useInteractions() {
  const context = useContext(InteractionsContext);
  if (context === undefined) {
    throw new Error('useInteractions deve ser usado dentro de um InteractionsProvider');
  }
  return context;
}
