import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
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
import { Loader2 } from 'lucide-react';

/**
 * EventEdit - Edit existing event page for the admin panel.
 *
 * Features:
 * - Fetches and pre-populates form with existing event data
 * - React Hook Form with Zod validation
 * - Status-aware action buttons (DRAFT: Save Draft + Publish; PUBLISHED: Update only)
 * - Update functionality via PUT API
 * - Bulgarian error messages and success toasts
 * - Loading and error states
 */
export const EventEdit: React.FC = () => {
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
  const status = watch('status');

  // Load existing event data
  useEffect(() => {
    const loadEvent = async () => {
      if (!id) {
        setLoadError('Invalid event ID');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await api.get(`/api/admin/v1/events/${id}`);
        const eventData = response.data.content;

        reset({
          title: eventData.title,
          eventDate: eventData.eventDate,
          eventEndDate: eventData.eventEndDate,
          location: eventData.location ?? '',
          description: eventData.description,
          imageUrl: eventData.imageUrl,
          isImportant: eventData.isImportant,
          status: eventData.status,
        });
      } catch (error: any) {
        console.error('Load event error:', error);
        if (error.response?.status === 404) {
          setLoadError('Събитието не е намерено');
        } else {
          setLoadError(t.eventsList.loadError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadEvent();
  }, [id, reset, t.eventsList.loadError]);

  const handleDescriptionChange = (html: string) => {
    setValue('description', html, { shouldValidate: true });
  };

  const handleImageUpload = (url: string) => {
    setValue('imageUrl', url, { shouldValidate: true });
  };

  const handleImageRemove = () => {
    setValue('imageUrl', null, { shouldValidate: true });
  };

  const handleSave = useCallback(async (data: EventFormData) => {
    if (!id) return;

    try {
      setIsSaving(true);
      await api.put(`/api/admin/v1/events/${id}`, data);
      toast.success(t.eventForm.success.saved);
      navigate('/admin/events');
    } catch (error) {
      console.error('Save event error:', error);
      toast.error(t.eventForm.errors.saveFailed);
    } finally {
      setIsSaving(false);
    }
  }, [id, navigate, t.eventForm.success.saved, t.eventForm.errors.saveFailed]);

  const handlePublish = useCallback(async (data: EventFormData) => {
    if (!id) return;

    try {
      setIsPublishing(true);
      await api.put(`/api/admin/v1/events/${id}`, { ...data, status: 'PUBLISHED' });
      toast.success(t.eventForm.success.published);
      navigate('/admin/events');
    } catch (error) {
      console.error('Publish event error:', error);
      toast.error(t.eventForm.errors.publishFailed);
    } finally {
      setIsPublishing(false);
    }
  }, [id, navigate, t.eventForm.success.published, t.eventForm.errors.publishFailed]);

  const handleUpdate = useCallback(async (data: EventFormData) => {
    if (!id) return;

    try {
      setIsUpdating(true);
      await api.put(`/api/admin/v1/events/${id}`, data);
      toast.success(t.eventForm.success.updated);

      // Reload event data to reflect changes
      const response = await api.get(`/api/admin/v1/events/${id}`);
      const eventData = response.data.content;
      reset({
        title: eventData.title,
        eventDate: eventData.eventDate,
        eventEndDate: eventData.eventEndDate,
        location: eventData.location ?? '',
        description: eventData.description,
        imageUrl: eventData.imageUrl,
        isImportant: eventData.isImportant,
        status: eventData.status,
      });
    } catch (error) {
      console.error('Update event error:', error);
      toast.error(t.eventForm.errors.updateFailed);
    } finally {
      setIsUpdating(false);
    }
  }, [id, reset, t.eventForm.success.updated, t.eventForm.errors.updateFailed]);

  const breadcrumbItems = [
    { label: t.eventForm.breadcrumb.events, href: '/admin/events' },
    { label: t.eventForm.breadcrumb.edit },
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
            {isSaving ? t.common.loading : t.eventForm.saveDraft}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit(handlePublish)}
            disabled={!isValid || isSubmitting}
          >
            {isPublishing ? t.common.loading : t.eventForm.publish}
          </Button>
        </>
      ) : (
        <Button
          type="button"
          onClick={handleSubmit(handleUpdate)}
          disabled={!isValid || isSubmitting}
        >
          {isUpdating ? t.common.loading : t.eventForm.update}
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
            onClick={() => navigate('/admin/events')}
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

export default EventEdit;
