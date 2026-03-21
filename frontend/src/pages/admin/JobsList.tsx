import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Briefcase } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { JobListRow } from '@/components/admin/JobListRow';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';
import { useJobs, JobFilter } from '@/hooks/useJobs';
import { useTranslation } from '@/lib/i18n';
import api from '@/lib/api';

/** Number of skeleton rows to show during loading */
const SKELETON_ROWS = 3;

/**
 * JobsList - Jobs List View page for the admin panel.
 *
 * Features:
 * - Filter tabs (All / Active / Closed)
 * - Empty state with create button (context-aware messaging)
 * - JobListRow components for each job
 * - Delete confirmation dialog with optimistic updates
 * - Loading and error states
 * - ARIA live region for screen reader announcements
 * - Integration with Jobs CRUD API
 */
export default function JobsList() {
  const navigate = useNavigate();
  const t = useTranslation();

  const [activeFilter, setActiveFilter] = useState<JobFilter>('ALL');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<{ id: number; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  const { data: jobs, loading, error, refetch, setData } = useJobs(activeFilter);

  const handleEdit = useCallback((id: number) => {
    navigate(`/admin/jobs/${id}/edit`);
  }, [navigate]);

  const handleDelete = useCallback((id: number) => {
    const job = jobs.find((j) => j.id === id);
    if (job) {
      setJobToDelete({ id: job.id, title: job.title });
      setDeleteDialogOpen(true);
    }
  }, [jobs]);

  const handleConfirmDelete = async () => {
    if (!jobToDelete) return;

    setIsDeleting(true);
    setDeletingItemId(jobToDelete.id);

    try {
      // Optimistic update: remove job from list immediately
      setData(prevJobs => prevJobs.filter(job => job.id !== jobToDelete.id));

      // Close dialog
      setDeleteDialogOpen(false);

      // Call DELETE endpoint
      await api.delete(`/api/admin/v1/jobs/${jobToDelete.id}`);

      // Announce to screen readers
      setLiveAnnouncement(t.jobsList.itemDeleted);

      // Show success toast
      toast.success(t.jobsList.deleteSuccess);

      // Reset state
      setJobToDelete(null);
      // NO refetch on success — optimistic update already removed item
    } catch (err) {
      // Revert optimistic update on error by refetching from server
      refetch();
      toast.error(t.jobsList.deleteError);
    } finally {
      setIsDeleting(false);
      setDeletingItemId(null);
      setTimeout(() => setLiveAnnouncement(''), 1000);
    }
  };

  const handleCreate = useCallback(() => {
    navigate('/admin/jobs/create');
  }, [navigate]);

  const getEmptyStateMessage = () => {
    if (activeFilter === 'ALL') {
      return t.jobsList.emptyState;
    }
    return t.jobsList.emptyFilteredState;
  };

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
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t.jobsList.title}</h1>
              <p className="text-sm text-gray-600 mt-1">
                {t.jobsList.subtitle}
              </p>
            </div>
          </div>

          <Button onClick={handleCreate} size="default" className="gap-2">
            <Plus className="h-4 w-4" />
            {t.jobsList.createButton}
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as JobFilter)}>
        <TabsList className="mb-6">
          <TabsTrigger value="ALL">{t.jobsList.filterAll}</TabsTrigger>
          <TabsTrigger value="ACTIVE">{t.jobsList.filterActive}</TabsTrigger>
          <TabsTrigger value="CLOSED">{t.jobsList.filterClosed}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeFilter} className="mt-0">
          {/* Loading State */}
          {loading && (
            <div className="space-y-4" aria-busy="true" aria-label={t.common.loading}>
              {[...Array(SKELETON_ROWS)].map((_, i) => (
                <div key={i} className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
                  <div className="flex items-center gap-4 flex-1">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-48 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-6 w-20" />
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
              <p className="text-red-800 font-medium">{t.jobsList.loadError}</p>
              <p className="text-red-600 text-sm mt-1">{error.message}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="mt-3"
              >
                {t.jobsList.retryButton}
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && jobs.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
              <p className="text-gray-700 text-lg font-medium mb-2">{getEmptyStateMessage()}</p>
              {showCreateButtonInEmptyState && (
                <Button onClick={handleCreate} size="lg" className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  {t.jobsList.createButton}
                </Button>
              )}
            </div>
          )}

          {/* Jobs List */}
          {!loading && !error && jobs.length > 0 && (
            <div
              className="border border-gray-200 rounded-lg overflow-hidden bg-white"
              role="list"
              aria-label="Списък с позиции"
            >
              {jobs.map((job) => (
                <JobListRow
                  key={job.id}
                  job={job}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isDeleting={deletingItemId === job.id}
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
        itemTitle={jobToDelete?.title || ''}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        message={t.jobsList.deleteConfirmMessage}
      />
    </div>
  );
}
