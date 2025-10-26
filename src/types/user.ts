export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  joinedDate: string;
}

export interface WatchedMovie {
  id: number;
  movieId: number;
  title: string;
  posterPath?: string;
  watchedDate: string;
  rating?: number;
}

export interface Review {
  id: string;
  movieId: number;
  movieTitle: string;
  posterPath?: string;
  userId: string;
  username: string;
  rating: number;
  reviewText: string;
  createdAt: string;
  likes: number;
}

export interface MovieList {
  id: string;
  name: string;
  description?: string;
  userId: string;
  movies: Array<{
    movieId: number;
    title: string;
    posterPath?: string;
    addedDate: string;
  }>;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalWatched: number;
  totalReviews: number;
  totalLists: number;
  thisYear: number;
  averageRating: number;
}

export interface UserProfile extends User {
  stats: UserStats;
  recentWatched: WatchedMovie[];
  recentReviews: Review[];
  lists: MovieList[];
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}
