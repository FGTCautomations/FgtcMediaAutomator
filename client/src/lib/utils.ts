import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function formatPercentage(num: number): string {
  return num.toFixed(1) + '%';
}

export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) {
    return 'Just now';
  }
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }
  
  return date.toLocaleDateString();
}

export function formatScheduledTime(date: Date): string {
  const now = new Date();
  const diffInHours = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 24) {
    return `Today at ${date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })}`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return `Tomorrow at ${date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })}`;
  }
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export function getPlatformIcon(platform: string): string {
  const icons: Record<string, string> = {
    linkedin: 'fab fa-linkedin',
    instagram: 'fab fa-instagram',
    twitter: 'fab fa-twitter',
    youtube: 'fab fa-youtube',
    googlemybusiness: 'fas fa-map-marker-alt',
    bluesky: 'fas fa-cloud',
    tumblr: 'fab fa-tumblr',
    tiktok: 'fab fa-tiktok',
    pinterest: 'fab fa-pinterest',
  };
  return icons[platform] || 'fas fa-globe';
}

export function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    linkedin: 'text-blue-700',
    instagram: 'text-pink-500',
    twitter: 'text-blue-400',
    youtube: 'text-red-600',
    googlemybusiness: 'text-green-600',
    bluesky: 'text-sky-500',
    tumblr: 'text-indigo-600',
    tiktok: 'text-gray-900',
    pinterest: 'text-red-500',
  };
  return colors[platform] || 'text-gray-500';
}
