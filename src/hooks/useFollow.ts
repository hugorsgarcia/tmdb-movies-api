import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface UseFollowResult {
  isFollowing: boolean;
  followerCount: number;
  followingCount: number;
  loading: boolean;
  toggle: () => Promise<void>;
}

export function useFollow(targetUserId: string | null): UseFollowResult {
  const { user, isAuthenticated } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadCounts = useCallback(async () => {
    if (!targetUserId) return;

    const [followerRes, followingRes] = await Promise.all([
      supabase
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('following_id', targetUserId),
      supabase
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('follower_id', targetUserId),
    ]);

    setFollowerCount(followerRes.count ?? 0);
    setFollowingCount(followingRes.count ?? 0);
  }, [targetUserId]);

  const loadFollowState = useCallback(async () => {
    if (!targetUserId || !isAuthenticated || !user?.id) return;

    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)
      .maybeSingle();

    setIsFollowing(!!data);
  }, [targetUserId, isAuthenticated, user?.id]);

  useEffect(() => {
    loadCounts();
    loadFollowState();
  }, [loadCounts, loadFollowState]);

  const toggle = useCallback(async () => {
    if (!targetUserId || !isAuthenticated || !user?.id || loading) return;

    setLoading(true);

    // Optimistic update
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    setFollowerCount((c) => c + (wasFollowing ? -1 : 1));

    try {
      if (wasFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);
      } else {
        await supabase
          .from('follows')
          .insert({ follower_id: user.id, following_id: targetUserId });
      }
    } catch {
      // Revert optimistic update on error
      setIsFollowing(wasFollowing);
      setFollowerCount((c) => c + (wasFollowing ? 1 : -1));
    } finally {
      setLoading(false);
    }
  }, [targetUserId, isAuthenticated, user?.id, loading, isFollowing]);

  return { isFollowing, followerCount, followingCount, loading, toggle };
}
