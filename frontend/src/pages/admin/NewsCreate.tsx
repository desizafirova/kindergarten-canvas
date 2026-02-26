import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { ContentFormShell } from '@/components/admin/ContentFormShell';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { ImageUploadZone } from '@/components/admin/ImageUploadZone';
import { AutoSaveIndicator } from '@/components/admin/AutoSaveIndicator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { newsFormSchema, type NewsFormData } from '@/schemas/news-form.schema';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useAutoSave } from '@/hooks/useAutoSave';

export const NewsCreate: React.FC = () => {
  const navigate = useNavigate();
  const t = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newsId, setNewsId] = useState<number | null>(null);

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

  const onSubmit = useCallback(async (data: NewsFormData, isDraft: boolean) => {
    try {
      setIsSubmitting(true);
      const payload = {
        ...data,
        status: isDraft ? 'DRAFT' : 'PUBLISHED',
      };

      if (newsId === null) {
        // No auto-save happened yet, create new
        await api.post('/api/admin/v1/news', payload);
      } else {
        // Update existing draft (from auto-save)
        await api.put(`/api/admin/v1/news/${newsId}`, payload);
      }

      toast.success(
        isDraft ? t.newsForm.success.saved : t.newsForm.success.published
      );
      navigate('/admin/news');
    } catch (error) {
      console.error('Create news error:', error);
      toast.error(
        isDraft ? t.newsForm.errors.saveFailed : t.newsForm.errors.publishFailed
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [newsId, navigate, t.newsForm.success.saved, t.newsForm.success.published, t.newsForm.errors.saveFailed, t.newsForm.errors.publishFailed]);

  const handleSaveDraft = handleSubmit((data) => onSubmit(data, true));
  const handlePublish = handleSubmit((data) => onSubmit(data, false));

  // Warn user before leaving with unsaved changes (only if auto-save is in progress or errored)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only warn if there are changes and auto-save is currently saving or has failed
      const hasUnsavedChanges = isDirty && (saveState.status === 'saving' || saveState.status === 'error');
      if (hasUnsavedChanges && !isSubmitting) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, isSubmitting, saveState.status]);

  // Keyboard shortcut: Ctrl+S to save draft
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (!isSubmitting) {
          handleSaveDraft();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting, handleSaveDraft]);

  const breadcrumbItems = [
    { label: t.newsForm.breadcrumb.news, href: '/admin/news' },
    { label: t.newsForm.breadcrumb.create },
  ];

  const actionButtons = (
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={handleSaveDraft}
        disabled={isSubmitting}
      >
        {t.newsForm.saveDraft}
      </Button>
      <Button
        type="button"
        onClick={handlePublish}
        disabled={!isValid || isSubmitting}
      >
        {t.newsForm.publish}
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
    <ContentFormShell
      breadcrumbItems={breadcrumbItems}
      actionButtons={actionButtons}
      autoSaveIndicator={autoSaveIndicator}
    >
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
            placeholder="Започнете да пишете..."
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
    </ContentFormShell>
  );
};
