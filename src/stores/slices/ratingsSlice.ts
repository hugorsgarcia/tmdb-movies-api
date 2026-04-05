import { StateCreator } from 'zustand';
import { supabase } from '@/lib/supabase';
import { InteractionsState, RatingsSlice } from '../types';
import { MediaRating } from '@/types/interactions';

export const createRatingsSlice: StateCreator<InteractionsState, [], [], RatingsSlice> = (set, get) => ({
  ratings: [],

  getRating: (mediaId, mediaType) => {
    return get().ratings.find((r) => r.mediaId === mediaId && r.mediaType === mediaType);
  },

  setRating: async (userId, mediaId, mediaType, rating) => {
    const now = new Date().toISOString();
    const existing = get().getRating(mediaId, mediaType);
    const prevRatings = get().ratings;

    // Optimistic UI updates
    if (existing) {
      set((state) => ({
        ratings: state.ratings.map((r) =>
          r.mediaId === mediaId && r.mediaType === mediaType ? { ...r, rating, updatedAt: now } : r
        ),
      }));
    } else {
      const tempId = crypto.randomUUID();
      const newRating: MediaRating = {
        id: tempId, userId, mediaId, mediaType, rating, createdAt: now, updatedAt: now,
      };
      set((state) => ({ ratings: [...state.ratings, newRating] }));
    }

    try {
      const { error } = await supabase.from('ratings').upsert(
        { user_id: userId, media_id: mediaId, media_type: mediaType, rating, updated_at: now },
        { onConflict: 'user_id,media_id,media_type' }
      );
      if (error) throw error;
    } catch (e) {
      console.error('Error in setRating, rolling back...', e);
      set({ ratings: prevRatings }); // rollback
    }
  },

  removeRating: async (userId, mediaId, mediaType) => {
    const prevRatings = get().ratings;
    set((state) => ({
      ratings: state.ratings.filter((r) => !(r.mediaId === mediaId && r.mediaType === mediaType)),
    }));

    try {
      const { error } = await supabase.from('ratings')
        .delete()
        .eq('user_id', userId)
        .eq('media_id', mediaId)
        .eq('media_type', mediaType);
      
      if (error) throw error;
    } catch (e) {
      console.error('Error in removeRating, rolling back...', e);
      set({ ratings: prevRatings }); // rollback
    }
  },

  getAllRatings: () => get().ratings,
});
