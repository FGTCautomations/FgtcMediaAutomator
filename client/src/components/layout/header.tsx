import { Button } from "@/components/ui/button";
import { useThemeContext } from "@/components/ui/theme-provider";
import { Link, useLocation } from "wouter";
import { Home } from "lucide-react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { theme, toggleTheme } = useThemeContext();
  const [location] = useLocation();
  const isDashboard = location === "/";

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
            )}
          </div>
          {!isDashboard && (
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </Button>
            </Link>
          )}
        </div>
        
      </div>
    </header>
  );
}
