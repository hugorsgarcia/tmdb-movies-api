import { NextRequest, NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.TMDB_API_KEY;

// SEC-001: Path allowlist — only permit valid TMDB API segments
const ALLOWED_PREFIXES = ['discover/', 'genre/', 'search/', 'movie/', 'tv/'];

// SEC-001: In-memory sliding-window rate limiter (60 req/min per IP, no external deps)
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 60;
const WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now >= entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count += 1;
  return true;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join('/');

  // SEC-001: Validate path against allowlist
  if (!ALLOWED_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return NextResponse.json({ error: 'Path not allowed' }, { status: 403 });
  }

  // SEC-001: Rate-limit by IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const searchParams = request.nextUrl.searchParams;

  // Injecting API Key server-side to avoid client-side leaks
  if (TMDB_API_KEY) {
    searchParams.set('api_key', TMDB_API_KEY);
  } else {
    console.error('TMDB_API_KEY is not defined in the backend environment constraints.');
  }

  // Set default language just like we did in client previously
  if (!searchParams.has('language')) {
    searchParams.set('language', 'pt-BR');
  }

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/${path}?${searchParams.toString()}`
    );
    const data = await response.json();

    // INFRA-002: Cache successful TMDB responses to reduce upstream API calls
    const isSuccess = response.status >= 200 && response.status < 300;
    return NextResponse.json(data, {
      status: response.status,
      headers: isSuccess
        ? { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' }
        : {},
    });
  } catch (error) {
    console.error('Error fetching data from TMDB:', error);
    return NextResponse.json({ error: 'Failed to fetch TMDB data' }, { status: 500 });
  }
}
