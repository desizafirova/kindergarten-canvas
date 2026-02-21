import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'draft' | 'published';
  className?: string;
}

// Conditional styling based on status
const statusStyles: Record<string, string> = {
  draft: 'bg-amber-500 text-white',
  published: 'bg-green-500 text-white',
};

/**
 * StatusBadge component displays content status with visual indicators.
 * Uses both color and text to convey status (WCAG compliant).
 *
 * @param status - The status to display ('draft' or 'published')
 * @param className - Optional additional CSS classes
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const t = useTranslation();

  const statusText: Record<string, string> = {
    draft: t.status.draft,
    published: t.status.published,
  };

  // Defensive fallback for invalid status (TypeScript should prevent, but runtime safety)
  const styles = statusStyles[status] ?? statusStyles.draft;
  const text = statusText[status] ?? status;

  return (
    <span
      role="status"
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-md text-xs font-medium',
        styles,
        className
      )}
    >
      {text}
    </span>
  );
}
