/**
 * Server-side TMDB fetcher — usa a API diretamente com a chave da env.
 * Usado exclusivamente em Server Components (ex: generateMetadata).
 */
const TMDB_API_BASE = 'https://api.themoviedb.org/3';

export async function fetchMediaDetailsServer(mediaType: 'movie' | 'tv', id: string) {
  const res = await fetch(
    `${TMDB_API_BASE}/${mediaType}/${id}?api_key=${process.env.TMDB_API_KEY}&language=pt-BR`,
    { next: { revalidate: 3600 } } // cache 1h
  );

  if (!res.ok) return null;
  return res.json();
}
