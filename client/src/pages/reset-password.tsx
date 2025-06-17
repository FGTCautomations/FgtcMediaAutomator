import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Mail, Lock } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

const resetRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetRequestForm = z.infer<typeof resetRequestSchema>;
type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<"request" | "reset">("request");
  const [resetToken, setResetToken] = useState("");

  // Check if we have a reset token in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromUrl = urlParams.get('token');
  
  if (tokenFromUrl && step === "request") {
    setResetToken(tokenFromUrl);
    setStep("reset");
  }

  const requestForm = useForm<ResetRequestForm>({
    resolver: zodResolver(resetRequestSchema),
    defaultValues: {
      email: "",
    },
  });

  const resetForm = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const requestResetMutation = useMutation({
    mutationFn: async (data: ResetRequestForm) => {
      const response = await fetch("/api/auth/reset-password-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send reset email");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reset email sent",
        description: "Check your email for password reset instructions.",
      });
      setStep("reset");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordForm) => {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: resetToken,
          password: data.password,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to reset password");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password reset successful",
        description: "You can now log in with your new password.",
      });
      setLocation("/login");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onRequestSubmit = (data: ResetRequestForm) => {
    requestResetMutation.mutate(data);
  };

  const onResetSubmit = (data: ResetPasswordForm) => {
    if (!resetToken) {
      toast({
        title: "Error",
        description: "Invalid reset token. Please request a new password reset.",
        variant: "destructive",
      });
      setStep("request");
      return;
    }
    resetPasswordMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <CardTitle className="text-2xl font-bold">
                {step === "request" ? "Reset Password" : "Set New Password"}
              </CardTitle>
            </div>
            <CardDescription>
              {step === "request" 
                ? "Enter your email address and we'll send you a link to reset your password."
                : "Enter your new password below."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "request" ? (
              <Form {...requestForm}>
                <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} className="space-y-4">
                  <FormField
                    control={requestForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input 
                              placeholder="Enter your email" 
                              type="email"
                              className="pl-10"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={requestResetMutation.isPending}
                  >
                    {requestResetMutation.isPending ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...resetForm}>
                <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
                  <FormField
                    control={resetForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input 
                              placeholder="Enter new password" 
                              type="password"
                              className="pl-10"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={resetForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input 
                              placeholder="Confirm new password" 
                              type="password"
                              className="pl-10"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2">
                    <Input
                      placeholder="Enter reset token (from email)"
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      className="text-sm"
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={resetPasswordMutation.isPending}
                    >
                      {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
            
            <div className="mt-6 text-center">
              <Link href="/login" className="text-sm text-blue-600 hover:text-blue-500">
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}