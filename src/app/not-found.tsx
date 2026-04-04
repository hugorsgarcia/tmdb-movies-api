'use client';

import Link from 'next/link';
import './not-found.scss';

export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">Página não encontrada</h2>
        <p className="not-found-description">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link href="/" className="not-found-link">
          ← Voltar para o início
        </Link>
      </div>
    </div>
  );
}
