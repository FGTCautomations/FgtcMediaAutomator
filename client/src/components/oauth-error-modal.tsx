import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ExternalLink, CheckCircle } from "lucide-react";

interface OAuthErrorModalProps {
  platform: string;
  error: string;
  onTryDemo: () => void;
  onClose: () => void;
}

export default function OAuthErrorModal({ platform, error, onTryDemo, onClose }: OAuthErrorModalProps) {
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);

  const getErrorMessage = (error: string) => {
    if (error.includes("unauthorized_scope_error")) {
      return "The requested permissions require approval from the platform's developer program.";
    }
    if (error.includes("redirect_uri_mismatch")) {
      return "The redirect URL needs to be configured in the developer application settings.";
    }
    if (error.includes("invalid_client")) {
      return "The application credentials need to be properly configured.";
    }
    return "There was an issue with the OAuth configuration.";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-xl">{platformName} Connection Issue</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-center space-y-3">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {getErrorMessage(error)}
            </p>
            
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-sm">
              <p className="text-orange-800 dark:text-orange-200">
                <strong>Why this happens:</strong> {platformName} requires special approval for posting permissions in production applications.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium">Try Demo Mode</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Experience the full platform functionality with a simulated {platformName} account.
              </p>
              <Button onClick={onTryDemo} className="w-full">
                Use Demo Connection
              </Button>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <ExternalLink className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Production Setup</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                For real connections, apply for developer access and configure production credentials.
              </p>
              <Button variant="outline" onClick={onClose} className="w-full">
                Setup Instructions
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}