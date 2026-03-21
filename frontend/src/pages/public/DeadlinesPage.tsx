import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useTranslation } from '@/lib/i18n';
import { DeadlineCard, type PublicDeadline } from '@/components/public/DeadlineCard';

export function DeadlinesPage() {
  const t = useTranslation();
  const [deadlines, setDeadlines] = useState<PublicDeadline[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchDeadlines = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const response = await api.get('/api/v1/public/admission-deadlines', {
          signal: abortController.signal,
        });
        if (response.data.status === 'success') {
          setDeadlines(response.data.data.deadlines);
        } else {
          setIsError(true);
        }
      } catch (error: any) {
        if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') return;
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeadlines();
    return () => abortController.abort();
  }, []);

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.publicDeadlines.sectionTitle}</h1>
          <p className="text-gray-600">{t.publicDeadlines.loading}</p>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.publicDeadlines.sectionTitle}</h1>
          <p className="text-red-600">{t.publicDeadlines.error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.publicDeadlines.sectionTitle}</h1>
        {deadlines.length === 0 ? (
          <p className="text-gray-600">{t.publicDeadlines.emptyState}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deadlines.map((deadline) => (
              <DeadlineCard key={deadline.id} deadline={deadline} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
