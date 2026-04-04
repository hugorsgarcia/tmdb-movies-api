import { NextRequest, NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.TMDB_API_KEY;

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join('/');
  
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
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching data from TMDB:', error);
    return NextResponse.json({ error: 'Failed to fetch TMDB data' }, { status: 500 });
  }
}
