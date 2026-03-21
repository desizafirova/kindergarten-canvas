import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
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

/**
 * JobCreate - Create new job posting page for the admin panel.
 *
 * Features:
 * - React Hook Form with Zod validation
 * - Required fields: title, description, contactEmail
 * - Optional fields: requirements, applicationDeadline, isActive (default true)
 * - Two RichTextEditor instances: description (required) + requirements (optional)
 * - Save Draft and Publish buttons
 * - Bulgarian error messages and success toasts
 * - Navigation to list view after successful creation
 */
export const JobCreate: React.FC = () => {
  const navigate = useNavigate();
  const t = useTranslation();
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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

  const handleSaveDraft = useCallback(async (data: JobFormData) => {
    try {
      setIsSavingDraft(true);
      const payload = { ...data, status: 'DRAFT' };
      await api.post('/api/admin/v1/jobs', payload);
      toast.success(t.jobForm.success.saved);
      navigate('/admin/jobs');
    } catch (error) {
      console.error('Save draft error:', error);
      toast.error(t.jobForm.errors.saveFailed);
    } finally {
      setIsSavingDraft(false);
    }
  }, [navigate, t.jobForm.success.saved, t.jobForm.errors.saveFailed]);

  const handlePublish = useCallback(async (data: JobFormData) => {
    try {
      setIsPublishing(true);
      const payload = { ...data, status: 'PUBLISHED' };
      await api.post('/api/admin/v1/jobs', payload);
      toast.success(t.jobForm.success.published);
      navigate('/admin/jobs');
    } catch (error) {
      console.error('Publish job error:', error);
      toast.error(t.jobForm.errors.publishFailed);
    } finally {
      setIsPublishing(false);
    }
  }, [navigate, t.jobForm.success.published, t.jobForm.errors.publishFailed]);

  const breadcrumbItems = [
    { label: t.jobForm.breadcrumb.careers, href: '/admin/jobs' },
    { label: t.jobForm.breadcrumb.create },
  ];

  const actionButtons = (
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={handleSubmit(handleSaveDraft)}
        disabled={isSavingDraft || isPublishing}
      >
        {isSavingDraft ? t.common.loading : t.jobForm.saveDraft}
      </Button>
      <Button
        type="button"
        onClick={handleSubmit(handlePublish)}
        disabled={!isValid || isPublishing || isSavingDraft}
      >
        {isPublishing ? t.common.loading : t.jobForm.publish}
      </Button>
    </>
  );

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

export default JobCreate;
