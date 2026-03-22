import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';
import DOMPurify from 'dompurify';
import api from '@/lib/api';
import { useTranslation } from '@/lib/i18n';
import type { PublicEvent } from '@/components/public/EventCard';

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const t = useTranslation();
  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    const abortController = new AbortController();

    const fetchEvent = async () => {
      setIsLoading(true);
      setIsError(false);
      setIsNotFound(false);
      try {
        const response = await api.get(`/api/v1/public/events/${id}`, {
          signal: abortController.signal,
        });
        if (response.data.status === 'success') {
          setEvent(response.data.data.event);
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

    fetchEvent();
    return () => abortController.abort();
  }, [id]);

  useEffect(() => {
    if (event) {
      document.title = `${event.title} – ДГ №48`;
    }
    return () => {
      document.title = 'ДГ №48 „Ран Босилек"';
    };
  }, [event]);

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <p className="text-gray-600">{t.publicEvents.loading}</p>
        </div>
      </section>
    );
  }

  if (isNotFound || (!isLoading && !event && !isError)) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <p className="text-gray-600 mb-4">{t.publicEvents.notFound}</p>
          <Link to="/events" className="text-primary hover:underline">{t.publicEvents.backToList}</Link>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <p className="text-red-600 mb-4">{t.publicEvents.error}</p>
          <Link to="/events" className="text-primary hover:underline">{t.publicEvents.backToList}</Link>
        </div>
      </section>
    );
  }

  if (!event) return null;

  const formattedDate = format(new Date(event.eventDate), 'dd.MM.yyyy', { locale: bg });
  const formattedEndDate = event.eventEndDate
    ? format(new Date(event.eventEndDate), 'dd.MM.yyyy', { locale: bg })
    : null;

  return (
    <section className="py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link to="/events" className="text-sm text-primary hover:underline mb-6 inline-block">
          {t.publicEvents.backToList}
        </Link>
        <article>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {event.title}
          </h1>
          {event.isImportant && (
            <span className="inline-flex items-center gap-1 text-amber-600 font-medium text-sm mb-4">
              ⭐ {t.publicEvents.importantLabel}
            </span>
          )}
          <p className="text-sm text-gray-500 mb-2">
            {formattedDate}
            {formattedEndDate && (
              <span> {t.publicEvents.multiDayLabel} {formattedEndDate}</span>
            )}
          </p>
          {event.location && (
            <p className="text-sm text-gray-600 mb-4">
              <span className="font-medium">{t.publicEvents.locationLabel}:</span> {event.location}
            </p>
          )}
          {event.imageUrl && (
            <div className="mb-6">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full rounded-lg object-cover max-h-96"
              />
            </div>
          )}
          {event.description && (
            <div
              className="prose prose-gray max-w-none"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(event.description, {
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
