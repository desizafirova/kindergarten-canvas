import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { ContentFormShell } from '@/components/admin/ContentFormShell';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { DatePickerField } from '@/components/admin/DatePickerField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { deadlineFormSchema, type DeadlineFormData } from '@/schemas/deadline-form.schema';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

/**
 * DeadlineEdit - Edit existing deadline page for the admin panel.
 *
 * Features:
 * - Fetches and pre-populates form with existing deadline data
 * - React Hook Form with Zod validation
 * - Status-aware action buttons (DRAFT: Save Draft + Publish; PUBLISHED: Update only)
 * - Update functionality via PUT API (stays on page after update)
 * - Bulgarian error messages and success toasts
 * - Loading and error states
 */
export const DeadlineEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const t = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<DeadlineFormData>({
    resolver: zodResolver(deadlineFormSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      deadlineDate: '',
      description: null,
      isUrgent: false,
      status: 'DRAFT',
    },
  });

  const deadlineDate = watch('deadlineDate');
  const isUrgent = watch('isUrgent');
  const status = watch('status');

  // Load existing deadline data
  useEffect(() => {
    const loadDeadline = async () => {
      if (!id) {
        setLoadError('Invalid deadline ID');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await api.get(`/api/admin/v1/admission-deadlines/${id}`);
        const deadlineData = response.data.content;

        reset({
          title: deadlineData.title,
          deadlineDate: deadlineData.deadlineDate,
          description: deadlineData.description,
          isUrgent: deadlineData.isUrgent,
          status: deadlineData.status,
        });
      } catch (error: any) {
        if (error.response?.status === 404) {
          setLoadError('Срокът не е намерен');
        } else {
          setLoadError(t.deadlinesList.loadError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadDeadline();
  }, [id, reset, t.deadlinesList.loadError]);

  const handleSave = useCallback(async (data: DeadlineFormData) => {
    if (!id) return;

    try {
      setIsSaving(true);
      await api.put(`/api/admin/v1/admission-deadlines/${id}`, data);
      toast.success(t.deadlineForm.success.saved);
      navigate('/admin/deadlines');
    } catch (error) {
      toast.error(t.deadlineForm.errors.saveFailed);
    } finally {
      setIsSaving(false);
    }
  }, [id, navigate, t.deadlineForm.success.saved, t.deadlineForm.errors.saveFailed]);

  const handlePublish = useCallback(async (data: DeadlineFormData) => {
    if (!id) return;

    try {
      setIsPublishing(true);
      await api.put(`/api/admin/v1/admission-deadlines/${id}`, { ...data, status: 'PUBLISHED' });
      toast.success(t.deadlineForm.success.published);
      navigate('/admin/deadlines');
    } catch (error) {
      toast.error(t.deadlineForm.errors.publishFailed);
    } finally {
      setIsPublishing(false);
    }
  }, [id, navigate, t.deadlineForm.success.published, t.deadlineForm.errors.publishFailed]);

  const handleUpdate = useCallback(async (data: DeadlineFormData) => {
    if (!id) return;

    try {
      setIsUpdating(true);
      await api.put(`/api/admin/v1/admission-deadlines/${id}`, data);
      toast.success(t.deadlineForm.success.updated);

      // Reload deadline data to reflect changes — stay on page
      const response = await api.get(`/api/admin/v1/admission-deadlines/${id}`);
      const deadlineData = response.data.content;
      reset({
        title: deadlineData.title,
        deadlineDate: deadlineData.deadlineDate,
        description: deadlineData.description,
        isUrgent: deadlineData.isUrgent,
        status: deadlineData.status,
      });
    } catch (error) {
      toast.error(t.deadlineForm.errors.updateFailed);
    } finally {
      setIsUpdating(false);
    }
  }, [id, reset, t.deadlineForm.success.updated, t.deadlineForm.errors.updateFailed]);

  const breadcrumbItems = [
    { label: t.deadlineForm.breadcrumb.deadlines, href: '/admin/deadlines' },
    { label: t.deadlineForm.breadcrumb.edit },
  ];

  const isDraft = status === 'DRAFT';
  const isSubmitting = isSaving || isPublishing || isUpdating;

  const actionButtons = (
    <>
      {isDraft ? (
        <>
          <Button
            type="button"
            variant="secondary"
            onClick={handleSubmit(handleSave)}
            disabled={isSubmitting}
          >
            {isSaving ? t.common.loading : t.deadlineForm.saveDraft}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit(handlePublish)}
            disabled={!isValid || isSubmitting}
          >
            {isPublishing ? t.common.loading : t.deadlineForm.publish}
          </Button>
        </>
      ) : (
        <Button
          type="button"
          onClick={handleSubmit(handleUpdate)}
          disabled={!isValid || isSubmitting}
        >
          {isUpdating ? t.common.loading : t.deadlineForm.update}
        </Button>
      )}
    </>
  );

  // Loading state
  if (isLoading) {
    return (
      <ContentFormShell breadcrumbItems={breadcrumbItems}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">{t.common.loading}</span>
        </div>
      </ContentFormShell>
    );
  }

  // Error state
  if (loadError) {
    return (
      <ContentFormShell breadcrumbItems={breadcrumbItems}>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
          <p className="text-lg font-semibold text-destructive">{loadError}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate('/admin/deadlines')}
          >
            {t.buttons.backToList}
          </Button>
        </div>
      </ContentFormShell>
    );
  }

  return (
    <ContentFormShell
      breadcrumbItems={breadcrumbItems}
      actionButtons={actionButtons}
    >
      <div className="max-w-2xl">
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title">{t.deadlineForm.titleLabel}</Label>
            <Input
              id="title"
              placeholder={t.deadlineForm.titlePlaceholder}
              {...register('title')}
              className={cn(errors.title && 'border-destructive')}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'title-error' : undefined}
            />
            {errors.title && (
              <p
                id="title-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Deadline Date Field */}
          <DatePickerField
            id="deadlineDate"
            label={t.deadlineForm.deadlineDateLabel}
            value={deadlineDate || null}
            onChange={(iso) => setValue('deadlineDate', iso ?? '', { shouldValidate: true })}
            error={errors.deadlineDate?.message}
            required
          />

          {/* Description Field (TipTap Editor) */}
          <div className="space-y-2">
            <Label id="description-label" htmlFor="description">
              {t.deadlineForm.descriptionLabel}
            </Label>
            <RichTextEditor
              id="description"
              aria-labelledby="description-label"
              value={watch('description') || ''}
              onChange={(html) => setValue('description', html)}
              error={!!errors.description}
            />
            {errors.description && (
              <p className="text-sm text-destructive" role="alert">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* isUrgent Checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="isUrgent"
              checked={isUrgent}
              aria-invalid={!!errors.isUrgent}
              onCheckedChange={(checked) =>
                setValue('isUrgent', !!checked, { shouldValidate: true })
              }
            />
            <Label htmlFor="isUrgent">{t.deadlineForm.isUrgentLabel}</Label>
          </div>
        </form>
      </div>
    </ContentFormShell>
  );
};

export default DeadlineEdit;
