'use client';

import React, { useState } from 'react';
import { FaHeart, FaRegHeart, FaExclamationTriangle } from 'react-icons/fa';
import InteractiveStarRating from '@/components/InteractiveStarRating';
import './index.scss';

interface Props {
  username: string;
  userAvatar?: string;
  rating?: number;
  reviewText: string;
  containsSpoilers: boolean;
  likes: number;
  createdAt: string;
  onLike?: () => void;
  isLiked?: boolean;
}

export default function ReviewCard({
  username,
  userAvatar,
  rating,
  reviewText,
  containsSpoilers,
  likes,
  createdAt,
  onLike,
  isLiked = false,
}: Props) {
  const [showSpoilers, setShowSpoilers] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="review-card">
      <div className="review-header">
        <div className="user-info">
          <div className="user-avatar">
            {userAvatar ? (
              <img src={userAvatar} alt={username} />
            ) : (
              <span>{username.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="user-details">
            <h3 className="username">{username}</h3>
            <p className="review-date">{formatDate(createdAt)}</p>
          </div>
        </div>
        {rating && rating > 0 && (
          <InteractiveStarRating rating={rating} readonly size="small" showValue />
        )}
      </div>

      {containsSpoilers && !showSpoilers && (
        <div className="spoiler-warning">
          <FaExclamationTriangle />
          <p>Esta crítica contém spoilers</p>
          <button onClick={() => setShowSpoilers(true)} className="show-spoilers-btn">
            Mostrar mesmo assim
          </button>
        </div>
      )}

      {(!containsSpoilers || showSpoilers) && (
        <div className="review-content">
          <p>{reviewText}</p>
        </div>
      )}

      <div className="review-footer">
        <button
          className={`like-btn ${isLiked ? 'liked' : ''}`}
          onClick={onLike}
          disabled={!onLike}
        >
          {isLiked ? <FaHeart /> : <FaRegHeart />}
          <span>{likes > 0 ? likes : ''}</span>
        </button>
      </div>
    </div>
  );
}
