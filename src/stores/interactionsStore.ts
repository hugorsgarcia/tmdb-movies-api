import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { InteractionsState } from './types';
import { createRatingsSlice } from './slices/ratingsSlice';
import { createWatchLogsSlice } from './slices/watchLogsSlice';
import { createReviewsSlice } from './slices/reviewsSlice';
import { createWatchlistSlice } from './slices/watchlistSlice';
import { createLikesSlice } from './slices/likesSlice';
import { createListsSlice } from './slices/listsSlice';
import { MediaList } from '@/types/interactions';

export const useInteractionsStore = create<InteractionsState>((set, get, api) => ({
  ...createRatingsSlice(set, get, api),
  ...createWatchLogsSlice(set, get, api),
  ...createReviewsSlice(set, get, api),
  ...createWatchlistSlice(set, get, api),
  ...createLikesSlice(set, get, api),
  ...createListsSlice(set, get, api),

  loading: true,

  loadInteractions: async (userId: string) => {
    set({ loading: true });
    try {
      const [ratingsRes, watchLogsRes, reviewsRes, watchlistRes, likesRes, listsRes] =
        await Promise.all([
          supabase.from('ratings').select('*').eq('user_id', userId),
          supabase.from('watch_logs').select('*').eq('user_id', userId),
          supabase.from('reviews').select('*').eq('user_id', userId),
          supabase.from('watchlist').select('*').eq('user_id', userId),
          supabase.from('likes').select('*').eq('user_id', userId),
          // DBA-01: Fix for N+1 Queries
          // We load the list items along with the lists in a single join query
          supabase.from('lists').select('*, list_items(*)').eq('user_id', userId),
        ]);

      const listsData = listsRes.data || [];
      const listsWithItems: MediaList[] = listsData.map((list) => ({
        id: list.id,
        name: list.name,
        description: list.description,
        userId: list.user_id,
        movies: (list.list_items || []).map((item: any) => ({
          mediaId: item.media_id,
          mediaType: item.media_type,
          title: item.title,
          posterPath: item.poster_path,
          addedDate: item.added_at,
        })),
        isPublic: list.is_public,
        createdAt: list.created_at,
        updatedAt: list.updated_at,
      }));

      set({
        ratings: (ratingsRes.data || []).map((r) => ({
          id: r.id, userId: r.user_id, mediaId: r.media_id, mediaType: r.media_type,
          rating: Number(r.rating), createdAt: r.created_at, updatedAt: r.updated_at,
        })),
        watchLogs: (watchLogsRes.data || []).map((w) => ({
          id: w.id, userId: w.user_id, mediaId: w.media_id, mediaType: w.media_type,
          mediaTitle: w.media_title, posterPath: w.poster_path, watchedDate: w.watched_date,
          rating: w.rating ? Number(w.rating) : undefined, review: w.review, createdAt: w.created_at,
        })),
        reviews: (reviewsRes.data || []).map((r) => ({
          id: r.id, userId: r.user_id, username: '', userAvatar: undefined,
          mediaId: r.media_id, mediaType: r.media_type, mediaTitle: r.media_title,
          posterPath: r.poster_path, rating: r.rating ? Number(r.rating) : undefined,
          reviewText: r.review_text, containsSpoilers: r.contains_spoilers,
          likes: r.likes_count, createdAt: r.created_at, updatedAt: r.updated_at,
        })),
        watchlist: (watchlistRes.data || []).map((w) => ({
          id: w.id, userId: w.user_id, mediaId: w.media_id, mediaType: w.media_type,
          mediaTitle: w.media_title, posterPath: w.poster_path, addedAt: w.added_at,
        })),
        likes: (likesRes.data || []).map((l) => ({
          id: l.id, userId: l.user_id, mediaId: l.media_id, mediaType: l.media_type,
          mediaTitle: l.media_title, posterPath: l.poster_path, likedAt: l.liked_at,
        })),
        lists: listsWithItems,
        loading: false,
      });
    } catch (error) {
      console.error('Erro ao carregar interações do Supabase:', error);
      set({ loading: false });
    }
  },

  clearInteractions: () => set({
    ratings: [], watchLogs: [], reviews: [], watchlist: [], likes: [], lists: [], loading: false,
  }),
}));
