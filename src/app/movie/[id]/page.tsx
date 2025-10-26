'use client';

import React, { use } from 'react';
import MediaDetailsPage from '@/components/MediaDetailsPage';

interface PageProps {
  params: Promise<{ id: string }>;
}

const MovieDetailsPage = ({ params }: PageProps) => {
  const { id } = use(params);
  return <MediaDetailsPage mediaType="movie" id={id} />;
};

export default MovieDetailsPage;

