import { format, differenceInDays } from 'date-fns';
import { bg } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { getExcerpt } from '@/lib/text-utils';
import { useTranslation } from '@/lib/i18n';

export interface PublicDeadline {
  id: number;
  title: string;
  description: string | null;
  deadlineDate: string;
  isUrgent: boolean;
  publishedAt: string | null;
}

interface DeadlineCardProps {
  deadline: PublicDeadline;
}

export function DeadlineCard({ deadline }: DeadlineCardProps) {
  const t = useTranslation();
  const formattedDate = format(new Date(deadline.deadlineDate), 'dd.MM.yyyy', { locale: bg });
  const excerpt = getExcerpt(deadline.description);
  const daysUntil = differenceInDays(new Date(deadline.deadlineDate), new Date());
  const isNearExpiry = daysUntil >= 0 && daysUntil < 7;

  return (
    <Link to={`/deadlines/${deadline.id}`} className="block group cursor-pointer">
      <article className={`bg-white rounded-lg shadow-md overflow-hidden ${deadline.isUrgent ? 'border-l-4 border-red-500' : ''} group-hover:shadow-lg transition-shadow`}>
        <div className="p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            {deadline.isUrgent && <span aria-label="Спешен срок">🚨 </span>}
            {deadline.title}
          </h2>
          <p className="text-sm text-gray-500 mb-2">{formattedDate}</p>
          {isNearExpiry && (
            <span className="inline-block bg-orange-100 text-orange-700 text-xs font-medium px-2 py-1 rounded mb-2">
              <span aria-hidden="true">⏳ </span>{t.publicDeadlines.countdownLabel}{' '}
              {daysUntil === 0
                ? t.publicDeadlines.countdownLessThanDay
                : `${daysUntil} ${daysUntil === 1 ? t.publicDeadlines.countdownDaysSingular : t.publicDeadlines.countdownDaysPlural}`}
            </span>
          )}
          {excerpt && (
            <p className="text-sm text-gray-700">{excerpt}</p>
          )}
        </div>
      </article>
    </Link>
  );
}
