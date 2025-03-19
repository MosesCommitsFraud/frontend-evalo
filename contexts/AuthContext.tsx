// AuthContext.tsx
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

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  forgotPassword: async () => ({ error: null }),
  resetPassword: async () => ({ error: null }),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Helper: Ensure the profile exists.
  async function ensureProfile(currentUser: User) {
    try {
      console.log("ensureProfile: checking for user", currentUser.id);
      const { data: existingProfile, error: selectError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();
      if (selectError) {
        console.error("Error selecting profile:", selectError);
      }
      if (!existingProfile) {
        console.log("No profile found, attempting insert for", currentUser.id);
        const { error: insertError, data: insertedData } = await supabase
          .from("profiles")
          .insert({
            id: currentUser.id,
            email: currentUser.email,
            full_name: currentUser.user_metadata?.full_name || "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select(); // return inserted rows
        if (insertError) {
          console.error("Error inserting profile:", insertError);
        } else {
          console.log("Profile inserted successfully:", insertedData);
        }
      } else {
        console.log("Profile already exists:", existingProfile);
      }
    } catch (err) {
      console.error("Error in ensureProfile:", err);
    }
  }

  // INITIALIZE AND LISTEN FOR AUTH STATE CHANGES
  useEffect(() => {
    async function initializeAuth() {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        if (initialSession?.user) {
          await ensureProfile(initialSession.user);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    }
    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth state changed:", event);
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        await ensureProfile(newSession.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    try {
      // 1) Attempt to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Return the error if sign-in fails
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

      // 3) Check if the user already has a profile
      const { data: existingProfile, error: selectError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (selectError) {
        console.error("Error checking profile:", selectError);
      }

      // 4) If no profile exists, create it
      if (!existingProfile) {
        const { error: insertError } = await supabase.from("profiles").insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (insertError) {
          console.error("Error creating profile:", insertError);
        }
      }

      // 5) Redirect after sign-in (and profile check/creation) is complete
      const redirectTo = searchParams.get("redirectTo") || "/dashboard";
      router.push(redirectTo);

      return { error: null };
    } catch (error) {
      console.error("Error in signIn:", error);
      return { error: error as AuthError };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Create the user – Supabase sends the confirmation email automatically.
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      if (error) {
        console.error("Error during signup:", error);
        return { error };
      }

      // Immediately route to the confirm-mail page.
      router.push(`/confirm-mail?email=${encodeURIComponent(email)}`);
      return { error: null };
    } catch (error) {
      console.error("Error signing up:", error);
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      return { error };
    } catch (error) {
      console.error("Error resetting password:", error);
      return { error: error as AuthError };
    }
  };

  const resetPassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (!error) {
        router.push("/auth/sign-in?reset=success");
      }
      return { error };
    } catch (error) {
      console.error("Error resetting password:", error);
      return { error: error as AuthError };
    }
  };

  const value: AuthContextType = {
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
  return useContext(AuthContext);
}
