import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TeacherListRow } from '@/components/admin/TeacherListRow';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';
import { useTeachers } from '@/hooks/useTeachers';
import { useTranslation } from '@/lib/i18n';
import { TeacherStatus } from '@/types/teacher';
import api from '@/lib/api';

type FilterType = 'ALL' | 'DRAFT' | 'PUBLISHED';

/** Number of skeleton rows to show during loading */
const SKELETON_ROWS = 3;

/**
 * TeachersList - Teachers List View page for the admin panel.
 *
 * Features:
 * - Filter tabs (All / Drafts / Published)
 * - Empty state with create button (context-aware messaging)
 * - TeacherListRow components for each teacher
 * - Delete confirmation dialog with optimistic updates
 * - Loading and error states
 * - ARIA live region for screen reader announcements
 * - Integration with Teacher CRUD API
 */
export default function TeachersList() {
  const navigate = useNavigate();
  const t = useTranslation();

  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<{ id: number; fullName: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  // Compute status filter for API based on active tab
  const statusFilter =
    activeFilter === 'ALL' ? undefined : TeacherStatus[activeFilter as 'DRAFT' | 'PUBLISHED'];

  // Fetch teachers with current filter
  const { data: teachers, loading, error, refetch, setData } = useTeachers(statusFilter);

  // Handle edit button click - navigate to edit page
  const handleEdit = useCallback((id: number) => {
    navigate(`/admin/teachers/${id}/edit`);
  }, [navigate]);

  // Handle delete button click - open confirmation dialog
  const handleDelete = useCallback((id: number) => {
    const teacher = teachers.find((t) => t.id === id);
    if (teacher) {
      const fullName = `${teacher.firstName} ${teacher.lastName}`;
      setTeacherToDelete({ id: teacher.id, fullName });
      setDeleteDialogOpen(true);
    }
  }, [teachers]);

  // Handle delete confirmation with optimistic update
  const handleConfirmDelete = async () => {
    if (!teacherToDelete) return;

    setIsDeleting(true);
    setDeletingItemId(teacherToDelete.id);

    try {
      // Optimistic update: remove teacher from list immediately
      setData(prevTeachers => prevTeachers.filter(teacher => teacher.id !== teacherToDelete.id));

      // Close dialog
      setDeleteDialogOpen(false);

      // Call DELETE endpoint
      await api.delete(`/api/admin/v1/teachers/${teacherToDelete.id}`);

      // Announce to screen readers
      setLiveAnnouncement(t.teachersList.itemDeleted);

      // Show success toast
      toast.success(t.teachersList.deleteSuccess);

      // Reset state
      setTeacherToDelete(null);

      // Refetch to ensure consistency with server
      refetch();
    } catch (err) {
      // Revert optimistic update on error by refetching from server
      refetch();
      toast.error(t.teachersList.deleteError);
    } finally {
      setIsDeleting(false);
      setDeletingItemId(null);
      // Clear announcement after delay
      setTimeout(() => setLiveAnnouncement(''), 1000);
    }
  };

  // Handle create button click - navigate to create page
  const handleCreate = useCallback(() => {
    navigate('/admin/teachers/create');
  }, [navigate]);

  // Determine empty state message based on filter
  const getEmptyStateMessage = () => {
    if (activeFilter === 'ALL') {
      return t.teachersList.emptyState;
    }
    return t.teachersList.emptyFilteredState;
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
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t.teachersList.title}</h1>
              <p className="text-sm text-gray-600 mt-1">
                {t.teachersList.subtitle}
              </p>
            </div>
          </div>

          <Button onClick={handleCreate} size="default" className="gap-2">
            <Plus className="h-4 w-4" />
            {t.teachersList.createButton}
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as FilterType)}>
        <TabsList className="mb-6">
          <TabsTrigger value="ALL">{t.teachersList.filterAll}</TabsTrigger>
          <TabsTrigger value="DRAFT">{t.teachersList.filterDrafts}</TabsTrigger>
          <TabsTrigger value="PUBLISHED">{t.teachersList.filterPublished}</TabsTrigger>
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
              <p className="text-red-800 font-medium">{t.teachersList.loadError}</p>
              <p className="text-red-600 text-sm mt-1">{error.message}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="mt-3"
              >
                {t.teachersList.retryButton}
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && teachers.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
              <p className="text-gray-700 text-lg font-medium mb-2">{getEmptyStateMessage()}</p>
              {showCreateButtonInEmptyState && (
                <Button onClick={handleCreate} size="lg" className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  {t.teachersList.createButton}
                </Button>
              )}
            </div>
          )}

          {/* Teachers List */}
          {!loading && !error && teachers.length > 0 && (
            <div
              className="border border-gray-200 rounded-lg overflow-hidden bg-white"
              role="list"
              aria-label="Списък с учители"
            >
              {teachers.map((teacher) => (
                <TeacherListRow
                  key={teacher.id}
                  teacher={teacher}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isDeleting={deletingItemId === teacher.id}
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
        itemTitle={teacherToDelete?.fullName || ''}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
