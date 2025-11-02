'use client';

import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
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

export default function WatchLogModal({
  isOpen,
  onClose,
  mediaId,
  mediaType,
  mediaTitle,
  posterPath,
}: Props) {
  const { addWatchLog, getWatchLog, removeWatchLog } = useInteractions();
  const existingLog = getWatchLog(mediaId, mediaType);

  const [watchedDate, setWatchedDate] = useState('');
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  useEffect(() => {
    if (existingLog) {
      setWatchedDate(existingLog.watchedDate.split('T')[0]);
      setRating(existingLog.rating || 0);
      setReview(existingLog.review || '');
    } else {
      // Set today's date as default
      const today = new Date().toISOString().split('T')[0];
      setWatchedDate(today);
      setRating(0);
      setReview('');
    }
  }, [existingLog, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addWatchLog({
      mediaId,
      mediaType,
      mediaTitle,
      posterPath,
      watchedDate: new Date(watchedDate).toISOString(),
      rating: rating > 0 ? rating : undefined,
      review: review.trim() || undefined,
    });

    onClose();
  };

  const handleRemove = () => {
    removeWatchLog(mediaId, mediaType);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="watch-log-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="modal-header">
          <h2>{existingLog ? 'Editar Registro' : 'Registrar Visualização'}</h2>
          <p className="media-title">{mediaTitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="watchedDate">Data em que assistiu</label>
            <input
              type="date"
              id="watchedDate"
              value={watchedDate}
              onChange={(e) => setWatchedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

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
            <label htmlFor="review">Comentário rápido (opcional)</label>
            <textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="O que você achou?"
              rows={4}
              maxLength={500}
            />
            <small className="char-count">{review.length}/500</small>
          </div>

          <div className="modal-actions">
            {existingLog && (
              <button type="button" className="btn-remove" onClick={handleRemove}>
                Remover Registro
              </button>
            )}
            <div className="right-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn-submit">
                {existingLog ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
