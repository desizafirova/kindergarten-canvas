import { ImageIcon } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import type { PublicGallery } from '@/types/gallery';

interface GalleryCardProps {
  gallery: PublicGallery;
  onClick: () => void;
}

export function GalleryCard({ gallery, onClick }: GalleryCardProps) {
  const t = useTranslation();

  return (
    <article
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg hover:opacity-95 transition-all"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
    >
      <div className="aspect-video relative bg-gray-100 flex items-center justify-center">
        {gallery.coverImageUrl ? (
          <img
            src={gallery.coverImageUrl}
            alt={gallery.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <ImageIcon className="h-12 w-12 text-gray-400" aria-hidden="true" />
        )}
      </div>
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">{gallery.title}</h2>
        <p className="text-sm text-gray-500">
          {gallery.imageCount}{t.publicGallery.imageCount}
        </p>
      </div>
    </article>
  );
}
