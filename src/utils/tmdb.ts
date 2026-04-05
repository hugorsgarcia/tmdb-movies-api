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
  genreId?: number | null
) => {
  const params: Record<string, number> = { page };
  if (genreId) {
    params.with_genres = genreId;
  }
  const response = await tmdbApi.get(`/discover/${mediaType}`, { params });
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

// Funções auxiliares para chamadas diretas Server Side (SSR/SSG Sem Proxy)
export const fetchMediaDirect = async (mediaType: 'movie' | 'tv', id: string) => {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error('TMDB_API_KEY lacks in environment variables');
  }
  const response = await fetch(`https://api.themoviedb.org/3/${mediaType}/${id}?api_key=${apiKey}&language=pt-BR`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${mediaType} ${id} details`);
  }
  return response.json();
};
