import SkeletonCard from '@/components/SkeletonCard';

export default function Loading() {
  return (
    <div style={{ padding: '1rem' }}>
      <ul className="movie-list">
        {[...Array(12)].map((_, i) => (
          <SkeletonCard key={`loading-skeleton-${i}`} />
        ))}
      </ul>
    </div>
  );
}
