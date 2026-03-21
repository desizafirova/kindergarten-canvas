import { format, isPast } from 'date-fns';
import { bg } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { getExcerpt } from '@/lib/text-utils';
import { useTranslation } from '@/lib/i18n';

export interface PublicJob {
  id: number;
  title: string;
  description: string;
  requirements: string | null;
  applicationDeadline: string | null;
  isActive: boolean;
  publishedAt: string | null;
  createdAt: string;
}

interface JobCardProps {
  job: PublicJob;
  onApply?: () => void;
}

export function JobCard({ job, onApply }: JobCardProps) {
  const t = useTranslation();
  const excerpt = getExcerpt(job.description);
  const isDeadlineExpired = job.applicationDeadline
    ? isPast(new Date(job.applicationDeadline))
    : false;
  const formattedDeadline = job.applicationDeadline
    ? format(new Date(job.applicationDeadline), 'dd.MM.yyyy', { locale: bg })
    : null;

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
      <div className="p-5 flex flex-col flex-1">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          <Link to={`/jobs/${job.id}`} className="hover:text-primary transition-colors">
            {job.title}
          </Link>
        </h2>
        {formattedDeadline && (
          <p className="text-sm text-gray-500 mb-2">
            {t.publicJobs.deadlineLabel} {formattedDeadline}
          </p>
        )}
        {excerpt && <p className="text-sm text-gray-700 mb-4 flex-1">{excerpt}</p>}
        <div className="mt-auto">
          {isDeadlineExpired ? (
            <div>
              <button
                type="button"
                disabled
                className="w-full bg-gray-200 text-gray-400 text-sm font-medium py-2 px-4 rounded cursor-not-allowed"
              >
                {t.publicJobs.applyButton}
              </button>
              <p className="text-xs text-red-500 mt-1">{t.publicJobs.deadlineExpired}</p>
            </div>
          ) : (
            <button
              type="button"
              onClick={onApply}
              className="w-full bg-primary text-white text-sm font-medium py-2 px-4 rounded hover:bg-primary/90 transition-colors"
            >
              {t.publicJobs.applyButton}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
