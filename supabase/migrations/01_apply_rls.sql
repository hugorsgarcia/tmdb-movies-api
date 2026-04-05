-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RATINGS
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own ratings" ON public.ratings;
CREATE POLICY "Users can view own ratings"
  ON public.ratings FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own ratings" ON public.ratings;
CREATE POLICY "Users can insert own ratings"
  ON public.ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own ratings" ON public.ratings;
CREATE POLICY "Users can update own ratings"
  ON public.ratings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own ratings" ON public.ratings;
CREATE POLICY "Users can delete own ratings"
  ON public.ratings FOR DELETE
  USING (auth.uid() = user_id);

-- WATCH LOGS
ALTER TABLE public.watch_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own watch logs" ON public.watch_logs;
CREATE POLICY "Users can view own watch logs"
  ON public.watch_logs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own watch logs" ON public.watch_logs;
CREATE POLICY "Users can insert own watch logs"
  ON public.watch_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own watch logs" ON public.watch_logs;
CREATE POLICY "Users can delete own watch logs"
  ON public.watch_logs FOR DELETE
  USING (auth.uid() = user_id);

-- REVIEWS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all reviews" ON public.reviews;
CREATE POLICY "Users can view all reviews"
  ON public.reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert own reviews" ON public.reviews;
CREATE POLICY "Users can insert own reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reviews" ON public.reviews;
CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id);

-- WATCHLIST
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own watchlist" ON public.watchlist;
CREATE POLICY "Users can view own watchlist"
  ON public.watchlist FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own watchlist" ON public.watchlist;
CREATE POLICY "Users can insert own watchlist"
  ON public.watchlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own watchlist" ON public.watchlist;
CREATE POLICY "Users can delete own watchlist"
  ON public.watchlist FOR DELETE
  USING (auth.uid() = user_id);

-- LIKES
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own likes" ON public.likes;
CREATE POLICY "Users can view own likes"
  ON public.likes FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own likes" ON public.likes;
CREATE POLICY "Users can insert own likes"
  ON public.likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own likes" ON public.likes;
CREATE POLICY "Users can delete own likes"
  ON public.likes FOR DELETE
  USING (auth.uid() = user_id);

-- LISTS
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view public lists or own lists" ON public.lists;
CREATE POLICY "Users can view public lists or own lists"
  ON public.lists FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own lists" ON public.lists;
CREATE POLICY "Users can insert own lists"
  ON public.lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own lists" ON public.lists;
CREATE POLICY "Users can update own lists"
  ON public.lists FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own lists" ON public.lists;
CREATE POLICY "Users can delete own lists"
  ON public.lists FOR DELETE
  USING (auth.uid() = user_id);

-- LIST ITEMS
ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view items in accessible lists" ON public.list_items;
CREATE POLICY "Users can view items in accessible lists"
  ON public.list_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lists
      WHERE lists.id = list_items.list_id
      AND (lists.is_public = true OR lists.user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert items in own lists" ON public.list_items;
CREATE POLICY "Users can insert items in own lists"
  ON public.list_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lists
      WHERE lists.id = list_items.list_id
      AND lists.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete items from own lists" ON public.list_items;
CREATE POLICY "Users can delete items from own lists"
  ON public.list_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.lists
      WHERE lists.id = list_items.list_id
      AND lists.user_id = auth.uid()
    )
  );
