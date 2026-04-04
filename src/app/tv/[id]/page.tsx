import { Metadata } from 'next';
import { fetchMediaDetailsServer } from '@/utils/tmdb-server';
import MediaDetailsPage from '@/components/MediaDetailsPage';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const tv = await fetchMediaDetailsServer('tv', id);

  if (!tv) {
    return { title: 'Série não encontrada — MyLetterboxd' };
  }

  return {
    title: `${tv.name} — MyLetterboxd`,
    description: tv.overview || `Detalhes sobre ${tv.name}`,
    openGraph: {
      title: tv.name,
      description: tv.overview,
      images: tv.backdrop_path
        ? [`https://image.tmdb.org/t/p/original${tv.backdrop_path}`]
        : [],
    },
  };
}

export default async function TvDetailsPage({ params }: PageProps) {
  const { id } = await params;
  return <MediaDetailsPage mediaType="tv" id={id} />;
}
