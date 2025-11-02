'use client';

import React, { useState, useEffect } from 'react';
import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import InteractiveStarRating from '@/components/InteractiveStarRating';
import { useInteractions } from '@/contexts/InteractionsContext';
import './index.scss';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  mediaTitle: string;
  posterPath?: string;
}

export default function ReviewModal({
  isOpen,
  onClose,
  mediaId,
  mediaType,
  mediaTitle,
  posterPath,
}: Props) {
  const { getReview, addReview, deleteReview } = useInteractions();
  const existingReview = getReview(mediaId, mediaType);

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [containsSpoilers, setContainsSpoilers] = useState(false);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating || 0);
      setReviewText(existingReview.reviewText);
      setContainsSpoilers(existingReview.containsSpoilers);
    } else {
      setRating(0);
      setReviewText('');
      setContainsSpoilers(false);
    }
  }, [existingReview, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (reviewText.trim().length < 10) {
      alert('A crítica deve ter pelo menos 10 caracteres.');
      return;
    }

    addReview({
      mediaId,
      mediaType,
      mediaTitle,
      posterPath,
      rating: rating > 0 ? rating : undefined,
      reviewText: reviewText.trim(),
      containsSpoilers,
    });

    onClose();
  };

  const handleDelete = () => {
    if (existingReview && confirm('Tem certeza que deseja excluir esta crítica?')) {
      deleteReview(existingReview.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="modal-header">
          <h2>{existingReview ? 'Editar Crítica' : 'Escrever Crítica'}</h2>
          <p className="media-title">{mediaTitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Sua avaliação (opcional)</label>
            <InteractiveStarRating
              rating={rating}
              onRatingChange={setRating}
              size="large"
              showValue
            />
            {rating > 0 && (
              <button
                type="button"
                className="clear-rating-btn"
                onClick={() => setRating(0)}
              >
                Limpar avaliação
              </button>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="reviewText">
              Sua crítica <span className="required">*</span>
            </label>
            <textarea
              id="reviewText"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Compartilhe sua opinião sobre este filme/série..."
              rows={8}
              maxLength={5000}
              required
              minLength={10}
            />
            <small className="char-count">{reviewText.length}/5000</small>
            <small className="help-text">Mínimo de 10 caracteres</small>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={containsSpoilers}
                onChange={(e) => setContainsSpoilers(e.target.checked)}
              />
              <span className="checkbox-text">
                <FaExclamationTriangle className="spoiler-icon" />
                Esta crítica contém spoilers
              </span>
            </label>
            <small className="help-text">
              Marque esta opção se sua crítica revelar detalhes importantes da trama
            </small>
          </div>

          <div className="modal-actions">
            {existingReview && (
              <button type="button" className="btn-remove" onClick={handleDelete}>
                Excluir Crítica
              </button>
            )}
            <div className="right-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn-submit">
                {existingReview ? 'Atualizar' : 'Publicar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
