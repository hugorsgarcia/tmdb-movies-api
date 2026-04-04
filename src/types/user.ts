import { WatchLog, MediaReview, MediaList } from './interactions';

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

export interface UserStats {
  totalWatched: number;
  totalReviews: number;
  totalLists: number;
  thisYear: number;
  averageRating: number;
}

export interface UserProfile extends User {
  stats: UserStats;
  recentWatched: WatchLog[];
  recentReviews: MediaReview[];
  lists: MediaList[];
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void | Promise<void>;
  loading: boolean;
}
