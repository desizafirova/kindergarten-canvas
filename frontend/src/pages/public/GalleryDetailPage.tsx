import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/lib/api';
import { useTranslation } from '@/lib/i18n';
import { GalleryLightbox } from '@/components/public/GalleryLightbox';
import type { PublicGalleryDetail } from '@/types/gallery';

export function GalleryDetailPage() {
  const t = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [gallery, setGallery] = useState<PublicGalleryDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchGallery = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const galleryId = parseInt(id ?? '', 10);
        if (isNaN(galleryId)) { setIsError(true); return; }
        const response = await api.get(`/api/v1/public/galleries/${galleryId}`, {
          signal: abortController.signal,
        });
        if (response.data.status === 'success') {
          setGallery(response.data.data.gallery);
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

    fetchGallery();
    return () => abortController.abort();
  }, [id]);

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <p className="text-gray-600">{t.publicGallery.detailLoading}</p>
        </div>
      </section>
    );
  }

  if (isError || !gallery) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <p className="text-gray-600">{t.publicGallery.notFound}</p>
          <Link to="/galleries" className="text-blue-600 hover:underline mt-4 inline-block">
            {t.publicGallery.backToList}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{gallery.title}</h1>
        {gallery.description && (
          <p className="text-gray-600 mb-6">{gallery.description}</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-8">
          {gallery.images.map((image, index) => (
            <button
              key={image.id}
              className="aspect-square overflow-hidden rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => setLightboxIndex(index)}
            >
              <img
                src={image.thumbnailUrl ?? image.imageUrl}
                alt={image.altText || gallery.title}
                className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                loading="lazy"
              />
            </button>
          ))}
        </div>

        <Link to="/galleries" className="text-blue-600 hover:underline">
          {t.publicGallery.backToList}
        </Link>

        {lightboxIndex !== null && (
          <GalleryLightbox
            images={gallery.images}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </div>
    </section>
  );
}
