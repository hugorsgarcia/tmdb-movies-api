import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mocks globais úteis para o Next.js App Router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));
