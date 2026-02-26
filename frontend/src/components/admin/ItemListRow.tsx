import { useCallback, KeyboardEvent } from 'react';
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';
import { Pencil, Trash2, Loader2 } from 'lucide-react';
import { NewsItem } from '@/types/news';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useTranslation } from '@/lib/i18n';

interface ItemListRowProps {
  item: NewsItem;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  /** When true, shows loading state and disables actions */
  isDeleting?: boolean;
}

/**
 * ItemListRow - Presentation component for displaying a single news item in a list.
 *
 * Features:
 * - Displays title, status badge, creation date
 * - Edit and Delete action buttons with Bulgarian labels
 * - Hover and focus states for accessibility
 * - Keyboard navigation (Enter/Space on row triggers edit)
 * - Loading state during deletion
 * - ARIA labels for screen readers
 */
export function ItemListRow({ item, onEdit, onDelete, isDeleting = false }: ItemListRowProps) {
  const t = useTranslation();

  // Format date in Bulgarian format: dd.MM.yyyy
  const formattedDate = format(new Date(item.createdAt), 'dd.MM.yyyy', {
    locale: bg,
  });

  // Convert backend status to StatusBadge format
  const badgeStatus = item.status.toLowerCase() as 'draft' | 'published';

  // Handle keyboard navigation on row
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    // Enter or Space triggers edit (primary action)
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isDeleting) {
        onEdit(item.id);
      }
    }
  }, [isDeleting, item.id, onEdit]);

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
      aria-label={`${item.title}, ${t.status[badgeStatus]}, ${formattedDate}`}
    >
      {/* Left section: Title, Status, Date */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-medium text-gray-900 truncate">
            {item.title}
          </h3>
        </div>

        <StatusBadge status={badgeStatus} />

        <time
          dateTime={item.createdAt}
          className="text-sm text-gray-600 whitespace-nowrap"
        >
          {formattedDate}
        </time>
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
              onClick={() => onEdit(item.id)}
              aria-label={`${t.buttons.edit}: ${item.title}`}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 focus:ring-2 focus:ring-blue-500"
            >
              <Pencil className="h-4 w-4 mr-1.5" aria-hidden="true" />
              {t.buttons.edit}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(item.id)}
              aria-label={`${t.buttons.delete}: ${item.title}`}
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
