import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { ContentFormShell } from '@/components/admin/ContentFormShell';
import { GalleryImageGrid } from '@/components/admin/GalleryImageGrid';
import { GalleryImageUploadZone } from '@/components/admin/GalleryImageUploadZone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { galleryFormSchema, type GalleryFormData } from '@/schemas/gallery-form.schema';
import { toast } from 'sonner';
import { getGallery, updateGallery, GalleryError } from '@/hooks/useGalleries';
import useGalleryImages from '@/hooks/useGalleryImages';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { GalleryImage } from '@/types/gallery';

/**
 * GalleryEdit - Edit existing gallery page for the admin panel.
 *
 * Features:
 * - Loads gallery by :id via getGallery()
 * - Pre-populates title and description
 * - Shows existing images in GalleryImageGrid (with delete and drag-to-reorder)
 * - Allows adding new images via GalleryImageUploadZone
 * - Action bar: shows "Запази чернова" + "Публикувай" for DRAFT, "Обнови" + "Публикувай" for PUBLISHED
 * - AC5: "Публикувай" requires at least 1 image
 * - Loading skeleton and error state
 */
const GalleryEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const galleryId = parseInt(id || '0', 10);
  const t = useTranslation();
  const { deleteImage, reorderImages } = useGalleryImages();

  const [images, setImages] = useState<GalleryImage[]>([]);
  const [galleryStatus, setGalleryStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<GalleryFormData>({
    resolver: zodResolver(galleryFormSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: null,
      status: 'DRAFT',
    },
  });

  useEffect(() => {
    if (!galleryId || isNaN(galleryId)) {
      setLoadingGallery(false);
      setLoadError('Невалиден идентификатор на галерия');
      return;
    }

    const load = async () => {
      try {
        setLoadingGallery(true);
        setLoadError(null);
        const gallery = await getGallery(galleryId);
        reset({ title: gallery.title, description: gallery.description, status: gallery.status });
        setImages(gallery.images);
        setGalleryStatus(gallery.status);
      } catch (err) {
        const msg = err instanceof GalleryError ? err.message : 'Грешка при зареждане на галерията';
        setLoadError(msg);
      } finally {
        setLoadingGallery(false);
      }
    };

    load();
  }, [galleryId, reset]);

  const handleDeleteImage = useCallback(async (imageId: number) => {
    try {
      await deleteImage(galleryId, imageId);
      setImages(prev => prev.filter(img => img.id !== imageId));
    } catch {
      toast.error('Грешка при изтриване на снимката');
    }
  }, [deleteImage, galleryId]);

  const handleReorderImages = useCallback(async (reordered: GalleryImage[]) => {
    setImages(reordered);
    try {
      await reorderImages(galleryId, reordered);
    } catch {
      // Reorder failed silently — images state already updated
    }
  }, [reorderImages, galleryId]);

  const handleImagesUploaded = useCallback((newImgs: GalleryImage[]) => {
    setImages(prev => [...prev, ...newImgs]);
  }, []);

  const handleSaveDraft = useCallback(async (data: GalleryFormData) => {
    try {
      setIsSaving(true);
      await updateGallery(galleryId, { title: data.title, description: data.description, status: 'DRAFT' });
      setGalleryStatus('DRAFT');
      toast.success(t.galleryForm.success.saved);
    } catch {
      toast.error(t.galleryForm.errors.saveFailed);
    } finally {
      setIsSaving(false);
    }
  }, [galleryId, t.galleryForm.success.saved, t.galleryForm.errors.saveFailed]);

  const handlePublish = useCallback(async (data: GalleryFormData) => {
    // AC5: must have at least 1 image
    if (images.length === 0) {
      toast.error(t.galleryForm.noImagesError);
      return;
    }
    try {
      setIsPublishing(true);
      await updateGallery(galleryId, { title: data.title, description: data.description, status: 'PUBLISHED' });
      toast.success(t.galleryForm.success.published);
      navigate('/admin/galleries');
    } catch {
      toast.error(t.galleryForm.errors.publishFailed);
    } finally {
      setIsPublishing(false);
    }
  }, [galleryId, images.length, navigate, t.galleryForm]);

  const handleUpdate = useCallback(async (data: GalleryFormData) => {
    try {
      setIsUpdating(true);
      await updateGallery(galleryId, { title: data.title, description: data.description });
      toast.success(t.galleryForm.success.updated);
    } catch {
      toast.error(t.galleryForm.errors.updateFailed);
    } finally {
      setIsUpdating(false);
    }
  }, [galleryId, t.galleryForm.success.updated, t.galleryForm.errors.updateFailed]);

  const isBusy = isSaving || isPublishing || isUpdating;

  const breadcrumbItems = [
    { label: t.galleryForm.breadcrumb.gallery, href: '/admin/galleries' },
    { label: t.galleryForm.breadcrumb.edit },
  ];

  const actionButtons = galleryStatus === 'DRAFT' ? (
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={handleSubmit(handleSaveDraft)}
        disabled={isBusy}
      >
        {isSaving ? t.common.loading : t.galleryForm.saveDraft}
      </Button>
      <Button
        type="button"
        onClick={handleSubmit(handlePublish)}
        disabled={isBusy}
      >
        {isPublishing ? t.common.loading : t.galleryForm.publish}
      </Button>
    </>
  ) : (
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={handleSubmit(handleUpdate)}
        disabled={isBusy}
      >
        {isUpdating ? t.common.loading : t.galleryForm.update}
      </Button>
      <Button
        type="button"
        onClick={handleSubmit(handlePublish)}
        disabled={isBusy}
      >
        {isPublishing ? t.common.loading : t.galleryForm.publish}
      </Button>
    </>
  );

  if (loadingGallery) {
    return (
      <ContentFormShell breadcrumbItems={breadcrumbItems} actionButtons={null}>
        <div className="max-w-2xl space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-48 w-full" />
        </div>
      </ContentFormShell>
    );
  }

  if (loadError) {
    return (
      <ContentFormShell breadcrumbItems={breadcrumbItems} actionButtons={null}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
          <p className="text-red-800 font-medium">{loadError}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/galleries')}
            className="mt-3"
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
            <Label htmlFor="title">{t.galleryForm.titleLabel}</Label>
            <Input
              id="title"
              placeholder={t.galleryForm.titlePlaceholder}
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

          {/* Description Field (optional) */}
          <div className="space-y-2">
            <Label htmlFor="description">{t.galleryForm.descriptionLabel}</Label>
            <Textarea
              id="description"
              placeholder=""
              {...register('description')}
              rows={4}
            />
          </div>
        </form>

        {/* Existing Images Grid */}
        {images.length > 0 && (
          <div className="mt-6">
            <GalleryImageGrid
              images={images}
              onDelete={handleDeleteImage}
              onReorder={handleReorderImages}
            />
          </div>
        )}

        {/* Upload Zone for new images */}
        <div className="mt-6">
          <GalleryImageUploadZone
            galleryId={galleryId}
            onImagesUploaded={handleImagesUploaded}
          />
        </div>
      </div>
    </ContentFormShell>
  );
};

export default GalleryEdit;
