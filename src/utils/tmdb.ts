import axios from 'axios';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

if (!TMDB_API_KEY) {
  throw new Error('NEXT_PUBLIC_TMDB_API_KEY is not defined in environment variables');
}

// Configuração do cliente Axios para TMDB
export const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
    language: 'pt-BR',
  },
});

// Funções auxiliares para URLs de imagens
export const getImageUrl = (path: string | null, size: 'w500' | 'original' = 'w500'): string => {
  if (!path) return '';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

export const getPosterUrl = (path: string | null): string => getImageUrl(path, 'w500');
export const getBackdropUrl = (path: string | null): string => getImageUrl(path, 'original');

// Funções auxiliares para chamadas comuns da API
export const fetchGenres = async (mediaType: 'movie' | 'tv') => {
  const response = await tmdbApi.get(`/genre/${mediaType}/list`);
  return response.data.genres;
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
  return response.data;
};

export const fetchMediaDetails = async (mediaType: 'movie' | 'tv', id: string) => {
  const response = await tmdbApi.get(`/${mediaType}/${id}`);
  return response.data;
};

export const fetchMediaVideos = async (mediaType: 'movie' | 'tv', id: string) => {
  const response = await tmdbApi.get(`/${mediaType}/${id}/videos`, {
    params: {
      language: 'en-US', // Videos geralmente estão em inglês
    },
  });
  return response.data.results;
};

export const searchMedia = async (
  mediaType: 'movie' | 'tv' | 'multi',
  query: string,
  page: number = 1
) => {
  const response = await tmdbApi.get(`/search/${mediaType}`, {
    params: { query, page },
  });
  return response.data;
};
