import { format } from 'date-fns';
import { bg } from 'date-fns/locale';
import { getExcerpt } from '@/lib/text-utils';

export interface PublicEvent {
  id: number;
  title: string;
  description: string | null;
  eventDate: string;
  eventEndDate: string | null;
  location: string | null;
  isImportant: boolean;
  imageUrl: string | null;
  publishedAt: string | null;
}

interface EventCardProps {
  event: PublicEvent;
}

export function EventCard({ event }: EventCardProps) {
  const formattedDate = format(new Date(event.eventDate), 'dd.MM.yyyy', { locale: bg });
  const excerpt = getExcerpt(event.description);

  return (
    <article className={`bg-white rounded-lg shadow-md overflow-hidden ${event.isImportant ? 'border-2 border-amber-400' : ''}`}>
      {event.imageUrl && (
        <div className="aspect-video relative bg-gray-100">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          {event.isImportant && <span aria-label="Важно събитие">⭐ </span>}
          {event.title}
        </h2>
        <p className="text-sm text-gray-500 mb-2">{formattedDate}</p>
        {event.location && (
          <p className="text-sm text-gray-600 mb-2">
            <span aria-hidden="true">📍 </span>{event.location}
          </p>
        )}
        {excerpt && (
          <p className="text-sm text-gray-700">{excerpt}</p>
        )}
      </div>
    </article>
  );
}
