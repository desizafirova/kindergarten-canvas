import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { ContentFormShell } from '@/components/admin/ContentFormShell';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { ImageUploadZone } from '@/components/admin/ImageUploadZone';
import { DatePickerField } from '@/components/admin/DatePickerField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { eventFormSchema, type EventFormData } from '@/schemas/event-form.schema';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/**
 * EventCreate - Create new event page for the admin panel.
 *
 * Features:
 * - React Hook Form with Zod validation
 * - Required fields: title, eventDate
 * - Optional fields: eventEndDate (with minDate validation), location, description, isImportant, imageUrl
 * - Save Draft and Publish buttons
 * - Bulgarian error messages and success toasts
 * - Navigation to list view after successful creation
 */
export const EventCreate: React.FC = () => {
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
  } = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      eventDate: '',
      eventEndDate: null,
      location: '',
      description: null,
      imageUrl: null,
      isImportant: false,
      status: 'DRAFT',
    },
  });

  const eventDate = watch('eventDate');
  const description = watch('description');
  const imageUrl = watch('imageUrl');
  const isImportant = watch('isImportant');

  const handleDescriptionChange = (html: string) => {
    setValue('description', html, { shouldValidate: true });
  };

  const handleImageUpload = (url: string) => {
    setValue('imageUrl', url, { shouldValidate: true });
  };

  const handleImageRemove = () => {
    setValue('imageUrl', null, { shouldValidate: true });
  };

  const handleSaveDraft = useCallback(async (data: EventFormData) => {
    try {
      setIsSavingDraft(true);
      const payload = { ...data, status: 'DRAFT' };
      await api.post('/api/admin/v1/events', payload);
      toast.success(t.eventForm.success.saved);
      navigate('/admin/events');
    } catch (error) {
      console.error('Save draft error:', error);
      toast.error(t.eventForm.errors.saveFailed);
    } finally {
      setIsSavingDraft(false);
    }
  }, [navigate, t.eventForm.success.saved, t.eventForm.errors.saveFailed]);

  const handlePublish = useCallback(async (data: EventFormData) => {
    try {
      setIsPublishing(true);
      const payload = { ...data, status: 'PUBLISHED' };
      await api.post('/api/admin/v1/events', payload);
      toast.success(t.eventForm.success.published);
      navigate('/admin/events');
    } catch (error) {
      console.error('Publish event error:', error);
      toast.error(t.eventForm.errors.publishFailed);
    } finally {
      setIsPublishing(false);
    }
  }, [navigate, t.eventForm.success.published, t.eventForm.errors.publishFailed]);

  const breadcrumbItems = [
    { label: t.eventForm.breadcrumb.events, href: '/admin/events' },
    { label: t.eventForm.breadcrumb.create },
  ];

  const actionButtons = (
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={handleSubmit(handleSaveDraft)}
        disabled={isSavingDraft || isPublishing}
      >
        {isSavingDraft ? t.common.loading : t.eventForm.saveDraft}
      </Button>
      <Button
        type="button"
        onClick={handleSubmit(handlePublish)}
        disabled={!isValid || isPublishing || isSavingDraft}
      >
        {isPublishing ? t.common.loading : t.eventForm.publish}
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
            <Label htmlFor="title">{t.eventForm.titleLabel}</Label>
            <Input
              id="title"
              placeholder={t.eventForm.titlePlaceholder}
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

          {/* Event Date Field */}
          <DatePickerField
            id="eventDate"
            label={t.eventForm.eventDateLabel}
            value={eventDate || null}
            onChange={(iso) => setValue('eventDate', iso ?? '', { shouldValidate: true })}
            error={errors.eventDate?.message}
            required
          />

          {/* End Date Field */}
          <DatePickerField
            id="eventEndDate"
            label={t.eventForm.eventEndDateLabel}
            value={watch('eventEndDate') ?? null}
            onChange={(iso) => setValue('eventEndDate', iso, { shouldValidate: true })}
            error={errors.eventEndDate?.message}
            minDate={eventDate ? new Date(eventDate) : undefined}
          />

          {/* Location Field */}
          <div className="space-y-2">
            <Label htmlFor="location">{t.eventForm.locationLabel}</Label>
            <Input
              id="location"
              placeholder={t.eventForm.locationPlaceholder}
              {...register('location', { setValueAs: (v: string) => v === '' ? null : v })}
              aria-invalid={!!errors.location}
              aria-describedby={errors.location ? 'location-error' : undefined}
            />
            {errors.location && (
              <p
                id="location-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {errors.location.message}
              </p>
            )}
          </div>

          {/* Description Field (TipTap Editor) */}
          <div className="space-y-2">
            <div
              id="description-label"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t.eventForm.descriptionLabel}
            </div>
            <RichTextEditor
              id="description"
              value={description || ''}
              onChange={handleDescriptionChange}
              error={!!errors.description}
            />
            {errors.description && (
              <p className="text-sm text-destructive" role="alert">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* isImportant Checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="isImportant"
              checked={isImportant}
              onCheckedChange={(checked) =>
                setValue('isImportant', !!checked, { shouldValidate: true })
              }
            />
            <Label htmlFor="isImportant">{t.eventForm.isImportantLabel}</Label>
          </div>

          {/* Image Upload */}
          <ImageUploadZone
            onUpload={handleImageUpload}
            onRemove={handleImageRemove}
            previewUrl={imageUrl}
            label={t.eventForm.imageLabel}
          />
        </form>
      </div>
    </ContentFormShell>
  );
};

export default EventCreate;
