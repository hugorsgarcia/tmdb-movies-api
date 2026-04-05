-- Migration: 04_review_likes.sql
-- Creates review_likes table so users can like/unlike reviews by others

CREATE TABLE IF NOT EXISTS review_likes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  review_id  UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT review_likes_unique UNIQUE (user_id, review_id)
);

CREATE INDEX IF NOT EXISTS idx_review_likes_review ON review_likes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_likes_user ON review_likes(user_id);

-- Row Level Security
ALTER TABLE review_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "review_likes_select_public"
  ON review_likes FOR SELECT
  USING (true);

CREATE POLICY "review_likes_insert_own"
  ON review_likes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "review_likes_delete_own"
  ON review_likes FOR DELETE
  USING (user_id = auth.uid());
