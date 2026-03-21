import { useCallback, KeyboardEvent } from 'react';
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';
import { Pencil, Trash2, Loader2, Briefcase } from 'lucide-react';
import { Job } from '@/types/job';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useTranslation } from '@/lib/i18n';

interface JobListRowProps {
  job: Job;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  /** When true, shows loading state and disables actions */
  isDeleting?: boolean;
}

/**
 * JobListRow - Presentation component for displaying a single job posting in a list.
 *
 * Features:
 * - Displays title, StatusBadge, isActive indicator, and applicationDeadline
 * - Edit and Delete action buttons with Bulgarian labels
 * - Hover and focus states for accessibility
 * - Keyboard navigation (Enter/Space on row triggers edit)
 * - Loading state during deletion
 * - ARIA labels for screen readers
 */
export function JobListRow({ job, onEdit, onDelete, isDeleting = false }: JobListRowProps) {
  const t = useTranslation();

  // Format applicationDeadline if present
  const formattedDeadline = job.applicationDeadline
    ? format(new Date(job.applicationDeadline), 'dd.MM.yyyy', { locale: bg })
    : null;

  // Convert backend status to StatusBadge format
  const badgeStatus = job.status.toLowerCase() as 'draft' | 'published';

  // isActive indicator
  const isActiveLabel = job.isActive ? '✓ Активна' : '✗ Затворена';
  const isActiveClass = job.isActive ? 'text-green-600' : 'text-red-500';

  // Handle keyboard navigation on row
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isDeleting) {
        onEdit(job.id);
      }
    }
  }, [isDeleting, job.id, onEdit]);

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
      aria-label={`${job.title}, ${isActiveLabel}, ${t.status[badgeStatus]}`}
    >
      {/* Left section: Icon, Title, Deadline, Status, isActive */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {/* Briefcase icon */}
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Briefcase className="h-4 w-4 text-blue-600" aria-hidden="true" />
          </div>
        </div>

        {/* Title and deadline */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-medium text-gray-900 truncate">
            {job.title}
          </h3>
          <div className="flex items-center gap-3 mt-0.5">
            <span className={`text-sm font-medium ${isActiveClass}`}>
              {isActiveLabel}
            </span>
            {formattedDeadline && (
              <span className="text-sm text-gray-500">
                {t.jobsList.applicationDeadlinePrefix} {formattedDeadline}
              </span>
            )}
          </div>
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
              onClick={() => onEdit(job.id)}
              aria-label={`${t.buttons.edit}: ${job.title}`}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 focus:ring-2 focus:ring-blue-500"
            >
              <Pencil className="h-4 w-4 mr-1.5" aria-hidden="true" />
              {t.buttons.edit}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(job.id)}
              aria-label={`${t.buttons.delete}: ${job.title}`}
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
