'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <h2 style={{ fontSize: '1.5rem', color: '#f1f5f9', marginBottom: '1rem' }}>
        Algo deu errado!
      </h2>
      <p style={{ color: '#9ab', marginBottom: '1.5rem', maxWidth: '400px' }}>
        {error.message || 'Ocorreu um erro inesperado. Por favor, tente novamente.'}
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
        Tentar novamente
      </button>
    </div>
  );
}
