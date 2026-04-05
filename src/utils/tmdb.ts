import axios from 'axios';

const TMDB_BASE_URL = '/api/tmdb';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Configuração do cliente Axios para o proxy do TMDB (Server-side repassa a Key)
export const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
});

// Funções auxiliares para URLs de imagens
export const getImageUrl = (path: string | null, size: 'w500' | 'original' = 'w500'): string => {
  if (!path) return '';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

export const getPosterUrl = (path: string | null): string => getImageUrl(path, 'w500');
export const getBackdropUrl = (path: string | null): string => getImageUrl(path, 'original');

// Funções auxiliares para chamadas comuns da API (Client Side via Proxy)
export const fetchGenres = async (mediaType: 'movie' | 'tv') => {
  const response = await tmdbApi.get(`/genre/${mediaType}/list`);
  return response.data?.genres || [];
};

export const fetchDiscover = async (
  mediaType: 'movie' | 'tv',
  page: number,
  genreId?: number | null,
  options?: { signal?: AbortSignal }
) => {
  const params: Record<string, number> = { page };
  if (genreId) {
    params.with_genres = genreId;
  }
  const response = await tmdbApi.get(`/discover/${mediaType}`, { params, signal: options?.signal });
  return response.data || { results: [] };
};

export const fetchMediaDetails = async (mediaType: 'movie' | 'tv', id: string) => {
  const response = await tmdbApi.get(`/${mediaType}/${id}`);
  return response.data;
};

export const fetchMediaVideos = async (mediaType: 'movie' | 'tv', id: string) => {
  const response = await tmdbApi.get(`/${mediaType}/${id}/videos`, {
    params: { language: 'en-US' },
  });
  return response.data?.results || [];
};

export const searchMedia = async (
  mediaType: 'movie' | 'tv' | 'multi',
  query: string,
  page: number = 1
) => {
  const response = await tmdbApi.get(`/search/${mediaType}`, {
    params: { query, page },
  });
  return response.data || { results: [] };
};

export const fetchStreamingProviders = async (mediaType: 'movie' | 'tv', id: string) => {
  const response = await tmdbApi.get(`/${mediaType}/${id}/watch/providers`);
  return response.data?.results ?? {};
};

// DEV-001: fetchMediaDirect removed — use fetchMediaDetailsServer (tmdb-server.ts) instead.
// That function includes ISR caching (revalidate: 3600) and is the canonical SSR fetcher.
