import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import { bg } from 'date-fns/locale';
import DOMPurify from 'dompurify';
import api from '@/lib/api';
import { useTranslation } from '@/lib/i18n';
import type { PublicDeadline } from '@/components/public/DeadlineCard';

export function DeadlineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const t = useTranslation();
  const [deadline, setDeadline] = useState<PublicDeadline | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    const abortController = new AbortController();

    const fetchDeadline = async () => {
      setIsLoading(true);
      setIsError(false);
      setIsNotFound(false);
      try {
        const response = await api.get(`/api/v1/public/admission-deadlines/${id}`, {
          signal: abortController.signal,
        });
        if (response.data.status === 'success') {
          setDeadline(response.data.data.deadline);
        } else {
          setIsError(true);
        }
      } catch (error: unknown) {
        const err = error as { name?: string; code?: string; response?: { status?: number } };
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
        if (err.response?.status === 404) {
          setIsNotFound(true);
        } else {
          setIsError(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeadline();
    return () => abortController.abort();
  }, [id]);

  useEffect(() => {
    if (deadline) {
      document.title = `${deadline.title} – ДГ №48`;
    }
    return () => {
      document.title = 'ДГ №48 „Ран Босилек"';
    };
  }, [deadline]);

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <p className="text-gray-600">{t.publicDeadlines.loading}</p>
        </div>
      </section>
    );
  }

  if (isNotFound || (!isLoading && !deadline && !isError)) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <p className="text-gray-600 mb-4">{t.publicDeadlines.notFound}</p>
          <Link to="/deadlines" className="text-primary hover:underline">{t.publicDeadlines.backToList}</Link>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <p className="text-red-600 mb-4">{t.publicDeadlines.error}</p>
          <Link to="/deadlines" className="text-primary hover:underline">{t.publicDeadlines.backToList}</Link>
        </div>
      </section>
    );
  }

  if (!deadline) return null;

  const formattedDate = format(new Date(deadline.deadlineDate), 'dd.MM.yyyy', { locale: bg });
  const daysUntil = differenceInDays(new Date(deadline.deadlineDate), new Date());
  const isNearExpiry = daysUntil >= 0 && daysUntil < 7;

  return (
    <section className="py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link to="/deadlines" className="text-sm text-primary hover:underline mb-6 inline-block">
          {t.publicDeadlines.backToList}
        </Link>
        <article>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {deadline.isUrgent && <span aria-label="Спешен срок">🚨 </span>}
            {deadline.title}
          </h1>
          {deadline.isUrgent && (
            <span className="inline-flex items-center gap-1 text-red-600 font-medium text-sm mb-4">
              🚨 {t.publicDeadlines.urgentLabel}
            </span>
          )}
          <p className="text-sm text-gray-500 mb-2">{formattedDate}</p>
          {isNearExpiry && (
            <span className="inline-block bg-orange-100 text-orange-700 text-xs font-medium px-2 py-1 rounded mb-4">
              ⏳ {t.publicDeadlines.countdownLabel}{' '}
              {daysUntil === 0
                ? t.publicDeadlines.countdownLessThanDay
                : `${daysUntil} ${daysUntil === 1 ? t.publicDeadlines.countdownDaysSingular : t.publicDeadlines.countdownDaysPlural}`}
            </span>
          )}
          {deadline.description && (
            <div
              className="prose prose-gray max-w-none"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(deadline.description, {
                  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h2', 'h3', 'ul', 'ol', 'li', 'a'],
                  ALLOWED_ATTR: ['href', 'target', 'rel'],
                }),
              }}
            />
          )}
        </article>
      </div>
    </section>
  );
}
