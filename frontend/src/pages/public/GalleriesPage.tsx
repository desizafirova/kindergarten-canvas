import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { useTranslation } from '@/lib/i18n';
import { GalleryCard } from '@/components/public/GalleryCard';
import type { PublicGallery } from '@/types/gallery';

export function GalleriesPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const [galleries, setGalleries] = useState<PublicGallery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchGalleries = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const response = await api.get('/api/v1/public/galleries', {
          signal: abortController.signal,
        });
        if (response.data.status === 'success') {
          setGalleries(response.data.data.galleries);
        } else {
          setIsError(true);
        }
      } catch (error: unknown) {
        const err = error as { name?: string; code?: string };
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGalleries();
    return () => abortController.abort();
  }, []);

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.publicGallery.sectionTitle}</h1>
          <p className="text-gray-600">{t.publicGallery.loading}</p>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.publicGallery.sectionTitle}</h1>
          <p className="text-red-600">{t.publicGallery.error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.publicGallery.sectionTitle}</h1>
        {galleries.length === 0 ? (
          <p className="text-gray-600">{t.publicGallery.emptyState}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleries.map((gallery) => (
              <GalleryCard
                key={gallery.id}
                gallery={gallery}
                onClick={() => navigate(`/galleries/${gallery.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
