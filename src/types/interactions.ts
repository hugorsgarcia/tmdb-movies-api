// Tipos para interações do usuário com filmes/séries

export interface MediaRating {
  id: string;
  userId: string;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  rating: number; // 0.5 a 5 estrelas (incrementos de 0.5)
  createdAt: string;
  updatedAt: string;
}

export interface WatchLog {
  id: string;
  userId: string;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  mediaTitle: string;
  posterPath?: string;
  watchedDate: string;
  rating?: number;
  review?: string;
  createdAt: string;
}

export interface MediaReview {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  mediaTitle: string;
  posterPath?: string;
  rating?: number;
  reviewText: string;
  containsSpoilers: boolean;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  mediaTitle: string;
  posterPath?: string;
  releaseDate?: string;
  addedAt: string;
}

export interface MediaLike {
  id: string;
  userId: string;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  mediaTitle?: string;
  posterPath?: string;
  likedAt: string;
}

export interface MediaList {
  id: string;
  name: string;
  description?: string;
  userId: string;
  movies: Array<{
    mediaId: number;
    mediaType: 'movie' | 'tv';
    title: string;
    posterPath?: string;
    addedDate: string;
  }>;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserInteractions {
  ratings: MediaRating[];
  watchLogs: WatchLog[];
  reviews: MediaReview[];
  watchlist: WatchlistItem[];
  likes: MediaLike[];
  lists: MediaList[];
}

export interface InteractionsContextType {
  interactions: UserInteractions;
  // Ratings
  getRating: (mediaId: number, mediaType: 'movie' | 'tv') => MediaRating | undefined;
  setRating: (mediaId: number, mediaType: 'movie' | 'tv', rating: number) => void;
  removeRating: (mediaId: number, mediaType: 'movie' | 'tv') => void;
  // Watch Logs
  isWatched: (mediaId: number, mediaType: 'movie' | 'tv') => boolean;
  getWatchLog: (mediaId: number, mediaType: 'movie' | 'tv') => WatchLog | undefined;
  addWatchLog: (log: Omit<WatchLog, 'id' | 'userId' | 'createdAt'>) => void;
  removeWatchLog: (mediaId: number, mediaType: 'movie' | 'tv') => void;
  // Reviews
  getReview: (mediaId: number, mediaType: 'movie' | 'tv') => MediaReview | undefined;
  addReview: (review: Omit<MediaReview, 'id' | 'userId' | 'username' | 'userAvatar' | 'likes' | 'createdAt' | 'updatedAt'>) => void;
  updateReview: (reviewId: string, reviewText: string, containsSpoilers: boolean) => void;
  deleteReview: (reviewId: string) => void;
  // Watchlist
  isInWatchlist: (mediaId: number, mediaType: 'movie' | 'tv') => boolean;
  addToWatchlist: (item: Omit<WatchlistItem, 'id' | 'userId' | 'addedAt'>) => void;
  removeFromWatchlist: (mediaId: number, mediaType: 'movie' | 'tv') => void;
  // Likes
  isLiked: (mediaId: number, mediaType: 'movie' | 'tv') => boolean;
  toggleLike: (mediaId: number, mediaType: 'movie' | 'tv', mediaTitle?: string, posterPath?: string) => void;
  // Get all data for profile
  getAllWatchLogs: () => WatchLog[];
  getAllReviews: () => MediaReview[];
  getWatchlist: () => WatchlistItem[];
  getAllLikes: () => MediaLike[];
  getAllRatings: () => MediaRating[];
  // Lists
  getAllLists: () => MediaList[];
  createList: (name: string, description?: string, isPublic?: boolean) => MediaList;
  deleteList: (listId: string) => void;
  addToList: (listId: string, mediaId: number, mediaType: 'movie' | 'tv', title: string, posterPath?: string) => void;
  removeFromList: (listId: string, mediaId: number, mediaType: 'movie' | 'tv') => void;
  isInList: (listId: string, mediaId: number, mediaType: 'movie' | 'tv') => boolean;
  // Loading
  loading: boolean;
}
