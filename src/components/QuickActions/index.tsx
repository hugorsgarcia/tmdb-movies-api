'use client';

import React, { useState } from 'react';
import { FaHeart, FaRegHeart, FaList, FaEye, FaRegEye, FaInfoCircle } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { useInteractions } from '@/contexts/InteractionsContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AddToListModal from '../AddToListModal';
import './index.scss';

interface Props {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  mediaTitle: string;
  posterPath?: string;
  showLabels?: boolean;
  onWatchClick?: () => void;
  detailsLink?: string;
}

export default function QuickActions({
  mediaId,
  mediaType,
  mediaTitle,
  posterPath,
  showLabels = false,
  onWatchClick,
  detailsLink,
}: Props) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const {
    isLiked,
    toggleLike,
    isWatched,
  } = useInteractions();

  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [isListModalOpen, setIsListModalOpen] = useState(false);

  const handleAuthRequired = (action: () => void) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    action();
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleAuthRequired(() => toggleLike(mediaId, mediaType, mediaTitle, posterPath));
  };

  const handleListClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleAuthRequired(() => {
      setIsListModalOpen(true);
    });
  };

  const handleWatchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleAuthRequired(() => {
      if (onWatchClick) {
        onWatchClick();
      }
    });
  };

  const liked = isAuthenticated && isLiked(mediaId, mediaType);
  const watched = isAuthenticated && isWatched(mediaId, mediaType);

  return (
    <>
      <div className="quick-actions">
        {/* Like Button */}
        <button
        className={`action-btn like-btn ${liked ? 'active' : ''}`}
        onClick={handleLikeClick}
        onMouseEnter={() => setShowTooltip('like')}
        onMouseLeave={() => setShowTooltip(null)}
        aria-label={liked ? 'Remover curtida' : 'Curtir'}
      >
        {liked ? <FaHeart /> : <FaRegHeart />}
        {showLabels && <span>{liked ? 'Curtido' : 'Curtir'}</span>}
        {showTooltip === 'like' && !showLabels && (
          <span className="tooltip">{liked ? 'Remover curtida' : 'Curtir'}</span>
        )}
      </button>

      {/* Add to List Button */}
      <button
        className="action-btn list-btn"
        onClick={handleListClick}
        onMouseEnter={() => setShowTooltip('list')}
        onMouseLeave={() => setShowTooltip(null)}
        aria-label="Adicionar a uma lista"
      >
        <FaList />
        {showLabels && <span>Listas</span>}
        {showTooltip === 'list' && !showLabels && (
          <span className="tooltip">Adicionar a uma lista</span>
        )}
      </button>

      {/* Watch Button */}
      <button
        className={`action-btn watch-btn ${watched ? 'active' : ''}`}
        onClick={handleWatchClick}
        onMouseEnter={() => setShowTooltip('watch')}
        onMouseLeave={() => setShowTooltip(null)}
        aria-label={watched ? 'Assistido' : 'Marcar como assistido'}
      >
        {watched ? <FaEye /> : <FaRegEye />}
        {showLabels && <span>{watched ? 'Assistido' : 'Assistir'}</span>}
        {showTooltip === 'watch' && !showLabels && (
          <span className="tooltip">
            {watched ? 'Assistido' : 'Marcar como assistido'}
          </span>
        )}
      </button>

      {/* Details Button */}
      {detailsLink && (
        <Link href={detailsLink} className="action-btn details-btn">
          <button
            onMouseEnter={() => setShowTooltip('details')}
            onMouseLeave={() => setShowTooltip(null)}
            aria-label="Ver detalhes"
          >
            <FaInfoCircle />
            {showLabels && <span>Ver mais</span>}
            {showTooltip === 'details' && !showLabels && (
              <span className="tooltip">Ver mais</span>
            )}
          </button>
        </Link>
      )}
      </div>

      <AddToListModal
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        mediaId={mediaId}
        mediaType={mediaType}
        mediaTitle={mediaTitle}
        posterPath={posterPath}
      />
    </>
  );
}
