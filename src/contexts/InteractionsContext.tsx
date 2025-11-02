'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
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

export function InteractionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [interactions, setInteractions] = useState<UserInteractions>({
    ratings: [],
    watchLogs: [],
    reviews: [],
    watchlist: [],
    likes: [],
    lists: [],
  });
  const [loading, setLoading] = useState(true);

  // Carregar interações do localStorage ao iniciar
  useEffect(() => {
    if (user) {
      const storageKey = `interactions_${user.id}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          setInteractions(JSON.parse(stored));
        } catch (error) {
          console.error('Erro ao carregar interações:', error);
        }
      }
    } else {
      setInteractions({
        ratings: [],
        watchLogs: [],
        reviews: [],
        watchlist: [],
        likes: [],
        lists: [],
      });
    }
    setLoading(false);
  }, [user]);

  // Salvar interações no localStorage sempre que mudarem
  useEffect(() => {
    if (user && !loading) {
      const storageKey = `interactions_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(interactions));
    }
  }, [interactions, user, loading]);

  // ===== RATINGS =====
  const getRating = (mediaId: number, mediaType: 'movie' | 'tv') => {
    return interactions.ratings.find(
      (r) => r.mediaId === mediaId && r.mediaType === mediaType
    );
  };

  const setRating = (mediaId: number, mediaType: 'movie' | 'tv', rating: number) => {
    if (!user) return;

    const now = new Date().toISOString();
    const existingRating = getRating(mediaId, mediaType);

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
      const newRating: MediaRating = {
        id: Date.now().toString(),
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
  };

  const removeRating = (mediaId: number, mediaType: 'movie' | 'tv') => {
    setInteractions((prev) => ({
      ...prev,
      ratings: prev.ratings.filter(
        (r) => !(r.mediaId === mediaId && r.mediaType === mediaType)
      ),
    }));
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

  const addWatchLog = (log: Omit<WatchLog, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;

    const newLog: WatchLog = {
      ...log,
      id: Date.now().toString(),
      userId: user.id,
      createdAt: new Date().toISOString(),
    };

    setInteractions((prev) => ({
      ...prev,
      watchLogs: [...prev.watchLogs, newLog],
    }));
  };

  const removeWatchLog = (mediaId: number, mediaType: 'movie' | 'tv') => {
    setInteractions((prev) => ({
      ...prev,
      watchLogs: prev.watchLogs.filter(
        (log) => !(log.mediaId === mediaId && log.mediaType === mediaType)
      ),
    }));
  };

  // ===== REVIEWS =====
  const getReview = (mediaId: number, mediaType: 'movie' | 'tv') => {
    return interactions.reviews.find(
      (r) => r.mediaId === mediaId && r.mediaType === mediaType
    );
  };

  const addReview = (
    review: Omit<
      MediaReview,
      'id' | 'userId' | 'username' | 'userAvatar' | 'likes' | 'createdAt' | 'updatedAt'
    >
  ) => {
    if (!user) return;

    const now = new Date().toISOString();
    const existingReview = getReview(review.mediaId, review.mediaType);

    if (existingReview) {
      setInteractions((prev) => ({
        ...prev,
        reviews: prev.reviews.map((r) =>
          r.mediaId === review.mediaId && r.mediaType === review.mediaType
            ? { ...r, ...review, updatedAt: now }
            : r
        ),
      }));
    } else {
      const newReview: MediaReview = {
        ...review,
        id: Date.now().toString(),
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
    }
  };

  const updateReview = (reviewId: string, reviewText: string, containsSpoilers: boolean) => {
    setInteractions((prev) => ({
      ...prev,
      reviews: prev.reviews.map((r) =>
        r.id === reviewId
          ? { ...r, reviewText, containsSpoilers, updatedAt: new Date().toISOString() }
          : r
      ),
    }));
  };

  const deleteReview = (reviewId: string) => {
    setInteractions((prev) => ({
      ...prev,
      reviews: prev.reviews.filter((r) => r.id !== reviewId),
    }));
  };

  // ===== WATCHLIST =====
  const isInWatchlist = (mediaId: number, mediaType: 'movie' | 'tv') => {
    return interactions.watchlist.some(
      (item) => item.mediaId === mediaId && item.mediaType === mediaType
    );
  };

  const addToWatchlist = (item: Omit<WatchlistItem, 'id' | 'userId' | 'addedAt'>) => {
    if (!user) return;

    const newItem: WatchlistItem = {
      ...item,
      id: Date.now().toString(),
      userId: user.id,
      addedAt: new Date().toISOString(),
    };

    setInteractions((prev) => ({
      ...prev,
      watchlist: [...prev.watchlist, newItem],
    }));
  };

  const removeFromWatchlist = (mediaId: number, mediaType: 'movie' | 'tv') => {
    setInteractions((prev) => ({
      ...prev,
      watchlist: prev.watchlist.filter(
        (item) => !(item.mediaId === mediaId && item.mediaType === mediaType)
      ),
    }));
  };

  // ===== LIKES =====
  const isLiked = (mediaId: number, mediaType: 'movie' | 'tv') => {
    return interactions.likes.some(
      (like) => like.mediaId === mediaId && like.mediaType === mediaType
    );
  };

  const toggleLike = (mediaId: number, mediaType: 'movie' | 'tv', mediaTitle?: string, posterPath?: string) => {
    if (!user) return;

    if (isLiked(mediaId, mediaType)) {
      setInteractions((prev) => ({
        ...prev,
        likes: prev.likes.filter(
          (like) => !(like.mediaId === mediaId && like.mediaType === mediaType)
        ),
      }));
    } else {
      const newLike: MediaLike = {
        id: Date.now().toString(),
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
    }
  };

  // ===== GET ALL DATA FOR PROFILE =====
  const getAllWatchLogs = () => {
    return interactions.watchLogs;
  };

  const getAllReviews = () => {
    return interactions.reviews;
  };

  const getWatchlist = () => {
    return interactions.watchlist;
  };

  const getAllLikes = () => {
    return interactions.likes;
  };

  const getAllRatings = () => {
    return interactions.ratings;
  };

  // ===== LISTS =====
  const getAllLists = () => {
    return interactions.lists || [];
  };

  const createList = (name: string, description?: string, isPublic: boolean = true): MediaList => {
    if (!user) throw new Error('User must be authenticated');

    const newList: MediaList = {
      id: Date.now().toString(),
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

    return newList;
  };

  const deleteList = (listId: string) => {
    setInteractions((prev) => ({
      ...prev,
      lists: prev.lists.filter((list) => list.id !== listId),
    }));
  };

  const addToList = (
    listId: string,
    mediaId: number,
    mediaType: 'movie' | 'tv',
    title: string,
    posterPath?: string
  ) => {
    setInteractions((prev) => ({
      ...prev,
      lists: prev.lists.map((list) => {
        if (list.id === listId) {
          // Check if media already exists in list
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
  };

  const removeFromList = (listId: string, mediaId: number, mediaType: 'movie' | 'tv') => {
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
