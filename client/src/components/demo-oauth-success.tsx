import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, User, Building2, Calendar, TrendingUp } from "lucide-react";

interface DemoOAuthSuccessProps {
  platform: string;
  onComplete: () => void;
}

export default function DemoOAuthSuccess({ platform, onComplete }: DemoOAuthSuccessProps) {
  const [step, setStep] = useState(1);

  const platformData = {
    linkedin: {
      name: "LinkedIn",
      icon: "fab fa-linkedin",
      color: "text-blue-600",
      user: {
        name: "John Smith",
        title: "Marketing Director",
        company: "Tech Solutions Inc.",
        followers: "2,847",
        connections: "1,234"
      },
      features: [
        "Post to personal profile",
        "Share company updates", 
        "Schedule professional content",
        "Track engagement metrics"
      ]
    }
  };

  const data = platformData[platform as keyof typeof platformData];
  if (!data) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-xl">
            {step === 1 ? `${data.name} Connected Successfully!` : `${data.name} Account Details`}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {step === 1 ? (
            <>
              <div className="text-center space-y-3">
                <p className="text-gray-600 dark:text-gray-400">
                  Your {data.name} account has been successfully connected to your social media management platform.
                </p>
                
                <div className="flex items-center justify-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <i className={`${data.icon} ${data.color} text-lg`}></i>
                  <span className="font-medium">{data.user.name}</span>
                  <Badge variant="secondary">Connected</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">What you can now do:</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  {data.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button 
                onClick={() => setStep(2)} 
                className="w-full"
              >
                View Account Details
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <User className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="font-medium">{data.user.name}</p>
                    <p className="text-sm text-gray-500">{data.user.title}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Building2 className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="font-medium">{data.user.company}</p>
                    <p className="text-sm text-gray-500">Company Page Access</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold">{data.user.followers}</span>
                    </div>
                    <p className="text-xs text-gray-500">Followers</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <User className="w-4 h-4 text-green-500" />
                      <span className="font-semibold">{data.user.connections}</span>
                    </div>
                    <p className="text-xs text-gray-500">Connections</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button onClick={onComplete} className="flex-1">
                  Done
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}