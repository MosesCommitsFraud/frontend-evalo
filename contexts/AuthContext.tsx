// contexts/AuthContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Session, User, AuthError } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ error: AuthError | null }>;
  resetPassword: (password: string) => Promise<{ error: AuthError | null }>;
};

// Create a default value for the context
const defaultAuthContext: AuthContextType = {
  user: null,
  session: null,
  isLoading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  forgotPassword: async () => ({ error: null }),
  resetPassword: async () => ({ error: null }),
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Create the Supabase client
  const supabase = createClient();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        setSession(initialSession);
        setUser(initialSession?.user ?? null);
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log("Auth state changed:", event);
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error) {
        // If redirectTo param exists, use it, otherwise go to dashboard
        const redirectTo = searchParams.get("redirectTo") || "/dashboard";
        router.push(redirectTo);
      }

      return { error };
    } catch (error) {
      console.error("Error signing in:", error);
      return { error: error as AuthError };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (!error) {
        // On successful signup, create a profile record
        const {
          data: { user: newUser },
        } = await supabase.auth.getUser();

        if (newUser) {
          await supabase.from("profiles").insert({
            id: newUser.id,
            email: newUser.email,
            full_name: fullName,
            role: "teacher", // Default role
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }

        const redirectTo = searchParams.get("redirectTo") || "/dashboard";
        router.push(redirectTo);
      }

      return { error };
    } catch (error) {
      console.error("Error signing up:", error);
      return { error: error as AuthError };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Password reset request
  const forgotPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      return { error };
    } catch (error) {
      console.error("Error requesting password reset:", error);
      return { error: error as AuthError };
    }
  };

  // Set new password
  const resetPassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (!error) {
        router.push("/auth/sign-in?reset=success");
      }

      return { error };
    } catch (error) {
      console.error("Error resetting password:", error);
      return { error: error as AuthError };
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}
