import { useCallback, KeyboardEvent } from 'react';
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';
import { Pencil, Trash2, Loader2, Clock } from 'lucide-react';
import { Deadline } from '@/types/deadline';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useTranslation } from '@/lib/i18n';

interface DeadlineListRowProps {
  deadline: Deadline;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  /** When true, shows loading state and disables actions */
  isDeleting?: boolean;
}

/**
 * DeadlineListRow - Presentation component for displaying a single deadline in a list.
 *
 * Features:
 * - Displays title, deadline date, status badge, and 🚨 for urgent deadlines
 * - Edit and Delete action buttons with Bulgarian labels
 * - Hover and focus states for accessibility
 * - Keyboard navigation (Enter/Space on row triggers edit)
 * - Loading state during deletion
 * - ARIA labels for screen readers
 */
export function DeadlineListRow({ deadline, onEdit, onDelete, isDeleting = false }: DeadlineListRowProps) {
  const t = useTranslation();

  // Format deadline date in Bulgarian format: dd.MM.yyyy
  const formattedDate = format(new Date(deadline.deadlineDate), 'dd.MM.yyyy', {
    locale: bg,
  });

  // Convert backend status to StatusBadge format
  const badgeStatus = deadline.status.toLowerCase() as 'draft' | 'published';

  // Handle keyboard navigation on row
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isDeleting) {
        onEdit(deadline.id);
      }
    }
  }, [isDeleting, deadline.id, onEdit]);

  return (
    <div
      className={`flex items-center justify-between border-b border-gray-200 px-4 py-4 transition-colors
        ${isDeleting ? 'opacity-50 bg-gray-100' : 'hover:bg-gray-50'}
        ${!isDeleting ? 'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-inset' : ''}
      `}
      role="listitem"
      tabIndex={isDeleting ? -1 : 0}
      onKeyDown={handleKeyDown}
      aria-busy={isDeleting}
      aria-label={`${deadline.title}, ${formattedDate}, ${t.status[badgeStatus]}`}
    >
      {/* Left section: Icon, Title, Date, Status, Urgent */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {/* Clock icon placeholder */}
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
            <Clock className="h-4 w-4 text-orange-600" aria-hidden="true" />
          </div>
        </div>

        {/* Title and date */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-medium text-gray-900 truncate flex items-center gap-1">
            {deadline.isUrgent && (
              <span aria-label="Спешен срок" title="Спешен срок">🚨</span>
            )}
            {deadline.title}
          </h3>
          <p className="text-sm text-gray-600 truncate">
            <time dateTime={deadline.deadlineDate}>{formattedDate}</time>
          </p>
        </div>

        <StatusBadge status={badgeStatus} />
      </div>

      {/* Right section: Action buttons */}
      <div className="flex items-center gap-2 ml-4">
        {isDeleting ? (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            <span className="text-sm">{t.common.loading}</span>
          </div>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(deadline.id)}
              aria-label={`${t.buttons.edit}: ${deadline.title}`}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 focus:ring-2 focus:ring-blue-500"
            >
              <Pencil className="h-4 w-4 mr-1.5" aria-hidden="true" />
              {t.buttons.edit}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(deadline.id)}
              aria-label={`${t.buttons.delete}: ${deadline.title}`}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 focus:ring-2 focus:ring-red-500"
            >
              <Trash2 className="h-4 w-4 mr-1.5" aria-hidden="true" />
              {t.buttons.delete}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
