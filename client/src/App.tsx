import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ErrorBoundary } from "@/components/feedback/error-boundary";
import { useAuth } from "@/hooks/useAuth";
import { hasSupabaseConfig } from "@/lib/supabase";
import { SupabaseConfigNotice } from "@/components/supabase-config-notice";
import { Loader2 } from "lucide-react";
import AppLayout from "@/components/layout/app-layout";
import LoginPage from "@/pages/login";
import SignupPage from "@/pages/signup";
import ResetPasswordPage from "@/pages/reset-password";
import Dashboard from "@/pages/dashboard";
import Calendar from "@/pages/calendar";
import Compose from "@/pages/compose";
import Analytics from "@/pages/analytics";
import Automations from "@/pages/automations";
import ContentLibrary from "@/pages/content-library";
import ContentManagement from "@/pages/content-management";
import CreateAutomation from "@/pages/create-automation";
import Team from "@/pages/team";
import NotFound from "@/pages/not-found";

function Router() {
  // Check if Supabase is configured
  if (!hasSupabaseConfig) {
    return <SupabaseConfigNotice />;
  }

  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Switch>
        {/* Auth routes - available when not logged in */}
        <Route path="/login" component={LoginPage} />
        <Route path="/signup" component={SignupPage} />
        <Route path="/reset-password" component={ResetPasswordPage} />
        
        {/* Protected routes - available when logged in */}
        {user ? (
          <AppLayout>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/calendar" component={Calendar} />
              <Route path="/compose" component={Compose} />
              <Route path="/analytics" component={Analytics} />
              <Route path="/automations" component={Automations} />
              <Route path="/create-automation" component={CreateAutomation} />
              <Route path="/content-library" component={ContentLibrary} />
              <Route path="/content-management" component={ContentManagement} />
              <Route path="/team" component={Team} />
              <Route component={NotFound} />
            </Switch>
          </AppLayout>
        ) : (
          /* Show login/signup when not authenticated */
          <>
            <Route path="/" component={LoginPage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/signup" component={SignupPage} />
            <Route path="/reset-password" component={ResetPasswordPage} />
          </>
        )}
        
        <Route component={NotFound} />
      </Switch>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
