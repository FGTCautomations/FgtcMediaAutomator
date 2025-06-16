import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ErrorBoundary } from "@/components/feedback/error-boundary";
import AuthWrapper from "@/components/auth/auth-wrapper";
import Dashboard from "@/pages/dashboard";
import Calendar from "@/pages/calendar";
import Compose from "@/pages/compose";
import Analytics from "@/pages/analytics";
import Automations from "@/pages/automations";
import ContentLibrary from "@/pages/content-library";
import ContentManagement from "@/pages/content-management";
import Team from "@/pages/team";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <ErrorBoundary>
      <AuthWrapper>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/calendar" component={Calendar} />
          <Route path="/compose" component={Compose} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/automations" component={Automations} />
          <Route path="/content-library" component={ContentLibrary} />
          <Route path="/content-management" component={ContentManagement} />
          <Route path="/team" component={Team} />
          <Route component={NotFound} />
        </Switch>
      </AuthWrapper>
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
