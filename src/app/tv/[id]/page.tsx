"use client";

import React, { use } from 'react';
import MediaDetailsPage from '@/components/MediaDetailsPage';

interface PageProps {
  params: Promise<{ id: string }>;
}

const TvDetailsPage = ({ params }: PageProps) => {
  const { id } = use(params);
  return <MediaDetailsPage mediaType="tv" id={id} />;
};

export default TvDetailsPage;

