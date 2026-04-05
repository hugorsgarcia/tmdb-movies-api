import { StateCreator } from 'zustand';
import { supabase } from '@/lib/supabase';
import { InteractionsState, LikesSlice } from '../types';
import { MediaLike } from '@/types/interactions';

export const createLikesSlice: StateCreator<InteractionsState, [], [], LikesSlice> = (set, get) => ({
  likes: [],

  isLiked: (mediaId, mediaType) => {
    return get().likes.some((like) => like.mediaId === mediaId && like.mediaType === mediaType);
  },

  toggleLike: async (userId, mediaId, mediaType, mediaTitle, posterPath) => {
    const isCurrentlyLiked = get().isLiked(mediaId, mediaType);
    const prevLikes = get().likes;

    try {
      if (isCurrentlyLiked) {
        set((state) => ({
          likes: state.likes.filter((like) => !(like.mediaId === mediaId && like.mediaType === mediaType)),
        }));

        const { error } = await supabase.from('likes')
          .delete()
          .eq('user_id', userId)
          .eq('media_id', mediaId)
          .eq('media_type', mediaType);
        
        if (error) throw error;
      } else {
        const tempId = crypto.randomUUID();
        const newLike: MediaLike = {
          id: tempId, userId, mediaId, mediaType, mediaTitle, posterPath, likedAt: new Date().toISOString(),
        };
        set((state) => ({ likes: [...state.likes, newLike] }));

        const { data, error } = await supabase.from('likes').insert({
          user_id: userId, media_id: mediaId, media_type: mediaType,
          media_title: mediaTitle, poster_path: posterPath,
        }).select().single();

        if (error) throw error;

        if (data) {
          set((state) => ({
            likes: state.likes.map((l) => l.id === tempId ? { ...l, id: data.id } : l),
          }));
        }
      }
    } catch (e) {
      console.error('Error toggling like, rolling back...', e);
      set({ likes: prevLikes });
    }
  },

  getAllLikes: () => get().likes,
});
