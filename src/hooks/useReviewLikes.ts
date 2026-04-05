import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface UseReviewLikesResult {
  likedReviewIds: Set<string>;
  isLiked: (reviewId: string) => boolean;
  toggleLike: (reviewId: string, currentCount: number, onCountChange: (n: number) => void) => Promise<void>;
}

export function useReviewLikes(reviewIds: string[]): UseReviewLikesResult {
  const { user, isAuthenticated } = useAuth();
  const [likedReviewIds, setLikedReviewIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isAuthenticated || !user?.id || reviewIds.length === 0) return;

    supabase
      .from('review_likes')
      .select('review_id')
      .eq('user_id', user.id)
      .in('review_id', reviewIds)
      .then(({ data }) => {
        setLikedReviewIds(new Set((data ?? []).map((r) => r.review_id as string)));
      });
  }, [isAuthenticated, user?.id, reviewIds.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  const isLiked = useCallback(
    (reviewId: string) => likedReviewIds.has(reviewId),
    [likedReviewIds]
  );

  const toggleLike = useCallback(
    async (reviewId: string, currentCount: number, onCountChange: (n: number) => void) => {
      if (!isAuthenticated || !user?.id) return;

      const wasLiked = likedReviewIds.has(reviewId);

      // Optimistic update
      setLikedReviewIds((prev) => {
        const next = new Set(prev);
        wasLiked ? next.delete(reviewId) : next.add(reviewId);
        return next;
      });
      onCountChange(currentCount + (wasLiked ? -1 : 1));

      try {
        if (wasLiked) {
          await supabase
            .from('review_likes')
            .delete()
            .eq('user_id', user.id)
            .eq('review_id', reviewId);
        } else {
          await supabase
            .from('review_likes')
            .insert({ user_id: user.id, review_id: reviewId });
        }
      } catch {
        // Revert on error
        setLikedReviewIds((prev) => {
          const next = new Set(prev);
          wasLiked ? next.add(reviewId) : next.delete(reviewId);
          return next;
        });
        onCountChange(currentCount);
      }
    },
    [isAuthenticated, user?.id, likedReviewIds]
  );

  return { likedReviewIds, isLiked, toggleLike };
}
