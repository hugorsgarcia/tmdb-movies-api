export interface MediaItem {
  id: number;
  title?: string; // Movie title
  name?: string; // TV show name
  poster_path?: string;
  overview: string;
  vote_average: number;
  release_date?: string; // Movie release date
  first_air_date?: string; // TV show first air date
  backdrop_path: string;
  genres: { id: number; name: string }[];
  runtime?: number; // Movie runtime
  episode_run_time?: number[]; // TV show episode runtime
  tagline: string;
}
