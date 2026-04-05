import { StateCreator } from 'zustand';
import { supabase } from '@/lib/supabase';
import { InteractionsState, ReviewsSlice } from '../types';
import { MediaReview } from '@/types/interactions';

export const createReviewsSlice: StateCreator<InteractionsState, [], [], ReviewsSlice> = (set, get) => ({
  reviews: [],

  getReview: (mediaId, mediaType) => {
    return get().reviews.find((r) => r.mediaId === mediaId && r.mediaType === mediaType);
  },

  addReview: async (userId, username, avatar, review) => {
    const now = new Date().toISOString();
    const existing = get().getReview(review.mediaId, review.mediaType);
    const prevReviews = get().reviews;

    try {
      if (existing) {
        set((state) => ({
          reviews: state.reviews.map((r) =>
            r.mediaId === review.mediaId && r.mediaType === review.mediaType
              ? { ...r, ...review, updatedAt: now } : r
          ),
        }));

        const { error } = await supabase.from('reviews').update({
          rating: review.rating, review_text: review.reviewText,
          contains_spoilers: review.containsSpoilers, updated_at: now,
        }).eq('user_id', userId).eq('media_id', review.mediaId).eq('media_type', review.mediaType);

        if (error) throw error;
      } else {
        const tempId = crypto.randomUUID();
        const newReview: MediaReview = {
          ...review, id: tempId, userId, username, userAvatar: avatar,
          likes: 0, createdAt: now, updatedAt: now,
        };
        set((state) => ({ reviews: [...state.reviews, newReview] }));

        const { data, error } = await supabase.from('reviews').insert({
          user_id: userId, media_id: review.mediaId, media_type: review.mediaType,
          media_title: review.mediaTitle, poster_path: review.posterPath,
          rating: review.rating, review_text: review.reviewText, contains_spoilers: review.containsSpoilers,
        }).select().single();

        if (error) throw error;

        if (data) {
          set((state) => ({
            reviews: state.reviews.map((r) => r.id === tempId ? { ...r, id: data.id } : r),
          }));
        }
      }
    } catch (e) {
      console.error('Error adding/updating review, rolling back...', e);
      set({ reviews: prevReviews });
    }
  },

  updateReview: async (reviewId, reviewText, containsSpoilers) => {
    const now = new Date().toISOString();
    const prevReviews = get().reviews;

    set((state) => ({
      reviews: state.reviews.map((r) =>
        r.id === reviewId ? { ...r, reviewText, containsSpoilers, updatedAt: now } : r
      ),
    }));

    try {
      const { error } = await supabase.from('reviews').update({
        review_text: reviewText, contains_spoilers: containsSpoilers, updated_at: now,
      }).eq('id', reviewId);
      if (error) throw error;
    } catch (e) {
      console.error('Error updating review, rolling back...', e);
      set({ reviews: prevReviews });
    }
  },

  deleteReview: async (reviewId) => {
    const prevReviews = get().reviews;

    set((state) => ({ reviews: state.reviews.filter((r) => r.id !== reviewId) }));

    try {
      const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
      if (error) throw error;
    } catch (e) {
      console.error('Error deleting review, rolling back...', e);
      set({ reviews: prevReviews });
    }
  },

  getAllReviews: () => get().reviews,
});
