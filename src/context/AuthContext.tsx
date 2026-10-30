/**
 * CivicAI - Supabase Authentication Context
 * Manages user sessions, registration, login, logout, password reset,
 * and automatic profile synchronization with public.profiles table.
 * Includes rate-limit protection and human-friendly error formatting.
 */

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, UserRole } from '../types/civic';

export interface AuthActionResult {
  success: boolean;
  requiresEmailConfirmation?: boolean;
  error: string | null;
  errorCode?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  role: UserRole;
  isLoading: boolean;
  isConfigured: boolean;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<AuthActionResult>;
  signIn: (email: string, password: string) => Promise<AuthActionResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthActionResult>;
  resendConfirmation: (email: string) => Promise<AuthActionResult>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper: Translates raw Supabase auth errors into clear, actionable messages
export function formatAuthError(error: any): { message: string; code?: string } {
  if (!error) return { message: 'An unknown error occurred.' };

  const rawMessage = error.message || String(error);
  const code = error.code || '';

  // 1. Email Rate Limit Exceeded
  if (
    rawMessage.toLowerCase().includes('rate limit') ||
    code === 'over_email_send_rate_limit' ||
    code === 'rate_limit_exceeded'
  ) {
    return {
      code: 'rate_limit_exceeded',
      message:
        'The Supabase email service has temporarily reached its sending limit (default is 3 emails/hour). If you already registered, your account exists! Please try logging in, or wait a few minutes before requesting another confirmation email.',
    };
  }

  // 2. User Already Exists
  if (
    rawMessage.toLowerCase().includes('already registered') ||
    rawMessage.toLowerCase().includes('user already exists') ||
    code === 'user_already_exists'
  ) {
    return {
      code: 'user_already_exists',
      message:
        'An account with this email already exists. Please switch to the "Log In" tab to sign in with your password.',
    };
  }

  // 3. Email Not Confirmed
  if (
    rawMessage.toLowerCase().includes('email not confirmed') ||
    code === 'email_not_confirmed'
  ) {
    return {
      code: 'email_not_confirmed',
      message:
        'Your email address has not been confirmed yet. Please check your inbox and spam folder for the verification link.',
    };
  }

  // 4. Invalid Login Credentials
  if (
    rawMessage.toLowerCase().includes('invalid login credentials') ||
    code === 'invalid_credentials'
  ) {
    return {
      code: 'invalid_credentials',
      message:
        'Invalid email or password. Please verify your credentials or use "Forgot Password".',
    };
  }

  // 5. Signups Disabled in Supabase Dashboard
  if (
    rawMessage.toLowerCase().includes('signups not allowed') ||
    code === 'signup_disabled'
  ) {
    return {
      code: 'signup_disabled',
      message:
        'Email signups are currently disabled in your Supabase Auth settings. In the Supabase Dashboard, visit Authentication > Providers > Email and enable "Allow new users to sign up".',
    };
  }

  return { code, message: rawMessage };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>('citizen');
  const [isLoading, setIsLoading] = useState(true);

  // Prevent duplicate concurrent requests
  const isAuthBusyRef = useRef(false);

  // Fetch or create profile for authenticated user
  const fetchUserProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('Error fetching profile from Supabase:', error);
      }

      if (data) {
        const userProf: UserProfile = {
          id: data.id,
          name: data.full_name || email.split('@')[0],
          email: data.email || email,
          phone: data.phone || '',
          role: (data.role as UserRole) || 'citizen',
          preferredLanguage: 'en',
          createdAt: data.created_at,
        };
        setProfile(userProf);
        setRole(userProf.role);
        return;
      }

      // Fallback in-memory profile if record not yet populated
      const fallback: UserProfile = {
        id: userId,
        name: email.split('@')[0],
        email,
        role: 'citizen',
        preferredLanguage: 'en',
        createdAt: new Date().toISOString(),
      };
      setProfile(fallback);
      setRole('citizen');
    } catch (err) {
      console.warn('Error in fetchUserProfile:', err);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    // 1. Check active session
    supabase.auth.getSession().then(({ data: { session: activeSession } }) => {
      setSession(activeSession);
      setUser(activeSession?.user ?? null);
      if (activeSession?.user) {
        fetchUserProfile(activeSession.user.id, activeSession.user.email || '');
      }
      setIsLoading(false);
    });

    // 2. Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          await fetchUserProfile(newSession.user.id, newSession.user.email || '');
        } else {
          setProfile(null);
          setRole('citizen');
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    phone?: string
  ): Promise<AuthActionResult> => {
    if (isAuthBusyRef.current) {
      return { success: false, error: 'A registration request is already processing.' };
    }
    isAuthBusyRef.current = true;

    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone?.trim() || '',
          },
        },
      });

      if (error) {
        const formatted = formatAuthError(error);
        return { success: false, error: formatted.message, errorCode: formatted.code };
      }

      // Check if session was returned directly or if confirmation is required
      const requiresEmailConfirmation = Boolean(data.user && !data.session);

      if (data.user) {
        // Also ensure public.profiles row is created
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: fullName.trim(),
            email: cleanEmail,
            phone: phone?.trim() || '',
            role: 'citizen',
          });
        } catch (profileErr) {
          console.warn('Profiles upsert note:', profileErr);
        }
      }

      return {
        success: true,
        requiresEmailConfirmation,
        error: null,
      };
    } catch (err: any) {
      const formatted = formatAuthError(err);
      return { success: false, error: formatted.message, errorCode: formatted.code };
    } finally {
      isAuthBusyRef.current = false;
    }
  };

  const signIn = async (email: string, password: string): Promise<AuthActionResult> => {
    if (isAuthBusyRef.current) {
      return { success: false, error: 'A login request is already processing.' };
    }
    isAuthBusyRef.current = true;

    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        const formatted = formatAuthError(error);
        return { success: false, error: formatted.message, errorCode: formatted.code };
      }

      return { success: true, error: null };
    } catch (err: any) {
      const formatted = formatAuthError(err);
      return { success: false, error: formatted.message, errorCode: formatted.code };
    } finally {
      isAuthBusyRef.current = false;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      setRole('citizen');
    } catch (err) {
      console.warn('Error signing out:', err);
    }
  };

  const resetPassword = async (email: string): Promise<AuthActionResult> => {
    if (isAuthBusyRef.current) {
      return { success: false, error: 'Request is already processing.' };
    }
    isAuthBusyRef.current = true;

    try {
      const cleanEmail = email.trim().toLowerCase();
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: window.location.origin,
      });

      if (error) {
        const formatted = formatAuthError(error);
        return { success: false, error: formatted.message, errorCode: formatted.code };
      }

      return { success: true, error: null };
    } catch (err: any) {
      const formatted = formatAuthError(err);
      return { success: false, error: formatted.message, errorCode: formatted.code };
    } finally {
      isAuthBusyRef.current = false;
    }
  };

  const resendConfirmation = async (email: string): Promise<AuthActionResult> => {
    if (isAuthBusyRef.current) {
      return { success: false, error: 'Request is already processing.' };
    }
    isAuthBusyRef.current = true;

    try {
      const cleanEmail = email.trim().toLowerCase();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
      });

      if (error) {
        const formatted = formatAuthError(error);
        return { success: false, error: formatted.message, errorCode: formatted.code };
      }

      return { success: true, error: null };
    } catch (err: any) {
      const formatted = formatAuthError(err);
      return { success: false, error: formatted.message, errorCode: formatted.code };
    } finally {
      isAuthBusyRef.current = false;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id, user.email || '');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        isLoading,
        isConfigured: isSupabaseConfigured,
        signUp,
        signIn,
        signOut,
        resetPassword,
        resendConfirmation,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
