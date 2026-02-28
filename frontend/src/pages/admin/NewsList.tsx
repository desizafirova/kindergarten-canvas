import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Newspaper } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ItemListRow } from '@/components/admin/ItemListRow';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';
import { useNews } from '@/hooks/useNews';
import { useTranslation } from '@/lib/i18n';
import { NewsStatus } from '@/types/news';
import api from '@/lib/api';

type FilterType = 'ALL' | 'DRAFT' | 'PUBLISHED';

/** Number of skeleton rows to show during loading */
const SKELETON_ROWS = 3;

/**
 * NewsList - News List View page for the admin panel.
 *
 * Features:
 * - Filter tabs (All / Drafts / Published)
 * - Empty state with create button (context-aware messaging)
 * - ItemListRow components for each news item
 * - Delete confirmation dialog with optimistic updates
 * - Loading and error states
 * - ARIA live region for screen reader announcements
 * - Integration with News CRUD API
 */
export default function NewsList() {
  const navigate = useNavigate();
  const t = useTranslation();

  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState<{ id: number; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  // Compute status filter for API based on active tab
  const statusFilter =
    activeFilter === 'ALL' ? undefined : NewsStatus[activeFilter as 'DRAFT' | 'PUBLISHED'];

  // Fetch news with current filter
  const { data: newsItems, loading, error, refetch, setData } = useNews(statusFilter);

  // Handle edit button click - navigate to edit page
  const handleEdit = useCallback((id: number) => {
    navigate(`/admin/news/${id}/edit`);
  }, [navigate]);

  // Handle delete button click - open confirmation dialog
  const handleDelete = useCallback((id: number) => {
    const item = newsItems.find((item) => item.id === id);
    if (item) {
      setNewsToDelete({ id: item.id, title: item.title });
      setDeleteDialogOpen(true);
    }
  }, [newsItems]);

  // Handle delete confirmation with optimistic update
  const handleConfirmDelete = async () => {
    if (!newsToDelete) return;

    setIsDeleting(true);
    setDeletingItemId(newsToDelete.id);

    try {
      // Optimistic update: remove item from list immediately
      setData(prevItems => prevItems.filter(item => item.id !== newsToDelete.id));

      // Close dialog
      setDeleteDialogOpen(false);

      // Call DELETE endpoint
      await api.delete(`/api/admin/v1/news/${newsToDelete.id}`);

      // Announce to screen readers
      setLiveAnnouncement(t.newsList.itemDeleted);

      // Show success toast
      toast.success(t.newsList.deleteSuccess);

      // Reset state
      setNewsToDelete(null);

      // Refetch to ensure consistency with server
      refetch();
    } catch (err) {
      // Revert optimistic update on error by refetching from server
      // This restores items at their original positions
      refetch();
      toast.error(t.newsList.deleteError);
    } finally {
      setIsDeleting(false);
      setDeletingItemId(null);
      // Clear announcement after delay
      setTimeout(() => setLiveAnnouncement(''), 1000);
    }
  };

  // Handle create button click - navigate to create page
  const handleCreate = useCallback(() => {
    navigate('/admin/news/create');
  }, [navigate]);

  // Determine empty state message based on filter
  const getEmptyStateMessage = () => {
    if (activeFilter === 'ALL') {
      return t.newsList.emptyState;
    }
    return t.newsList.emptyFilteredState;
  };

  // Show create button only when viewing ALL and list is empty
  const showCreateButtonInEmptyState = activeFilter === 'ALL';

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
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
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Newspaper className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t.newsList.title}</h1>
              <p className="text-sm text-gray-600 mt-1">
                {t.newsList.subtitle}
              </p>
            </div>
          </div>

          <Button onClick={handleCreate} size="default" className="gap-2">
            <Plus className="h-4 w-4" />
            {t.newsList.createButton}
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as FilterType)}>
        <TabsList className="mb-6">
          <TabsTrigger value="ALL">{t.newsList.filterAll}</TabsTrigger>
          <TabsTrigger value="DRAFT">{t.newsList.filterDrafts}</TabsTrigger>
          <TabsTrigger value="PUBLISHED">{t.newsList.filterPublished}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeFilter} className="mt-0">
          {/* Loading State */}
          {loading && (
            <div className="space-y-4" aria-busy="true" aria-label={t.common.loading}>
              {[...Array(SKELETON_ROWS)].map((_, i) => (
                <div key={i} className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
                  <div className="flex items-center gap-4 flex-1">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
              <p className="text-red-800 font-medium">{t.newsList.loadError}</p>
              <p className="text-red-600 text-sm mt-1">{error.message}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="mt-3"
              >
                {t.newsList.retryButton}
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && newsItems.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Newspaper className="h-12 w-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
              <p className="text-gray-700 text-lg font-medium mb-2">{getEmptyStateMessage()}</p>
              {showCreateButtonInEmptyState && (
                <Button onClick={handleCreate} size="lg" className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  {t.newsList.createButton}
                </Button>
              )}
            </div>
          )}

          {/* News List */}
          {!loading && !error && newsItems.length > 0 && (
            <div
              className="border border-gray-200 rounded-lg overflow-hidden bg-white"
              role="list"
              aria-label="Списък с новини"
            >
              {newsItems.map((item) => (
                <ItemListRow
                  key={item.id}
                  item={item}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isDeleting={deletingItemId === item.id}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemTitle={newsToDelete?.title || ''}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
