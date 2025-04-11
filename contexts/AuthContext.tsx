"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
  ) => Promise<{
    error: AuthError | null;
    emailConfirmationRequired?: boolean;
  }>;
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
  const searchParams = useSearchParams();

  // Helper function to get the site URL
  const getSiteUrl = () => {
    return typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL;
  };

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

  const signIn = async (email: string, password: string) => {
    try {
      // 1) Attempt to sign in
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Error signing in:", error);
        return { error };
      }

      // 2) Fetch the current session to get the signed-in user
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // If session or user is missing, something went wrong
      if (!session || !session.user) {
        return { error: { message: "No user session found." } as AuthError };
      }

      const user = session.user;

      // 3) Check if the user already has a profile - IMPROVED ERROR HANDLING
      const { data: existingProfile, error: selectError } = await supabase
        .from("profiles")
        .select("*, organization_id")
        .eq("id", user.id)
        .single(); // Changed from maybeSingle() to single() for stricter error handling

      if (selectError) {
        console.error("Error checking profile:", selectError);

        // Check if error is because profile doesn't exist
        if (selectError.code === "PGRST116") {
          // Create new profile as before
          const { error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || "",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              department: "", // Include required fields
            });

          if (insertError) {
            console.error("Error creating profile:", insertError);
          }

          // No organization, redirect to organization page
          window.location.href = "/auth/organization";
          return { error: null };
        } else {
          // Some other error occurred with the query
          return { error: selectError as unknown as AuthError };
        }
      }

      // 5) Now we can safely check if user belongs to an organization
      if (!existingProfile?.organization_id) {
        // If no organization, redirect to organization page
        window.location.href = "/auth/organization";
        return { error: null };
      }

      // 6) Redirect after sign-in to dashboard or requested page
      const redirectTo = searchParams.get("redirectTo") || "/dashboard";
      window.location.href = redirectTo;

      return { error: null };
    } catch (error) {
      console.error("Error in signIn:", error);
      return { error: error as AuthError };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Get the site URL for redirects
      const siteUrl = getSiteUrl();

      // First sign up the user with proper redirect URL
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${siteUrl}/auth/callback`,
        },
      });

      if (error) {
        console.error("Error during signup:", error);
        return { error };
      }

      // Get the user from the signup response directly
      const newUser = data.user;

      // Check if email confirmation is needed
      const needsEmailConfirmation =
        newUser?.identities?.some(
          (identity) => !identity.identity_data?.email_confirmed_at,
        ) ?? true;

      if (newUser) {
        console.log("Creating profile for user:", newUser.id);

        try {
          // First check if profile already exists
          const { data: existingProfile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", newUser.id)
            .maybeSingle();

          if (existingProfile) {
            console.log("Profile already exists for user:", newUser.id);
          } else {
            // Insert profile record with proper error handling
            const { data: insertedProfile, error: profileError } =
              await supabase
                .from("profiles")
                .insert({
                  id: newUser.id,
                  email: newUser.email || email, // Fallback to provided email
                  full_name: fullName,
                  role: "teacher", // Default role
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  department: "", // Include required fields
                })
                .select();

            if (profileError) {
              console.error(
                "Error creating profile - full details:",
                JSON.stringify(profileError),
              );
              // Log more details about what we're trying to insert
              console.log("Attempted to insert:", {
                id: newUser.id,
                email: newUser.email || email,
                full_name: fullName,
              });
            } else {
              console.log("Profile created successfully:", insertedProfile);
            }
          }
        } catch (err) {
          console.error("Exception during profile creation:", err);
        }
      } else {
        console.error("No user returned from sign-up operation");
      }

      // If email confirmation is needed, don't redirect and return emailConfirmationRequired flag
      if (needsEmailConfirmation) {
        return { error: null, emailConfirmationRequired: true };
      }

      // If no email confirmation needed, proceed with redirect
      const redirectTo = searchParams.get("redirectTo") || "/dashboard";
      window.location.href = redirectTo;

      return { error: null };
    } catch (error) {
      console.error("Error signing up:", error);
      return { error: error as AuthError };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Password reset request
  const forgotPassword = async (email: string) => {
    try {
      // Get the site URL for redirects
      const siteUrl = getSiteUrl();

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/auth/reset-password`,
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
        window.location.href = "/auth/sign-in?reset=success";
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
