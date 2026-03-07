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
import { deadlineFormSchema, type DeadlineFormData } from '@/schemas/deadline-form.schema';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/**
 * DeadlineCreate - Create new deadline page for the admin panel.
 *
 * Features:
 * - React Hook Form with Zod validation
 * - Required fields: title, deadlineDate
 * - Optional fields: description, isUrgent
 * - Save Draft and Publish buttons
 * - Bulgarian error messages and success toasts
 * - Navigation to list view after successful creation
 */
export const DeadlineCreate: React.FC = () => {
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

  const handleSaveDraft = useCallback(async (data: DeadlineFormData) => {
    try {
      setIsSavingDraft(true);
      const payload = { ...data, status: 'DRAFT' };
      await api.post('/api/admin/v1/admission-deadlines', payload);
      toast.success(t.deadlineForm.success.saved);
      navigate('/admin/deadlines');
    } catch (error) {
      toast.error(t.deadlineForm.errors.saveFailed);
    } finally {
      setIsSavingDraft(false);
    }
  }, [navigate, t.deadlineForm.success.saved, t.deadlineForm.errors.saveFailed]);

  const handlePublish = useCallback(async (data: DeadlineFormData) => {
    try {
      setIsPublishing(true);
      const payload = { ...data, status: 'PUBLISHED' };
      await api.post('/api/admin/v1/admission-deadlines', payload);
      toast.success(t.deadlineForm.success.published);
      navigate('/admin/deadlines');
    } catch (error) {
      toast.error(t.deadlineForm.errors.publishFailed);
    } finally {
      setIsPublishing(false);
    }
  }, [navigate, t.deadlineForm.success.published, t.deadlineForm.errors.publishFailed]);

  const breadcrumbItems = [
    { label: t.deadlineForm.breadcrumb.deadlines, href: '/admin/deadlines' },
    { label: t.deadlineForm.breadcrumb.create },
  ];

  const actionButtons = (
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={handleSubmit(handleSaveDraft)}
        disabled={isSavingDraft || isPublishing}
      >
        {isSavingDraft ? t.common.loading : t.deadlineForm.saveDraft}
      </Button>
      <Button
        type="button"
        onClick={handleSubmit(handlePublish)}
        disabled={!isValid || isPublishing || isSavingDraft}
      >
        {isPublishing ? t.common.loading : t.deadlineForm.publish}
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

export default DeadlineCreate;
