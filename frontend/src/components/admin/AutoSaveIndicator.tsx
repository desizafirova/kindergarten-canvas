import React, { useState, useEffect } from 'react';
import { Loader2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutoSaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  message?: string;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  status,
  message,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFading, setIsFading] = useState(false);

  // Handle visibility and fade-out for 'saved' state
  useEffect(() => {
    if (status === 'idle') {
      setIsVisible(false);
      setIsFading(false);
      return;
    }

    setIsVisible(true);
    setIsFading(false);

    if (status === 'saved') {
      // Start fade-out after 3 seconds
      const fadeTimer = setTimeout(() => {
        setIsFading(true);
      }, 3000);

      // Hide completely after fade animation (3s delay + 500ms fade)
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 3500);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [status]);

  // Don't render if idle or hidden
  if (!isVisible) {
    return null;
  }

  const getContent = () => {
    switch (status) {
      case 'saving':
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />,
          text: message || 'Запазва...',
          className: 'text-muted-foreground',
        };
      case 'saved':
        return {
          icon: <Check className="h-4 w-4" aria-hidden="true" />,
          text: message || 'Запазено',
          className: 'text-green-600 dark:text-green-500',
        };
      case 'error':
        return {
          icon: <X className="h-4 w-4" aria-hidden="true" />,
          text: message || 'Грешка при запазване',
          className: 'text-destructive',
        };
      default:
        return null;
    }
  };

  const content = getContent();

  if (!content) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm font-medium transition-opacity duration-500',
        content.className,
        isFading && 'opacity-0'
      )}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {content.icon}
      <span>{content.text}</span>
    </div>
  );
};
