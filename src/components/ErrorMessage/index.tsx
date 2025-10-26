import React from 'react';
import './index.scss';

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ 
  message = 'Ocorreu um erro ao carregar os dados. Por favor, tente novamente.',
  onRetry 
}: ErrorMessageProps) {
  return (
    <div className="error-message">
      <div className="error-content">
        <span className="error-icon">⚠️</span>
        <p className="error-text">{message}</p>
        {onRetry && (
          <button className="retry-button" onClick={onRetry}>
            Tentar Novamente
          </button>
        )}
      </div>
    </div>
  );
}
