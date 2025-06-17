import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, type User as SupabaseUser, type Session, hasSupabaseConfig } from "@/lib/supabase";
import { useEffect, useState } from "react";

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name: string;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  // Initialize auth state with Supabase
  useEffect(() => {
    let mounted = true;

    if (!hasSupabaseConfig || !supabase) {
      // No Supabase configuration, user is not authenticated
      if (mounted) {
        setUser(null);
        setSession(null);
        setIsLoading(false);
      }
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name || session.user.user_metadata?.full_name,
            avatar: session.user.user_metadata?.avatar_url,
          });
        }
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name || session.user.user_metadata?.full_name,
            avatar: session.user.user_metadata?.avatar_url,
          });
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Sign up mutation
  const signupMutation = useMutation({
    mutationFn: async (data: SignupCredentials) => {
      if (!hasSupabaseConfig || !supabase) {
        throw new Error("Authentication service not configured. Please provide Supabase credentials.");
      }
      
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            full_name: data.name,
          },
        },
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return authData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });

  // Sign in mutation
  const signinMutation = useMutation({
    mutationFn: async (data: LoginCredentials) => {
      if (!hasSupabaseConfig || !supabase) {
        throw new Error("Authentication service not configured. Please provide Supabase credentials.");
      }
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return authData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });

  // Sign out mutation
  const signoutMutation = useMutation({
    mutationFn: async () => {
      if (!hasSupabaseConfig || !supabase) {
        throw new Error("Authentication service not configured.");
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      if (!hasSupabaseConfig || !supabase) {
        throw new Error("Authentication service not configured.");
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        throw new Error(error.message);
      }
    },
  });

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signup: signupMutation.mutate,
    signin: signinMutation.mutate,
    signout: signoutMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    isSigningUp: signupMutation.isPending,
    isSigningIn: signinMutation.isPending,
    isSigningOut: signoutMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
    signupError: signupMutation.error,
    signinError: signinMutation.error,
    resetPasswordError: resetPasswordMutation.error,
  };
}