import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export function SupabaseConfigNotice() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <InfoIcon className="h-5 w-5" />
            Configuration Required
          </CardTitle>
          <CardDescription>
            Supabase credentials needed to enable authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              This social media automation platform requires Supabase authentication credentials to function properly.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-medium">Required Environment Variables:</h4>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• VITE_SUPABASE_URL</li>
                <li>• VITE_SUPABASE_ANON_KEY</li>
                <li>• SUPABASE_DATABASE_URL</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium">Get these from your Supabase project:</h4>
              <ol className="mt-2 space-y-1 text-muted-foreground">
                <li>1. Go to Settings → API</li>
                <li>2. Copy Project URL and anon public key</li>
                <li>3. Go to Settings → Database</li>
                <li>4. Copy Transaction pooler connection string</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}