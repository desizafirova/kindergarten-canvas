import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
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
import { useAutoSave } from '@/hooks/useAutoSave';
import { useWebSocketPreview } from '@/hooks/useWebSocketPreview';

export const NewsCreate: React.FC = () => {
  const navigate = useNavigate();
  const t = useTranslation();
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [newsId, setNewsId] = useState<number | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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

  // WebSocket preview hook for real-time preview
  const { connectionStatus, previewHtml, isPreviewAvailable } = useWebSocketPreview({
    title: title || '',
    content: content || '',
    imageUrl: imageUrl,
  });

  const handleContentChange = (html: string) => {
    setValue('content', html, { shouldValidate: true });
  };

  const handleImageUpload = (url: string) => {
    setValue('imageUrl', url, { shouldValidate: true });
  };

  const handleImageRemove = () => {
    setValue('imageUrl', null, { shouldValidate: true });
  };

  // Auto-save callback: POST for first save, PUT for subsequent saves
  const handleAutoSave = useCallback(async (data: NewsFormData) => {
    const payload = {
      ...data,
      status: 'DRAFT', // Auto-save always creates/updates drafts
    };

    if (newsId === null) {
      // First save: POST to create draft
      const response = await api.post('/api/admin/v1/news', payload);
      const createdId = response.data.content.id;
      setNewsId(createdId);

      // Update URL with replace: true to avoid creating history entry
      navigate(`/admin/news/${createdId}/edit`, { replace: true });
    } else {
      // Subsequent saves: PUT to update existing draft
      await api.put(`/api/admin/v1/news/${newsId}`, payload);
    }
  }, [newsId, navigate]);

  // Initialize auto-save with form data
  const formData = { title, content, imageUrl, status: 'DRAFT' as const };
  const { saveState } = useAutoSave(formData, handleAutoSave, {
    debounceMs: 10000, // 10 seconds
  });

  const handleSaveDraft = useCallback(async (data: NewsFormData) => {
    try {
      setIsSavingDraft(true);
      const payload = {
        ...data,
        status: 'DRAFT',
      };

      if (newsId === null) {
        // No auto-save happened yet, create new draft
        await api.post('/api/admin/v1/news', payload);
      } else {
        // Update existing draft (from auto-save)
        await api.put(`/api/admin/v1/news/${newsId}`, payload);
      }

      toast.success(t.newsForm.success.saved);
      navigate('/admin/news');
    } catch (error) {
      console.error('Save draft error:', error);
      toast.error(t.newsForm.errors.saveFailed);
    } finally {
      setIsSavingDraft(false);
    }
  }, [newsId, navigate, t.newsForm.success.saved, t.newsForm.errors.saveFailed]);

  const handlePublish = useCallback(async (data: NewsFormData) => {
    try {
      setIsPublishing(true);
      const payload = {
        ...data,
        status: 'PUBLISHED',
        publishedAt: new Date().toISOString(),
      };

      let createdNewsId = newsId;

      if (newsId === null) {
        // No auto-save happened yet, create new published news
        const response = await api.post('/api/admin/v1/news', payload);
        createdNewsId = response.data.content.id;
      } else {
        // Update existing draft to published
        await api.put(`/api/admin/v1/news/${newsId}`, payload);
      }

      // Toast with link to public page
      toast.success(t.newsForm.success.published, {
        action: {
          label: t.newsForm.viewOnSite,
          onClick: () => window.open(`/news/${createdNewsId}`, '_blank'),
        },
        duration: 4000,
      });
      navigate('/admin/news');
    } catch (error) {
      console.error('Publish news error:', error);
      toast.error(t.newsForm.errors.publishFailed);
    } finally {
      setIsPublishing(false);
    }
  }, [newsId, navigate, t.newsForm.success.published, t.newsForm.viewOnSite, t.newsForm.errors.publishFailed]);

  // Warn user before leaving with unsaved changes (only if auto-save is in progress or errored)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only warn if there are changes and auto-save is currently saving or has failed
      const hasUnsavedChanges = isDirty && (saveState.status === 'saving' || saveState.status === 'error');
      const isSubmitting = isSavingDraft || isPublishing;
      if (hasUnsavedChanges && !isSubmitting) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, isSavingDraft, isPublishing, saveState.status]);

  // Keyboard shortcut: Ctrl+S to save draft
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const isSubmitting = isSavingDraft || isPublishing;
        if (!isSubmitting && isValid) {
          handleSubmit(handleSaveDraft)();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSavingDraft, isPublishing, isValid, handleSubmit, handleSaveDraft]);

  const breadcrumbItems = [
    { label: t.newsForm.breadcrumb.news, href: '/admin/news' },
    { label: t.newsForm.breadcrumb.create },
  ];

  const actionButtons = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsPreviewOpen(true)}
        disabled={isSavingDraft || isPublishing}
      >
        {t.newsForm.preview}
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={handleSubmit(handleSaveDraft)}
        disabled={isSavingDraft || isPublishing}
      >
        {isSavingDraft ? t.common.loading : t.newsForm.saveDraft}
      </Button>
      <Button
        type="button"
        onClick={handleSubmit(handlePublish)}
        disabled={!isValid || isPublishing || isSavingDraft}
      >
        {isPublishing ? t.common.loading : t.newsForm.publish}
      </Button>
    </>
  );

  // Auto-save indicator with Bulgarian translations
  const autoSaveIndicator = (
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

  return (
    <>
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={title || ''}
        content={content || ''}
        imageUrl={imageUrl}
        publishedAt={null}
      />

      <ContentFormShell
        breadcrumbItems={breadcrumbItems}
        actionButtons={actionButtons}
        autoSaveIndicator={autoSaveIndicator}
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
