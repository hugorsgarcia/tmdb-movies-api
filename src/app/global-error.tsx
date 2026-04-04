'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body style={{ background: '#14181c', margin: 0 }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}>
          <h2 style={{ fontSize: '1.5rem', color: '#f1f5f9', marginBottom: '1rem' }}>
            Erro crítico na aplicação
          </h2>
          <p style={{ color: '#9ab', marginBottom: '1.5rem', maxWidth: '400px' }}>
            {error.message || 'Ocorreu um erro inesperado. Tente recarregar a página.'}
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: '0.75rem 2rem',
              background: '#00c030',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '1rem',
            }}
          >
            Recarregar
          </button>
        </div>
      </body>
    </html>
  );
}
