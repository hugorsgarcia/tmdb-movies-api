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
async function fetchUserProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Listener de sessão do Supabase Auth
  useEffect(() => {
    // Verificar sessão existente ao carregar
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        setUser(profile);
      }
      setLoading(false);
    };

    initSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          setUser(profile);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Rate limit client-side (SEC-004 — dupla camada)
      checkRateLimit(email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        recordFailedAttempt(email);
        throw new Error('Email ou senha incorretos');
      }

      // Login OK — zerar contagem
      clearRateLimit(email);

      if (data.user) {
        const profile = await fetchUserProfile(data.user.id);
        setUser(profile);
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (username: string, email: string, password: string, displayName: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: displayName,
            avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`,
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

      // Verificar se username já existe (unique constraint)
      if (data.user) {
        const profile = await fetchUserProfile(data.user.id);
        setUser(profile);
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
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
