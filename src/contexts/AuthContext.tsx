'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '@/types/user';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ===== Rate Limiting (SEC-004 — dupla camada: client + Supabase nativo) =====
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutos

function checkRateLimit(email: string): void {
  const attemptKey = `login_attempts_${email}`;
  const attempts = JSON.parse(localStorage.getItem(attemptKey) || '{"count":0,"lockUntil":0}');

  if (attempts.lockUntil > Date.now()) {
    const minutesLeft = Math.ceil((attempts.lockUntil - Date.now()) / 60000);
    throw new Error(`Muitas tentativas. Tente novamente em ${minutesLeft} minutos.`);
  }
}

function recordFailedAttempt(email: string): void {
  const attemptKey = `login_attempts_${email}`;
  const attempts = JSON.parse(localStorage.getItem(attemptKey) || '{"count":0,"lockUntil":0}');
  attempts.count += 1;
  if (attempts.count >= MAX_ATTEMPTS) {
    attempts.lockUntil = Date.now() + LOCKOUT_DURATION;
  }
  localStorage.setItem(attemptKey, JSON.stringify(attempts));
}

function clearRateLimit(email: string): void {
  localStorage.removeItem(`login_attempts_${email}`);
}

// ===== Helper: mapear profile do Supabase para tipo User =====
// Falls back to auth-user metadata so login never silently fails when
// the profiles row is missing (e.g. trigger not yet applied).
interface AuthUserMeta {
  username?: string;
  display_name?: string;
  email?: string;
  avatar_url?: string;
  created_at?: string;
}

async function fetchUserProfile(userId: string, fallback?: AuthUserMeta): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    // DBA-001: Explicit column selection — avoids over-fetching
    .select('id, username, email, display_name, avatar_url, bio, location, website, joined_date')
    .eq('id', userId)
    .single();

  if (!error && data) {
    return {
      id: data.id,
      username: data.username,
      email: data.email,
      displayName: data.display_name,
      avatar: data.avatar_url,
      bio: data.bio || '',
      location: data.location,
      website: data.website,
      joinedDate: data.joined_date,
    };
  }

  // profiles row missing — build a minimal User from auth metadata so the
  // user is still recognised as authenticated while the DB catches up.
  if (fallback) {
    const username = fallback.username
      || fallback.email?.split('@')[0]
      || userId.slice(0, 8);
    return {
      id: userId,
      username,
      email: fallback.email ?? '',
      displayName: fallback.display_name || username,
      avatar: fallback.avatar_url,
      joinedDate: fallback.created_at ?? new Date().toISOString(),
    };
  }

  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Listener de sessão do Supabase Auth
  useEffect(() => {
    // Verificar sessão existente ao carregar
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const u = session.user;
        const profile = await fetchUserProfile(u.id, {
          username: u.user_metadata?.username,
          display_name: u.user_metadata?.display_name,
          email: u.email,
          avatar_url: u.user_metadata?.avatar_url,
          created_at: u.created_at,
        });
        setUser(profile);
      }
      setLoading(false);
    };

    initSession();

    // Escutar mudanças de autenticação — apenas SIGNED_OUT precisa de handler
    // explícito aqui; SIGNED_IN é tratado pelo próprio login() / signup() para
    // evitar corrida de condição com dois fetchUserProfile simultâneos.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (event === 'INITIAL_SESSION' && session?.user) {
          // Fired synchronously with stored session on first load — handled by initSession above
          // but may fire before initSession resolves; use it as a safety net.
          const u = session.user;
          const profile = await fetchUserProfile(u.id, {
            username: u.user_metadata?.username,
            display_name: u.user_metadata?.display_name,
            email: u.email,
            avatar_url: u.user_metadata?.avatar_url,
            created_at: u.created_at,
          });
          setUser(profile);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    // NOTE: do NOT set the global `loading` here — that is reserved for the
    // initial session check. Each form manages its own loading state locally.
    try {
      // Rate limit client-side (SEC-004 — dupla camada)
      checkRateLimit(email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        recordFailedAttempt(email);
        console.error('[Auth] Supabase login error:', error.message);

        // Mapear erros do Supabase para mensagens amigáveis
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Email ainda não confirmado. Verifique sua caixa de entrada.');
        }
        throw new Error('Email ou senha incorretos');
      }

      // Login OK — zerar contagem
      clearRateLimit(email);

      if (data.user) {
        const u = data.user;
        const profile = await fetchUserProfile(u.id, {
          username: u.user_metadata?.username,
          display_name: u.user_metadata?.display_name,
          email: u.email,
          avatar_url: u.user_metadata?.avatar_url,
          created_at: u.created_at,
        });
        setUser(profile);
      }
    } catch (error) {
      throw error;
    }
  };

  const signup = async (username: string, email: string, password: string, displayName: string) => {
    try {
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: displayName,
            avatar_url: avatarUrl,
          },
        },
      });

      if (error) {
        // Mapear erros comuns do Supabase
        if (error.message.includes('already registered')) {
          throw new Error('Email já cadastrado');
        }
        throw new Error(error.message);
      }

      if (data.user) {
        const u = data.user;
        // Attempt to insert the profiles row (requires INSERT policy or trigger).
        // Silently ignored if the trigger already created the row.
        await supabase.from('profiles').upsert({
          id: u.id,
          username,
          email,
          display_name: displayName,
          avatar_url: avatarUrl,
          joined_date: new Date().toISOString(),
        }, { onConflict: 'id', ignoreDuplicates: true });

        const profile = await fetchUserProfile(u.id, {
          username,
          display_name: displayName,
          email,
          avatar_url: avatarUrl,
          created_at: u.created_at,
        });
        setUser(profile);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
