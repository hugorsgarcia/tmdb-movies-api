-- Migration: 03_follows.sql
-- Creates the follows table for the follower/following social graph

CREATE TABLE IF NOT EXISTS follows (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT follows_no_self_follow CHECK (follower_id <> following_id),
  CONSTRAINT follows_unique UNIQUE (follower_id, following_id)
);

-- Indexes for both query directions
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

-- Row Level Security
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Anyone can read follows (public social graph)
CREATE POLICY "follows_select_public"
  ON follows FOR SELECT
  USING (true);

-- Users can only insert rows where they are the follower
CREATE POLICY "follows_insert_own"
  ON follows FOR INSERT
  WITH CHECK (follower_id = auth.uid());

-- Users can only delete their own follow relationships
CREATE POLICY "follows_delete_own"
  ON follows FOR DELETE
  USING (follower_id = auth.uid());
