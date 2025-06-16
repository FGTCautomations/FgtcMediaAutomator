import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "@/lib/queryClient";

export interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  role: string;
}

export interface AuthResponse {
  user: User | null;
  token: string | null;
  error: string | null;
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

  // Get current user
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/user", {
        credentials: "include",
      });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
    retry: false,
  });

  // Sign up mutation
  const signupMutation = useMutation<AuthResponse, Error, SignupCredentials>({
    mutationFn: async (data) => {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.user) {
        queryClient.setQueryData(["/api/auth/user"], data.user);
        if (data.token) {
          localStorage.setItem("auth_token", data.token);
        }
      }
    },
  });

  // Sign in mutation
  const signinMutation = useMutation<AuthResponse, Error, LoginCredentials>({
    mutationFn: async (data) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.user) {
        queryClient.setQueryData(["/api/auth/user"], data.user);
        if (data.token) {
          localStorage.setItem("auth_token", data.token);
        }
      }
    },
  });

  // Sign out mutation
  const signoutMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
      localStorage.removeItem("auth_token");
      queryClient.clear();
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signup: signupMutation.mutate,
    signin: signinMutation.mutate,
    signout: signoutMutation.mutate,
    isSigningUp: signupMutation.isPending,
    isSigningIn: signinMutation.isPending,
    isSigningOut: signoutMutation.isPending,
    signupError: signupMutation.error,
    signinError: signinMutation.error,
  };
}