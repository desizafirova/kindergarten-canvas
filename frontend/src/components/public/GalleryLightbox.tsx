import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { GalleryImage } from '@/types/gallery';
import { useTranslation } from '@/lib/i18n';

interface Props {
  images: GalleryImage[];
  initialIndex: number;
  onClose: () => void;
}

export function GalleryLightbox({ images, initialIndex, onClose }: Props) {
  const t = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const prev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const next = () => setCurrentIndex((i) => Math.min(images.length - 1, i + 1));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Only handle arrow keys — Radix Dialog handles Escape via onOpenChange
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentIndex]);

  const image = images[currentIndex];

  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/90 z-50" />
        <Dialog.Content
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">{image.altText || 'Gallery image'}</Dialog.Title>
          {/* Close button */}
          <Dialog.Close
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            aria-label={t.publicGallery.lightboxClose}
          >
            <X className="h-8 w-8" />
          </Dialog.Close>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-sm">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Prev */}
          <button
            onClick={prev}
            disabled={currentIndex === 0}
            className="absolute left-4 text-white hover:text-gray-300 disabled:opacity-30"
            aria-label={t.publicGallery.lightboxPrev}
          >
            <ChevronLeft className="h-10 w-10" />
          </button>

          {/* Image */}
          <img
            src={image.imageUrl}
            alt={image.altText || ''}
            className="max-h-[85vh] max-w-[90vw] object-contain"
          />

          {/* Next */}
          <button
            onClick={next}
            disabled={currentIndex === images.length - 1}
            className="absolute right-4 text-white hover:text-gray-300 disabled:opacity-30"
            aria-label={t.publicGallery.lightboxNext}
          >
            <ChevronRight className="h-10 w-10" />
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
