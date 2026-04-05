import {
  UserInteractions,
  MediaRating,
  WatchLog,
  MediaReview,
  WatchlistItem,
  MediaLike,
  MediaList,
} from '@/types/interactions';

export interface RatingsSlice {
  ratings: MediaRating[];
  getRating: (mediaId: number, mediaType: 'movie' | 'tv') => MediaRating | undefined;
  setRating: (userId: string, mediaId: number, mediaType: 'movie' | 'tv', rating: number) => Promise<void>;
  removeRating: (userId: string, mediaId: number, mediaType: 'movie' | 'tv') => Promise<void>;
  getAllRatings: () => MediaRating[];
}

export interface WatchLogsSlice {
  watchLogs: WatchLog[];
  isWatched: (mediaId: number, mediaType: 'movie' | 'tv') => boolean;
  getWatchLog: (mediaId: number, mediaType: 'movie' | 'tv') => WatchLog | undefined;
  addWatchLog: (userId: string, log: Omit<WatchLog, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  removeWatchLog: (userId: string, mediaId: number, mediaType: 'movie' | 'tv') => Promise<void>;
  getAllWatchLogs: () => WatchLog[];
}

export interface ReviewsSlice {
  reviews: MediaReview[];
  getReview: (mediaId: number, mediaType: 'movie' | 'tv') => MediaReview | undefined;
  addReview: (userId: string, username: string, avatar: string | undefined, review: Omit<MediaReview, 'id' | 'userId' | 'username' | 'userAvatar' | 'likes' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateReview: (reviewId: string, reviewText: string, containsSpoilers: boolean) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  getAllReviews: () => MediaReview[];
}

export interface WatchlistSlice {
  watchlist: WatchlistItem[];
  isInWatchlist: (mediaId: number, mediaType: 'movie' | 'tv') => boolean;
  addToWatchlist: (userId: string, item: Omit<WatchlistItem, 'id' | 'userId' | 'addedAt'>) => Promise<void>;
  removeFromWatchlist: (userId: string, mediaId: number, mediaType: 'movie' | 'tv') => Promise<void>;
  getWatchlist: () => WatchlistItem[];
}

export interface LikesSlice {
  likes: MediaLike[];
  isLiked: (mediaId: number, mediaType: 'movie' | 'tv') => boolean;
  toggleLike: (userId: string, mediaId: number, mediaType: 'movie' | 'tv', mediaTitle?: string, posterPath?: string) => Promise<void>;
  getAllLikes: () => MediaLike[];
}

export interface ListsSlice {
  lists: MediaList[];
  createList: (userId: string, name: string, description?: string, isPublic?: boolean) => MediaList;
  deleteList: (listId: string) => Promise<void>;
  addToList: (listId: string, mediaId: number, mediaType: 'movie' | 'tv', title: string, posterPath?: string) => Promise<void>;
  removeFromList: (listId: string, mediaId: number, mediaType: 'movie' | 'tv') => Promise<void>;
  isInList: (listId: string, mediaId: number, mediaType: 'movie' | 'tv') => boolean;
  getAllLists: () => MediaList[];
}

export interface SharedSlice {
  loading: boolean;
  loadInteractions: (userId: string, username?: string) => Promise<void>;
  clearInteractions: () => void;
}

export type InteractionsState = RatingsSlice & WatchLogsSlice & ReviewsSlice & WatchlistSlice & LikesSlice & ListsSlice & SharedSlice;
