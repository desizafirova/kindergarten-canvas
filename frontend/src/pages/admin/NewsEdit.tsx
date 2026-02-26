import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
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
import { Loader2 } from 'lucide-react';
import { useAutoSave } from '@/hooks/useAutoSave';

export const NewsEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const t = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

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
      } catch (error: any) {
        console.error('Load news error:', error);
        if (error.response?.status === 404) {
          setLoadError('Новината не е намерена');
        } else {
          setLoadError('Грешка при зареждане на новината');
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

  const onSubmit = async (data: NewsFormData) => {
    if (!id) return;

    try {
      setIsSubmitting(true);
      await api.put(`/api/admin/v1/news/${id}`, data);

      toast.success(t.newsForm.success.updated);
      navigate('/admin/news');
    } catch (error) {
      console.error('Update news error:', error);
      toast.error(t.newsForm.errors.saveFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = handleSubmit(onSubmit);

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

  // Keyboard shortcut: Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (!isSubmitting && isValid) {
          handleUpdate();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting, isValid, handleUpdate]);

  const breadcrumbItems = [
    { label: t.newsForm.breadcrumb.news, href: '/admin/news' },
    { label: t.newsForm.breadcrumb.edit },
  ];

  const actionButtons = (
    <Button type="button" onClick={handleUpdate} disabled={!isValid || isSubmitting}>
      {t.newsForm.update}
    </Button>
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
          <span className="ml-3 text-muted-foreground">Зареждане...</span>
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
            Обратно към списъка
          </Button>
        </div>
      </ContentFormShell>
    );
  }

  return (
    <ContentFormShell
      breadcrumbItems={breadcrumbItems}
      actionButtons={actionButtons}
      autoSaveIndicator={autoSaveIndicator || undefined}
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
