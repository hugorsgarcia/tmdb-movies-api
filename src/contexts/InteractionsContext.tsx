'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useInteractionsStore } from '@/stores/interactionsStore';
import {
  InteractionsContextType,
  WatchLog,
  MediaReview,
  WatchlistItem,
} from '@/types/interactions';

const InteractionsContext = createContext<InteractionsContextType | undefined>(undefined);

export function InteractionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const store = useInteractionsStore();

  // Sync store lifecycle with auth
  useEffect(() => {
    if (user) {
      store.loadInteractions(user.id);
    } else {
      store.clearInteractions();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Bridge: adapt Zustand store to the existing context API
  // The store methods require userId; the context methods don't (they grab it from auth).
  const value: InteractionsContextType = {
    interactions: {
      ratings: store.ratings,
      watchLogs: store.watchLogs,
      reviews: store.reviews,
      watchlist: store.watchlist,
      likes: store.likes,
      lists: store.lists,
    },
    getRating: store.getRating,
    setRating: (mediaId: number, mediaType: 'movie' | 'tv', rating: number) => {
      if (!user) return Promise.resolve();
      return store.setRating(user.id, mediaId, mediaType, rating);
    },
    removeRating: (mediaId: number, mediaType: 'movie' | 'tv') => {
      if (!user) return Promise.resolve();
      return store.removeRating(user.id, mediaId, mediaType);
    },
    isWatched: store.isWatched,
    getWatchLog: store.getWatchLog,
    addWatchLog: (log: Omit<WatchLog, 'id' | 'userId' | 'createdAt'>) => {
      if (!user) return Promise.resolve();
      return store.addWatchLog(user.id, log);
    },
    removeWatchLog: (mediaId: number, mediaType: 'movie' | 'tv') => {
      if (!user) return Promise.resolve();
      return store.removeWatchLog(user.id, mediaId, mediaType);
    },
    getReview: store.getReview,
    addReview: (review: Omit<MediaReview, 'id' | 'userId' | 'username' | 'userAvatar' | 'likes' | 'createdAt' | 'updatedAt'>) => {
      if (!user) return Promise.resolve();
      return store.addReview(user.id, user.username, user.avatar, review);
    },
    updateReview: store.updateReview,
    deleteReview: store.deleteReview,
    isInWatchlist: store.isInWatchlist,
    addToWatchlist: (item: Omit<WatchlistItem, 'id' | 'userId' | 'addedAt'>) => {
      if (!user) return Promise.resolve();
      return store.addToWatchlist(user.id, item);
    },
    removeFromWatchlist: (mediaId: number, mediaType: 'movie' | 'tv') => {
      if (!user) return Promise.resolve();
      return store.removeFromWatchlist(user.id, mediaId, mediaType);
    },
    isLiked: store.isLiked,
    toggleLike: (mediaId: number, mediaType: 'movie' | 'tv', mediaTitle?: string, posterPath?: string) => {
      if (!user) return Promise.resolve();
      return store.toggleLike(user.id, mediaId, mediaType, mediaTitle, posterPath);
    },
    getAllWatchLogs: store.getAllWatchLogs,
    getAllReviews: store.getAllReviews,
    getWatchlist: store.getWatchlist,
    getAllLikes: store.getAllLikes,
    getAllRatings: store.getAllRatings,
    getAllLists: store.getAllLists,
    createList: (name: string, description?: string, isPublic?: boolean) => {
      if (!user) throw new Error('User must be authenticated');
      return store.createList(user.id, name, description, isPublic);
    },
    deleteList: store.deleteList,
    addToList: store.addToList,
    removeFromList: store.removeFromList,
    isInList: store.isInList,
    loading: store.loading,
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
