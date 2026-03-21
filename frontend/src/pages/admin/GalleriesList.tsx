import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Images } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';
import { useGalleries, deleteGallery } from '@/hooks/useGalleries';
import { useTranslation } from '@/lib/i18n';
import { Gallery } from '@/types/gallery';

/** Number of skeleton cards to show during loading */
const SKELETON_COUNT = 3;

/**
 * GalleriesList - Gallery List View page for the admin panel.
 *
 * Features:
 * - Card/grid layout (3–4 columns responsive)
 * - Cover image thumbnail with fallback icon
 * - StatusBadge (DRAFT/PUBLISHED) and image count per card
 * - Delete confirmation dialog with optimistic updates
 * - Loading (skeleton) and error states
 * - Empty state with create button
 * - ARIA live region for screen reader announcements
 */
export default function GalleriesList() {
  const navigate = useNavigate();
  const t = useTranslation();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [galleryToDelete, setGalleryToDelete] = useState<{ id: number; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  const { data: galleries, loading, error, refetch, setData } = useGalleries();

  const handleEdit = useCallback((id: number) => {
    navigate(`/admin/galleries/${id}/edit`);
  }, [navigate]);

  const handleDeleteClick = useCallback((gallery: Gallery) => {
    setGalleryToDelete({ id: gallery.id, title: gallery.title });
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = async () => {
    if (!galleryToDelete) return;

    setIsDeleting(true);

    try {
      // Optimistic update: remove gallery from list immediately
      setData(prev => prev.filter(g => g.id !== galleryToDelete.id));

      // Close dialog
      setDeleteDialogOpen(false);

      // Call DELETE endpoint
      await deleteGallery(galleryToDelete.id);

      // Announce to screen readers
      setLiveAnnouncement(t.galleryList.itemDeleted);

      // Show success toast
      toast.success(t.galleryList.deleteSuccess);

      // Reset state
      setGalleryToDelete(null);
    } catch {
      // Revert optimistic update on error by refetching from server
      refetch();
      toast.error(t.galleryList.deleteError);
    } finally {
      setIsDeleting(false);
      setTimeout(() => setLiveAnnouncement(''), 1000);
    }
  };

  const handleCreate = useCallback(() => {
    navigate('/admin/galleries/create');
  }, [navigate]);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* ARIA Live Region for screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {liveAnnouncement}
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <Images className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t.galleryList.title}</h1>
              <p className="text-sm text-gray-600 mt-1">{t.galleryList.subtitle}</p>
            </div>
          </div>

          <Button onClick={handleCreate} size="default" className="gap-2">
            <Plus className="h-4 w-4" />
            {t.galleryList.createButton}
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          aria-busy="true"
          aria-label={t.common.loading}
        >
          {[...Array(SKELETON_COUNT)].map((_, i) => (
            <div key={i} className="rounded-lg border border-gray-200 overflow-hidden bg-white">
              <Skeleton className="aspect-video w-full" />
              <div className="p-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
          <p className="text-red-800 font-medium">{t.galleryList.loadError}</p>
          <p className="text-red-600 text-sm mt-1">{error.message}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="mt-3"
          >
            {t.galleryList.retryButton}
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && galleries.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Images className="h-12 w-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
          <p className="text-gray-700 text-lg font-medium mb-2">{t.galleryList.emptyState}</p>
          <Button onClick={handleCreate} size="lg" className="mt-4 gap-2">
            <Plus className="h-4 w-4" />
            {t.galleryList.createButton}
          </Button>
        </div>
      )}

      {/* Gallery Grid */}
      {!loading && !error && galleries.length > 0 && (
        <div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
          aria-label={t.galleryList.listAriaLabel}
        >
          {galleries.map((gallery) => (
            <div
              key={gallery.id}
              role="listitem"
              className="relative rounded-lg border border-gray-200 overflow-hidden bg-white hover:shadow-md transition-shadow"
            >
              {/* Cover image */}
              <div className="aspect-video bg-gray-100 relative">
                {gallery.coverImageUrl ? (
                  <img
                    src={gallery.coverImageUrl}
                    alt={gallery.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Images className="h-12 w-12 text-gray-300" aria-hidden="true" />
                  </div>
                )}
              </div>

              {/* Card content */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 truncate">{gallery.title}</h3>
                  <StatusBadge status={gallery.status} />
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  {gallery.imageCount}{t.galleryList.imageCountSuffix}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(gallery.id)}
                  >
                    {t.buttons.edit}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(gallery)}
                  >
                    {t.buttons.delete}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemTitle={galleryToDelete?.title || ''}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        message={t.galleryList.deleteConfirmMessage}
      />
    </div>
  );
}
