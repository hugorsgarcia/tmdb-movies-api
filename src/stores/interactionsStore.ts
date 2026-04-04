import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import {
  UserInteractions,
  MediaRating,
  WatchLog,
  MediaReview,
  WatchlistItem,
  MediaLike,
  MediaList,
} from '@/types/interactions';

interface InteractionsState extends UserInteractions {
  loading: boolean;

  // Actions
  loadInteractions: (userId: string) => Promise<void>;
  clearInteractions: () => void;

  // Ratings
  getRating: (mediaId: number, mediaType: 'movie' | 'tv') => MediaRating | undefined;
  setRating: (userId: string, mediaId: number, mediaType: 'movie' | 'tv', rating: number) => Promise<void>;
  removeRating: (userId: string, mediaId: number, mediaType: 'movie' | 'tv') => Promise<void>;

  // Watch Logs
  isWatched: (mediaId: number, mediaType: 'movie' | 'tv') => boolean;
  getWatchLog: (mediaId: number, mediaType: 'movie' | 'tv') => WatchLog | undefined;
  addWatchLog: (userId: string, log: Omit<WatchLog, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  removeWatchLog: (userId: string, mediaId: number, mediaType: 'movie' | 'tv') => Promise<void>;

  // Reviews
  getReview: (mediaId: number, mediaType: 'movie' | 'tv') => MediaReview | undefined;
  addReview: (userId: string, username: string, avatar: string | undefined, review: Omit<MediaReview, 'id' | 'userId' | 'username' | 'userAvatar' | 'likes' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateReview: (reviewId: string, reviewText: string, containsSpoilers: boolean) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;

  // Watchlist
  isInWatchlist: (mediaId: number, mediaType: 'movie' | 'tv') => boolean;
  addToWatchlist: (userId: string, item: Omit<WatchlistItem, 'id' | 'userId' | 'addedAt'>) => Promise<void>;
  removeFromWatchlist: (userId: string, mediaId: number, mediaType: 'movie' | 'tv') => Promise<void>;

  // Likes
  isLiked: (mediaId: number, mediaType: 'movie' | 'tv') => boolean;
  toggleLike: (userId: string, mediaId: number, mediaType: 'movie' | 'tv', mediaTitle?: string, posterPath?: string) => Promise<void>;

  // Lists
  createList: (userId: string, name: string, description?: string, isPublic?: boolean) => MediaList;
  deleteList: (listId: string) => Promise<void>;
  addToList: (listId: string, mediaId: number, mediaType: 'movie' | 'tv', title: string, posterPath?: string) => Promise<void>;
  removeFromList: (listId: string, mediaId: number, mediaType: 'movie' | 'tv') => Promise<void>;
  isInList: (listId: string, mediaId: number, mediaType: 'movie' | 'tv') => boolean;

  // Getters
  getAllWatchLogs: () => WatchLog[];
  getAllReviews: () => MediaReview[];
  getWatchlist: () => WatchlistItem[];
  getAllLikes: () => MediaLike[];
  getAllRatings: () => MediaRating[];
  getAllLists: () => MediaList[];
}

export const useInteractionsStore = create<InteractionsState>((set, get) => ({
  // Initial state
  ratings: [],
  watchLogs: [],
  reviews: [],
  watchlist: [],
  likes: [],
  lists: [],
  loading: true,

  // === Load all data ===
  loadInteractions: async (userId: string) => {
    set({ loading: true });
    try {
      const [ratingsRes, watchLogsRes, reviewsRes, watchlistRes, likesRes, listsRes] =
        await Promise.all([
          supabase.from('ratings').select('*').eq('user_id', userId),
          supabase.from('watch_logs').select('*').eq('user_id', userId),
          supabase.from('reviews').select('*').eq('user_id', userId),
          supabase.from('watchlist').select('*').eq('user_id', userId),
          supabase.from('likes').select('*').eq('user_id', userId),
          supabase.from('lists').select('*').eq('user_id', userId),
        ]);

      const listsData = listsRes.data || [];
      const listsWithItems: MediaList[] = await Promise.all(
        listsData.map(async (list) => {
          const { data: items } = await supabase
            .from('list_items')
            .select('*')
            .eq('list_id', list.id);

          return {
            id: list.id,
            name: list.name,
            description: list.description,
            userId: list.user_id,
            movies: (items || []).map((item) => ({
              mediaId: item.media_id,
              mediaType: item.media_type,
              title: item.title,
              posterPath: item.poster_path,
              addedDate: item.added_at,
            })),
            isPublic: list.is_public,
            createdAt: list.created_at,
            updatedAt: list.updated_at,
          };
        })
      );

      set({
        ratings: (ratingsRes.data || []).map((r) => ({
          id: r.id, userId: r.user_id, mediaId: r.media_id, mediaType: r.media_type,
          rating: Number(r.rating), createdAt: r.created_at, updatedAt: r.updated_at,
        })),
        watchLogs: (watchLogsRes.data || []).map((w) => ({
          id: w.id, userId: w.user_id, mediaId: w.media_id, mediaType: w.media_type,
          mediaTitle: w.media_title, posterPath: w.poster_path, watchedDate: w.watched_date,
          rating: w.rating ? Number(w.rating) : undefined, review: w.review, createdAt: w.created_at,
        })),
        reviews: (reviewsRes.data || []).map((r) => ({
          id: r.id, userId: r.user_id, username: '', userAvatar: undefined,
          mediaId: r.media_id, mediaType: r.media_type, mediaTitle: r.media_title,
          posterPath: r.poster_path, rating: r.rating ? Number(r.rating) : undefined,
          reviewText: r.review_text, containsSpoilers: r.contains_spoilers,
          likes: r.likes_count, createdAt: r.created_at, updatedAt: r.updated_at,
        })),
        watchlist: (watchlistRes.data || []).map((w) => ({
          id: w.id, userId: w.user_id, mediaId: w.media_id, mediaType: w.media_type,
          mediaTitle: w.media_title, posterPath: w.poster_path, addedAt: w.added_at,
        })),
        likes: (likesRes.data || []).map((l) => ({
          id: l.id, userId: l.user_id, mediaId: l.media_id, mediaType: l.media_type,
          mediaTitle: l.media_title, posterPath: l.poster_path, likedAt: l.liked_at,
        })),
        lists: listsWithItems,
        loading: false,
      });
    } catch (error) {
      console.error('Erro ao carregar interações do Supabase:', error);
      set({ loading: false });
    }
  },

  clearInteractions: () => set({
    ratings: [], watchLogs: [], reviews: [], watchlist: [], likes: [], lists: [], loading: false,
  }),

  // === Ratings ===
  getRating: (mediaId, mediaType) => {
    return get().ratings.find((r) => r.mediaId === mediaId && r.mediaType === mediaType);
  },

  setRating: async (userId, mediaId, mediaType, rating) => {
    const now = new Date().toISOString();
    const existing = get().getRating(mediaId, mediaType);

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

    await supabase.from('ratings').upsert(
      { user_id: userId, media_id: mediaId, media_type: mediaType, rating, updated_at: now },
      { onConflict: 'user_id,media_id,media_type' }
    );
  },

  removeRating: async (userId, mediaId, mediaType) => {
    set((state) => ({
      ratings: state.ratings.filter((r) => !(r.mediaId === mediaId && r.mediaType === mediaType)),
    }));
    await supabase.from('ratings').delete().eq('user_id', userId).eq('media_id', mediaId).eq('media_type', mediaType);
  },

  // === Watch Logs ===
  isWatched: (mediaId, mediaType) => {
    return get().watchLogs.some((log) => log.mediaId === mediaId && log.mediaType === mediaType);
  },

  getWatchLog: (mediaId, mediaType) => {
    return get().watchLogs.find((log) => log.mediaId === mediaId && log.mediaType === mediaType);
  },

  addWatchLog: async (userId, log) => {
    const tempId = crypto.randomUUID();
    const newLog: WatchLog = { ...log, id: tempId, userId, createdAt: new Date().toISOString() };
    set((state) => ({ watchLogs: [...state.watchLogs, newLog] }));

    const { data } = await supabase.from('watch_logs').insert({
      user_id: userId, media_id: log.mediaId, media_type: log.mediaType,
      media_title: log.mediaTitle, poster_path: log.posterPath,
      watched_date: log.watchedDate, rating: log.rating, review: log.review,
    }).select().single();

    if (data) {
      set((state) => ({
        watchLogs: state.watchLogs.map((w) => w.id === tempId ? { ...w, id: data.id } : w),
      }));
    }
  },

  removeWatchLog: async (userId, mediaId, mediaType) => {
    set((state) => ({
      watchLogs: state.watchLogs.filter((log) => !(log.mediaId === mediaId && log.mediaType === mediaType)),
    }));
    await supabase.from('watch_logs').delete().eq('user_id', userId).eq('media_id', mediaId).eq('media_type', mediaType);
  },

  // === Reviews ===
  getReview: (mediaId, mediaType) => {
    return get().reviews.find((r) => r.mediaId === mediaId && r.mediaType === mediaType);
  },

  addReview: async (userId, username, avatar, review) => {
    const now = new Date().toISOString();
    const existing = get().getReview(review.mediaId, review.mediaType);

    if (existing) {
      set((state) => ({
        reviews: state.reviews.map((r) =>
          r.mediaId === review.mediaId && r.mediaType === review.mediaType
            ? { ...r, ...review, updatedAt: now } : r
        ),
      }));

      await supabase.from('reviews').update({
        rating: review.rating, review_text: review.reviewText,
        contains_spoilers: review.containsSpoilers, updated_at: now,
      }).eq('user_id', userId).eq('media_id', review.mediaId).eq('media_type', review.mediaType);
    } else {
      const tempId = crypto.randomUUID();
      const newReview: MediaReview = {
        ...review, id: tempId, userId, username, userAvatar: avatar,
        likes: 0, createdAt: now, updatedAt: now,
      };
      set((state) => ({ reviews: [...state.reviews, newReview] }));

      const { data } = await supabase.from('reviews').insert({
        user_id: userId, media_id: review.mediaId, media_type: review.mediaType,
        media_title: review.mediaTitle, poster_path: review.posterPath,
        rating: review.rating, review_text: review.reviewText, contains_spoilers: review.containsSpoilers,
      }).select().single();

      if (data) {
        set((state) => ({
          reviews: state.reviews.map((r) => r.id === tempId ? { ...r, id: data.id } : r),
        }));
      }
    }
  },

  updateReview: async (reviewId, reviewText, containsSpoilers) => {
    const now = new Date().toISOString();
    set((state) => ({
      reviews: state.reviews.map((r) =>
        r.id === reviewId ? { ...r, reviewText, containsSpoilers, updatedAt: now } : r
      ),
    }));
    await supabase.from('reviews').update({
      review_text: reviewText, contains_spoilers: containsSpoilers, updated_at: now,
    }).eq('id', reviewId);
  },

  deleteReview: async (reviewId) => {
    set((state) => ({ reviews: state.reviews.filter((r) => r.id !== reviewId) }));
    await supabase.from('reviews').delete().eq('id', reviewId);
  },

  // === Watchlist ===
  isInWatchlist: (mediaId, mediaType) => {
    return get().watchlist.some((item) => item.mediaId === mediaId && item.mediaType === mediaType);
  },

  addToWatchlist: async (userId, item) => {
    const tempId = crypto.randomUUID();
    const newItem: WatchlistItem = { ...item, id: tempId, userId, addedAt: new Date().toISOString() };
    set((state) => ({ watchlist: [...state.watchlist, newItem] }));

    const { data } = await supabase.from('watchlist').insert({
      user_id: userId, media_id: item.mediaId, media_type: item.mediaType,
      media_title: item.mediaTitle, poster_path: item.posterPath,
    }).select().single();

    if (data) {
      set((state) => ({
        watchlist: state.watchlist.map((w) => w.id === tempId ? { ...w, id: data.id } : w),
      }));
    }
  },

  removeFromWatchlist: async (userId, mediaId, mediaType) => {
    set((state) => ({
      watchlist: state.watchlist.filter((item) => !(item.mediaId === mediaId && item.mediaType === mediaType)),
    }));
    await supabase.from('watchlist').delete().eq('user_id', userId).eq('media_id', mediaId).eq('media_type', mediaType);
  },

  // === Likes ===
  isLiked: (mediaId, mediaType) => {
    return get().likes.some((like) => like.mediaId === mediaId && like.mediaType === mediaType);
  },

  toggleLike: async (userId, mediaId, mediaType, mediaTitle, posterPath) => {
    if (get().isLiked(mediaId, mediaType)) {
      set((state) => ({
        likes: state.likes.filter((like) => !(like.mediaId === mediaId && like.mediaType === mediaType)),
      }));
      await supabase.from('likes').delete().eq('user_id', userId).eq('media_id', mediaId).eq('media_type', mediaType);
    } else {
      const tempId = crypto.randomUUID();
      const newLike: MediaLike = {
        id: tempId, userId, mediaId, mediaType, mediaTitle, posterPath, likedAt: new Date().toISOString(),
      };
      set((state) => ({ likes: [...state.likes, newLike] }));

      const { data } = await supabase.from('likes').insert({
        user_id: userId, media_id: mediaId, media_type: mediaType,
        media_title: mediaTitle, poster_path: posterPath,
      }).select().single();

      if (data) {
        set((state) => ({
          likes: state.likes.map((l) => l.id === tempId ? { ...l, id: data.id } : l),
        }));
      }
    }
  },

  // === Lists ===
  createList: (userId, name, description, isPublic = true) => {
    const tempId = crypto.randomUUID();
    const now = new Date().toISOString();
    const newList: MediaList = {
      id: tempId, name, description, userId, movies: [], isPublic, createdAt: now, updatedAt: now,
    };
    set((state) => ({ lists: [...state.lists, newList] }));

    (async () => {
      const { data } = await supabase.from('lists').insert({
        user_id: userId, name, description, is_public: isPublic,
      }).select().single();

      if (data) {
        set((state) => ({
          lists: state.lists.map((l) => l.id === tempId ? { ...l, id: data.id } : l),
        }));
      }
    })();

    return newList;
  },

  deleteList: async (listId) => {
    set((state) => ({ lists: state.lists.filter((list) => list.id !== listId) }));
    await supabase.from('lists').delete().eq('id', listId);
  },

  addToList: async (listId, mediaId, mediaType, title, posterPath) => {
    set((state) => ({
      lists: state.lists.map((list) => {
        if (list.id === listId) {
          const exists = list.movies.some((m) => m.mediaId === mediaId && m.mediaType === mediaType);
          if (exists) return list;
          return {
            ...list,
            movies: [...list.movies, { mediaId, mediaType, title, posterPath, addedDate: new Date().toISOString() }],
            updatedAt: new Date().toISOString(),
          };
        }
        return list;
      }),
    }));

    await supabase.from('list_items').insert({
      list_id: listId, media_id: mediaId, media_type: mediaType, title, poster_path: posterPath,
    });
    await supabase.from('lists').update({ updated_at: new Date().toISOString() }).eq('id', listId);
  },

  removeFromList: async (listId, mediaId, mediaType) => {
    set((state) => ({
      lists: state.lists.map((list) => {
        if (list.id === listId) {
          return {
            ...list,
            movies: list.movies.filter((m) => !(m.mediaId === mediaId && m.mediaType === mediaType)),
            updatedAt: new Date().toISOString(),
          };
        }
        return list;
      }),
    }));
    await supabase.from('list_items').delete().eq('list_id', listId).eq('media_id', mediaId).eq('media_type', mediaType);
  },

  isInList: (listId, mediaId, mediaType) => {
    const list = get().lists.find((l) => l.id === listId);
    if (!list) return false;
    return list.movies.some((m) => m.mediaId === mediaId && m.mediaType === mediaType);
  },

  // === Getters ===
  getAllWatchLogs: () => get().watchLogs,
  getAllReviews: () => get().reviews,
  getWatchlist: () => get().watchlist,
  getAllLikes: () => get().likes,
  getAllRatings: () => get().ratings,
  getAllLists: () => get().lists,
}));
