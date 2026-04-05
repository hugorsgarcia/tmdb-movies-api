import { Metadata } from 'next';
import { fetchMediaDetailsServer } from '@/utils/tmdb-server';
import MediaDetailsPage from '@/components/MediaDetailsPage';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const movie = await fetchMediaDetailsServer('movie', id);

  if (!movie) {
    return { title: 'Filme não encontrado — CineSync' };
  }

  return {
    title: `${movie.title} — CineSync`,
    description: movie.overview || `Detalhes sobre ${movie.title}`,
    openGraph: {
      title: movie.title,
      description: movie.overview,
      images: movie.backdrop_path
        ? [`https://image.tmdb.org/t/p/original${movie.backdrop_path}`]
        : [],
    },
  };
}

export default async function MovieDetailsPage({ params }: PageProps) {
  const { id } = await params;
  return <MediaDetailsPage mediaType="movie" id={id} />;
}
