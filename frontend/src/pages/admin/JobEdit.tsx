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
import { jobFormSchema, type JobFormData } from '@/schemas/job-form.schema';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

/**
 * JobEdit - Edit existing job posting page for the admin panel.
 *
 * Features:
 * - Fetches and pre-populates form with existing job data
 * - React Hook Form with Zod validation
 * - Status-aware action buttons (DRAFT: Save Draft + Publish; PUBLISHED: Update only)
 * - Update functionality via PUT API
 * - Bulgarian error messages and success toasts
 * - Loading and error states
 */
export const JobEdit: React.FC = () => {
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
  } = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      requirements: null,
      contactEmail: '',
      applicationDeadline: null,
      isActive: true,
      status: 'DRAFT',
    },
  });

  const description = watch('description');
  const requirements = watch('requirements');
  const isActive = watch('isActive');
  const status = watch('status');

  // Load existing job data
  useEffect(() => {
    const loadJob = async () => {
      if (!id) {
        setLoadError('Invalid job ID');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await api.get(`/api/admin/v1/jobs/${id}`);
        const jobData = response.data.content;

        reset({
          title: jobData.title,
          description: jobData.description,
          requirements: jobData.requirements,
          contactEmail: jobData.contactEmail,
          applicationDeadline: jobData.applicationDeadline,
          isActive: jobData.isActive,
          status: jobData.status,
        });
      } catch (error: any) {
        console.error('Load job error:', error);
        if (error.response?.status === 404) {
          setLoadError('Позицията не е намерена');
        } else {
          setLoadError(t.jobsList.loadError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadJob();
  }, [id, reset, t.jobsList.loadError]);

  const handleSave = useCallback(async (data: JobFormData) => {
    if (!id) return;

    try {
      setIsSaving(true);
      await api.put(`/api/admin/v1/jobs/${id}`, data);
      toast.success(t.jobForm.success.saved);
      navigate('/admin/jobs');
    } catch (error) {
      console.error('Save job error:', error);
      toast.error(t.jobForm.errors.saveFailed);
    } finally {
      setIsSaving(false);
    }
  }, [id, navigate, t.jobForm.success.saved, t.jobForm.errors.saveFailed]);

  const handlePublish = useCallback(async (data: JobFormData) => {
    if (!id) return;

    try {
      setIsPublishing(true);
      await api.put(`/api/admin/v1/jobs/${id}`, { ...data, status: 'PUBLISHED' });
      toast.success(t.jobForm.success.published);
      navigate('/admin/jobs');
    } catch (error) {
      console.error('Publish job error:', error);
      toast.error(t.jobForm.errors.publishFailed);
    } finally {
      setIsPublishing(false);
    }
  }, [id, navigate, t.jobForm.success.published, t.jobForm.errors.publishFailed]);

  const handleUpdate = useCallback(async (data: JobFormData) => {
    if (!id) return;

    try {
      setIsUpdating(true);
      const response = await api.put(`/api/admin/v1/jobs/${id}`, data);
      const jobData = response.data.content;
      toast.success(t.jobForm.success.updated);

      // Reset form with updated data from PUT response (no extra GET needed)
      reset({
        title: jobData.title,
        description: jobData.description,
        requirements: jobData.requirements,
        contactEmail: jobData.contactEmail,
        applicationDeadline: jobData.applicationDeadline,
        isActive: jobData.isActive,
        status: jobData.status,
      });
    } catch (error) {
      console.error('Update job error:', error);
      toast.error(t.jobForm.errors.updateFailed);
    } finally {
      setIsUpdating(false);
    }
  }, [id, reset, t.jobForm.success.updated, t.jobForm.errors.updateFailed]);

  const breadcrumbItems = [
    { label: t.jobForm.breadcrumb.careers, href: '/admin/jobs' },
    { label: t.jobForm.breadcrumb.edit },
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
            {isSaving ? t.common.loading : t.jobForm.saveDraft}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit(handlePublish)}
            disabled={!isValid || isSubmitting}
          >
            {isPublishing ? t.common.loading : t.jobForm.publish}
          </Button>
        </>
      ) : (
        <Button
          type="button"
          onClick={handleSubmit(handleUpdate)}
          disabled={!isValid || isSubmitting}
        >
          {isUpdating ? t.common.loading : t.jobForm.update}
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
            onClick={() => navigate('/admin/jobs')}
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
            <Label htmlFor="title">{t.jobForm.titleLabel}</Label>
            <Input
              id="title"
              placeholder={t.jobForm.titlePlaceholder}
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

          {/* Description Field (TipTap Editor — REQUIRED) */}
          <div className="space-y-2">
            <div
              id="description-label"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t.jobForm.descriptionLabel}
            </div>
            <RichTextEditor
              id="description"
              value={description ?? ''}
              onChange={(html) => setValue('description', html, { shouldValidate: true })}
              error={!!errors.description}
            />
            {errors.description && (
              <p className="text-sm text-destructive" role="alert">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Requirements Field (TipTap Editor — OPTIONAL) */}
          <div className="space-y-2">
            <div
              id="requirements-label"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t.jobForm.requirementsLabel}
            </div>
            <RichTextEditor
              id="requirements"
              value={requirements ?? ''}
              onChange={(html) => setValue('requirements', html || null, { shouldValidate: true })}
            />
          </div>

          {/* Contact Email Field */}
          <div className="space-y-2">
            <Label htmlFor="contactEmail">{t.jobForm.contactEmailLabel}</Label>
            <Input
              id="contactEmail"
              type="email"
              placeholder={t.jobForm.contactEmailPlaceholder}
              {...register('contactEmail')}
              className={cn(errors.contactEmail && 'border-destructive')}
              aria-invalid={!!errors.contactEmail}
              aria-describedby={errors.contactEmail ? 'contactEmail-error' : undefined}
            />
            {errors.contactEmail && (
              <p
                id="contactEmail-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {errors.contactEmail.message}
              </p>
            )}
          </div>

          {/* Application Deadline Field (optional) */}
          <DatePickerField
            id="applicationDeadline"
            label={t.jobForm.applicationDeadlineLabel}
            value={watch('applicationDeadline') ?? null}
            onChange={(iso) => setValue('applicationDeadline', iso, { shouldValidate: true })}
            error={errors.applicationDeadline?.message}
          />

          {/* isActive Checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) =>
                setValue('isActive', !!checked, { shouldValidate: true })
              }
            />
            <Label htmlFor="isActive">{t.jobForm.isActiveLabel}</Label>
          </div>
        </form>
      </div>
    </ContentFormShell>
  );
};

export default JobEdit;
