'use client';

import React, { useState } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import './index.scss';

interface Props {
  rating: number; // 0 a 5 (incrementos de 0.5)
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'small' | 'medium' | 'large';
  showValue?: boolean;
}

export default function InteractiveStarRating({
  rating,
  onRatingChange,
  readonly = false,
  size = 'medium',
  showValue = false,
}: Props) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const handleClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (!readonly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    setHoverRating(null);
  };

  const displayRating = hoverRating !== null ? hoverRating : rating;

  const renderStar = (index: number) => {
    const value = index + 1;
    const halfValue = index + 0.5;

    if (displayRating >= value) {
      return <FaStar className="star full" />;
    } else if (displayRating >= halfValue) {
      return <FaStarHalfAlt className="star half" />;
    } else {
      return <FaRegStar className="star empty" />;
    }
  };

  return (
    <div className={`interactive-star-rating ${size} ${readonly ? 'readonly' : 'interactive'}`}>
      <div className="stars-container" onMouseLeave={handleMouseLeave}>
        {[0, 1, 2, 3, 4].map((index) => (
          <div key={index} className="star-wrapper">
            {/* Invisible hit areas for half-star detection */}
            {!readonly && (
              <>
                <div
                  className="star-half left"
                  onClick={() => handleClick(index + 0.5)}
                  onMouseEnter={() => handleMouseEnter(index + 0.5)}
                />
                <div
                  className="star-half right"
                  onClick={() => handleClick(index + 1)}
                  onMouseEnter={() => handleMouseEnter(index + 1)}
                />
              </>
            )}
            {/* Visible star display */}
            <div className="star-display">
              {renderStar(index)}
            </div>
          </div>
        ))}
      </div>
      {showValue && (
        <span className="rating-value">
          {displayRating > 0 ? displayRating.toFixed(1) : '—'}
        </span>
      )}
    </div>
  );
}
