import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { ContentFormShell } from '@/components/admin/ContentFormShell';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { ImageUploadZone } from '@/components/admin/ImageUploadZone';
import { AutoSaveIndicator } from '@/components/admin/AutoSaveIndicator';
import { PreviewModal } from '@/components/admin/PreviewModal';
import { LivePreviewPane } from '@/components/admin/LivePreviewPane';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { newsFormSchema, type NewsFormData } from '@/schemas/news-form.schema';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useWebSocketPreview } from '@/hooks/useWebSocketPreview';

export const NewsEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const t = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [publishedAt, setPublishedAt] = useState<Date | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<NewsFormData>({
    resolver: zodResolver(newsFormSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      content: '',
      imageUrl: null,
      status: 'DRAFT',
    },
  });

  const content = watch('content');
  const imageUrl = watch('imageUrl');
  const title = watch('title');
  const status = watch('status');

  // WebSocket preview hook for real-time preview
  const { connectionStatus, previewHtml, isPreviewAvailable } = useWebSocketPreview({
    title: title || '',
    content: content || '',
    imageUrl: imageUrl,
  });

  useEffect(() => {
    const loadNews = async () => {
      if (!id) {
        setLoadError('Invalid news ID');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await api.get(`/api/admin/v1/news/${id}`);
        const newsData = response.data.content;

        reset({
          title: newsData.title,
          content: newsData.content,
          imageUrl: newsData.imageUrl,
          status: newsData.status,
        });

        // Store publishedAt for preview modal
        setPublishedAt(newsData.publishedAt ? new Date(newsData.publishedAt) : null);
      } catch (error: any) {
        console.error('Load news error:', error);
        if (error.response?.status === 404) {
          setLoadError(t.errors.newsNotFound);
        } else {
          setLoadError(t.errors.newsLoadError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadNews();
  }, [id, reset]);

  const handleContentChange = (html: string) => {
    setValue('content', html, { shouldValidate: true });
  };

  const handleImageUpload = (url: string) => {
    setValue('imageUrl', url, { shouldValidate: true });
  };

  const handleImageRemove = () => {
    setValue('imageUrl', null, { shouldValidate: true });
  };

  // Auto-save callback: PUT to update existing news
  const handleAutoSave = useCallback(async (data: NewsFormData) => {
    if (!id) return;

    await api.put(`/api/admin/v1/news/${id}`, {
      ...data,
      // Preserve existing status during auto-save (don't change PUBLISHED to DRAFT)
      status: data.status,
    });
  }, [id]);

  // Initialize auto-save with form data
  const formData = { title, content, imageUrl, status };
  const { saveState } = useAutoSave(formData, handleAutoSave, {
    debounceMs: 10000, // 10 seconds
  });

  const handleSave = useCallback(async (data: NewsFormData) => {
    if (!id) return;

    try {
      setIsSaving(true);
      await api.put(`/api/admin/v1/news/${id}`, {
        ...data,
        // Preserve current status when saving
        status: data.status,
      });

      toast.success(t.newsForm.success.saved);
      navigate('/admin/news');
    } catch (error) {
      console.error('Save news error:', error);
      toast.error(t.newsForm.errors.saveFailed);
    } finally {
      setIsSaving(false);
    }
  }, [id, navigate, t.newsForm.success.saved, t.newsForm.errors.saveFailed]);

  const handlePublish = useCallback(async (data: NewsFormData) => {
    if (!id) return;

    try {
      setIsPublishing(true);
      await api.put(`/api/admin/v1/news/${id}`, {
        ...data,
        status: 'PUBLISHED',
        publishedAt: new Date().toISOString(),
      });

      // Update local publishedAt state for preview modal
      setPublishedAt(new Date());

      // Reload news data to reflect updated status
      const response = await api.get(`/api/admin/v1/news/${id}`);
      const newsData = response.data.content;
      reset({
        title: newsData.title,
        content: newsData.content,
        imageUrl: newsData.imageUrl,
        status: newsData.status,
      });

      // Toast with link to public page
      toast.success(t.newsForm.success.published, {
        action: {
          label: t.newsForm.viewOnSite,
          onClick: () => window.open(`/news/${id}`, '_blank'),
        },
        duration: 4000,
      });
    } catch (error) {
      console.error('Publish news error:', error);
      toast.error(t.newsForm.errors.publishFailed);
    } finally {
      setIsPublishing(false);
    }
  }, [id, reset, t.newsForm.success.published, t.newsForm.viewOnSite, t.newsForm.errors.publishFailed]);

  const handleUpdate = useCallback(async (data: NewsFormData) => {
    if (!id) return;

    try {
      setIsUpdating(true);
      await api.put(`/api/admin/v1/news/${id}`, {
        ...data,
        status: data.status, // Keep published status
      });

      toast.success(t.newsForm.success.updated, { duration: 4000 });

      // Reload news data to reflect changes
      const response = await api.get(`/api/admin/v1/news/${id}`);
      const newsData = response.data.content;
      reset({
        title: newsData.title,
        content: newsData.content,
        imageUrl: newsData.imageUrl,
        status: newsData.status,
      });
    } catch (error) {
      console.error('Update news error:', error);
      toast.error(t.newsForm.errors.saveFailed);
    } finally {
      setIsUpdating(false);
    }
  }, [id, reset, t.newsForm.success.updated, t.newsForm.errors.saveFailed]);

  // Warn user before leaving with unsaved changes (only if auto-save is in progress or errored)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only warn if there are changes and auto-save is currently saving or has failed
      const hasUnsavedChanges = isDirty && (saveState.status === 'saving' || saveState.status === 'error');
      const isSubmitting = isSaving || isPublishing || isUpdating;
      if (hasUnsavedChanges && !isSubmitting) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, isSaving, isPublishing, isUpdating, saveState.status]);

  // Keyboard shortcut: Ctrl+S to save or update
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const isSubmitting = isSaving || isPublishing || isUpdating;
        if (!isSubmitting && isValid) {
          const isDraft = status === 'DRAFT';
          if (isDraft) {
            handleSubmit(handleSave)();
          } else {
            handleSubmit(handleUpdate)();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSaving, isPublishing, isUpdating, isValid, status, handleSubmit, handleSave, handleUpdate]);

  const breadcrumbItems = [
    { label: t.newsForm.breadcrumb.news, href: '/admin/news' },
    { label: t.newsForm.breadcrumb.edit },
  ];

  const isDraft = status === 'DRAFT';
  const isSubmitting = isSaving || isPublishing || isUpdating;

  const actionButtons = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsPreviewOpen(true)}
        disabled={isSubmitting}
      >
        {t.newsForm.preview}
      </Button>
      {isDraft ? (
        <>
          <Button
            type="button"
            variant="secondary"
            onClick={handleSubmit(handleSave)}
            disabled={isSubmitting}
          >
            {isSaving ? t.common.loading : t.newsForm.saveDraft}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit(handlePublish)}
            disabled={!isValid || isSubmitting}
          >
            {isPublishing ? t.common.loading : t.newsForm.publish}
          </Button>
        </>
      ) : (
        <>
          <Button
            type="button"
            variant="secondary"
            onClick={handleSubmit(handleSave)}
            disabled={isSubmitting}
          >
            {isSaving ? t.common.loading : t.buttons.save}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit(handleUpdate)}
            disabled={!isValid || isSubmitting}
          >
            {isUpdating ? t.common.loading : t.buttons.update}
          </Button>
        </>
      )}
    </>
  );

  // Auto-save indicator with Bulgarian translations
  const autoSaveIndicator = !isLoading && !loadError && (
    <AutoSaveIndicator
      status={saveState.status}
      message={
        saveState.status === 'saving' ? t.autoSave.saving :
        saveState.status === 'saved' ? t.autoSave.saved :
        saveState.status === 'error' ? t.autoSave.error :
        undefined
      }
    />
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
            onClick={() => navigate('/admin/news')}
          >
            {t.buttons.backToList}
          </Button>
        </div>
      </ContentFormShell>
    );
  }

  return (
    <>
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={title || ''}
        content={content || ''}
        imageUrl={imageUrl}
        publishedAt={publishedAt}
      />

      <ContentFormShell
        breadcrumbItems={breadcrumbItems}
        actionButtons={actionButtons}
        autoSaveIndicator={autoSaveIndicator || undefined}
      >
        {/* Grid layout: form on left, live preview on right (desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Title Field */}
            <div className="space-y-2">
              <Label htmlFor="title">{t.newsForm.titleLabel}</Label>
              <Input
                id="title"
                placeholder={t.newsForm.titlePlaceholder}
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

            {/* Content Field (TipTap Editor) */}
            <div className="space-y-2">
              <div id="content-label" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {t.newsForm.contentLabel}
              </div>
              <RichTextEditor
                id="content"
                value={content}
                onChange={handleContentChange}
                error={!!errors.content}
                placeholder={t.newsForm.contentPlaceholder}
              />
              {errors.content && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.content.message}
                </p>
              )}
            </div>

            {/* Image Upload */}
            <ImageUploadZone
              onUpload={handleImageUpload}
              onRemove={handleImageRemove}
              previewUrl={imageUrl}
              label={t.newsForm.imageLabel}
            />
          </form>
          </div>

          {/* Live Preview Section (hidden on mobile) */}
          <div className="hidden lg:block">
            <LivePreviewPane
              connectionStatus={connectionStatus}
              previewHtml={previewHtml}
              isPreviewAvailable={isPreviewAvailable}
              title={title || ''}
              imageUrl={imageUrl}
            />
          </div>
        </div>
    </ContentFormShell>
    </>
  );
};
