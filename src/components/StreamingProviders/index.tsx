'use client';

import React, { useEffect, useState } from 'react';
import { fetchStreamingProviders } from '@/utils/tmdb';
import styles from './index.module.css';

interface Provider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

interface RegionProviders {
  link?: string;
  flatrate?: Provider[];
  rent?: Provider[];
  buy?: Provider[];
}

interface StreamingProvidersProps {
  mediaType: 'movie' | 'tv';
  id: string;
}

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w92';

const ProviderRow = ({ label, providers }: { label: string; providers: Provider[] }) => (
  <div className={styles.providerRow}>
    <span className={styles.label}>{label}</span>
    <div className={styles.logos}>
      {providers.map((p) => (
        <img
          key={p.provider_id}
          src={`${TMDB_IMAGE_BASE}${p.logo_path}`}
          alt={p.provider_name}
          title={p.provider_name}
          className={styles.logo}
          width={36}
          height={36}
        />
      ))}
    </div>
  </div>
);

const StreamingProviders = ({ mediaType, id }: StreamingProvidersProps) => {
  const [region, setRegion] = useState<RegionProviders | null>(null);
  const [providerLink, setProviderLink] = useState<string | null>(null);

  useEffect(() => {
    fetchStreamingProviders(mediaType, id)
      .then((results: Record<string, RegionProviders>) => {
        const br = results['BR'];
        if (br) {
          setRegion(br);
          setProviderLink(br.link ?? null);
        }
      })
      .catch(() => {
        // silently fail — section simply won't render
      });
  }, [mediaType, id]);

  if (!region) return null;

  const hasAny = region.flatrate?.length || region.rent?.length || region.buy?.length;
  if (!hasAny) return null;

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Onde Assistir</h3>
      {region.flatrate?.length ? (
        <ProviderRow label="Incluso em" providers={region.flatrate} />
      ) : null}
      {region.rent?.length ? (
        <ProviderRow label="Alugar" providers={region.rent} />
      ) : null}
      {region.buy?.length ? (
        <ProviderRow label="Comprar" providers={region.buy} />
      ) : null}
      {providerLink && (
        <a
          href={providerLink}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.tmdbLink}
        >
          Mais opções no TMDB
        </a>
      )}
    </div>
  );
};

export default StreamingProviders;
