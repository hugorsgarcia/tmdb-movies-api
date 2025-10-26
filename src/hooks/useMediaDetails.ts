import { useState, useEffect } from 'react';
import { fetchMediaDetails, fetchMediaVideos } from '@/utils/tmdb';
import { MediaItem } from '@/types/media';

interface VideoResult {
  type: string;
  site: string;
  key: string;
}

export function useMediaDetails(mediaType: 'movie' | 'tv', id: string) {
  const [mediaData, setMediaData] = useState<MediaItem | null>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMediaDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [details, videos] = await Promise.all([
          fetchMediaDetails(mediaType, id),
          fetchMediaVideos(mediaType, id),
        ]);

        setMediaData(details);

        const officialTrailer = (videos as VideoResult[]).find(
          (video) => video.type === 'Trailer' && video.site === 'YouTube'
        );

        setTrailerKey(officialTrailer?.key || null);
      } catch (err) {
        console.error('Error fetching media details:', err);
        setError('Não foi possível carregar os detalhes. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    loadMediaDetails();
  }, [mediaType, id]);

  const retry = () => {
    setLoading(true);
    setError(null);
    // Re-executar a chamada
    const loadMediaDetails = async () => {
      try {
        const [details, videos] = await Promise.all([
          fetchMediaDetails(mediaType, id),
          fetchMediaVideos(mediaType, id),
        ]);

        setMediaData(details);

        const officialTrailer = (videos as VideoResult[]).find(
          (video) => video.type === 'Trailer' && video.site === 'YouTube'
        );

        setTrailerKey(officialTrailer?.key || null);
      } catch (err) {
        console.error('Error fetching media details:', err);
        setError('Não foi possível carregar os detalhes. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    loadMediaDetails();
  };

  return { mediaData, trailerKey, loading, error, retry };
}
