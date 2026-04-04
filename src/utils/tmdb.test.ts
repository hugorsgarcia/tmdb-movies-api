import { describe, it, expect, vi } from 'vitest';
import { tmdbApi, fetchDiscover } from './tmdb';

vi.mock('axios', () => {
  return {
    default: {
      create: vi.fn((config) => {
        return {
          get: vi.fn().mockResolvedValue({ data: { results: [] } }),
          defaults: config,
        };
      })
    }
  };
});

describe('TMDB Utility', () => {
  it('should not contain api_key in default params', () => {
    // Asserting that the configuration doesn't expose the API KEY directly
    expect(tmdbApi.defaults?.params?.api_key).toBeUndefined();
  });

  it('should point to internal proxy route', () => {
    // Ensuring that calls are mapped to our internal API Proxy
    expect(tmdbApi.defaults?.baseURL).toBe('/api/tmdb');
  });
});
