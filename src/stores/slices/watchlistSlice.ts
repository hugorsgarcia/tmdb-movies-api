import { StateCreator } from 'zustand';
import { supabase } from '@/lib/supabase';
import { InteractionsState, WatchlistSlice } from '../types';
import { WatchlistItem } from '@/types/interactions';

export const createWatchlistSlice: StateCreator<InteractionsState, [], [], WatchlistSlice> = (set, get) => ({
  watchlist: [],

  isInWatchlist: (mediaId, mediaType) => {
    return get().watchlist.some((item) => item.mediaId === mediaId && item.mediaType === mediaType);
  },

  addToWatchlist: async (userId, item) => {
    const tempId = crypto.randomUUID();
    const newItem: WatchlistItem = { ...item, id: tempId, userId, addedAt: new Date().toISOString() };
    const prevWatchlist = get().watchlist;

    set((state) => ({ watchlist: [...state.watchlist, newItem] }));

    try {
      const { data, error } = await supabase.from('watchlist').insert({
        user_id: userId, media_id: item.mediaId, media_type: item.mediaType,
        media_title: item.mediaTitle, poster_path: item.posterPath,
      }).select().single();

      if (error) throw error;

      if (data) {
        set((state) => ({
          watchlist: state.watchlist.map((w) => w.id === tempId ? { ...w, id: data.id } : w),
        }));
      }
    } catch (e) {
      console.error('Error adding to watchlist, rolling back...', e);
      set({ watchlist: prevWatchlist });
    }
  },

  removeFromWatchlist: async (userId, mediaId, mediaType) => {
    const prevWatchlist = get().watchlist;

    set((state) => ({
      watchlist: state.watchlist.filter((item) => !(item.mediaId === mediaId && item.mediaType === mediaType)),
    }));

    try {
      const { error } = await supabase.from('watchlist')
        .delete()
        .eq('user_id', userId)
        .eq('media_id', mediaId)
        .eq('media_type', mediaType);
      
      if (error) throw error;
    } catch (e) {
      console.error('Error removing from watchlist, rolling back...', e);
      set({ watchlist: prevWatchlist });
    }
  },

  getWatchlist: () => get().watchlist,
});
