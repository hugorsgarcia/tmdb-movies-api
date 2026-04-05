-- Migration: 02_create_indexes.sql
-- DBA-002: Composite indexes for all high-frequency queries
-- These cover the user_id + media_id + media_type filter patterns used in loadInteractions.

CREATE INDEX IF NOT EXISTS idx_ratings_user_media
  ON public.ratings (user_id, media_id, media_type);

CREATE INDEX IF NOT EXISTS idx_watch_logs_user_media
  ON public.watch_logs (user_id, media_id, media_type);

CREATE INDEX IF NOT EXISTS idx_likes_user_media
  ON public.likes (user_id, media_id, media_type);

CREATE INDEX IF NOT EXISTS idx_watchlist_user_media
  ON public.watchlist (user_id, media_id, media_type);

CREATE INDEX IF NOT EXISTS idx_reviews_user_media
  ON public.reviews (user_id, media_id, media_type);

CREATE INDEX IF NOT EXISTS idx_list_items_list
  ON public.list_items (list_id, media_id, media_type);

-- Supports profile lookups by username (used in public profile pages)
CREATE INDEX IF NOT EXISTS idx_profiles_username
  ON public.profiles (username);
