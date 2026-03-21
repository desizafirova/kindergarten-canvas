import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { ContentFormShell } from '@/components/admin/ContentFormShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { galleryFormSchema, type GalleryFormData } from '@/schemas/gallery-form.schema';
import { toast } from 'sonner';
import { createGallery } from '@/hooks/useGalleries';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/**
 * GalleryCreate - Create new gallery page for the admin panel.
 *
 * Features:
 * - React Hook Form with Zod validation
 * - Title (required) and Description (optional) fields
 * - Create-then-redirect flow: POSTs gallery, then navigates to edit page for image upload
 * - "Запази чернова" → creates DRAFT, redirects to edit
 * - "Публикувай" → creates PUBLISHED, redirects to edit
 * - AC5 image validation (≥1 image) is enforced on the edit page, not here
 */
const GalleryCreate: React.FC = () => {
  const navigate = useNavigate();
  const t = useTranslation();
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const {
    register,
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

  const handleSaveDraft = useCallback(async (data: GalleryFormData) => {
    try {
      setIsSavingDraft(true);
      const gallery = await createGallery({ title: data.title, description: data.description, status: 'DRAFT' });
      toast.success(t.galleryForm.success.saved);
      navigate(`/admin/galleries/${gallery.id}/edit`);
    } catch {
      toast.error(t.galleryForm.errors.saveFailed);
    } finally {
      setIsSavingDraft(false);
    }
  }, [navigate, t.galleryForm.success.saved, t.galleryForm.errors.saveFailed]);

  const handlePublish = useCallback(async (data: GalleryFormData) => {
    try {
      setIsPublishing(true);
      const gallery = await createGallery({ title: data.title, description: data.description, status: 'PUBLISHED' });
      toast.success(t.galleryForm.success.published);
      navigate(`/admin/galleries/${gallery.id}/edit`);
    } catch {
      toast.error(t.galleryForm.errors.publishFailed);
    } finally {
      setIsPublishing(false);
    }
  }, [navigate, t.galleryForm.success.published, t.galleryForm.errors.publishFailed]);

  const breadcrumbItems = [
    { label: t.galleryForm.breadcrumb.gallery, href: '/admin/galleries' },
    { label: t.galleryForm.breadcrumb.create },
  ];

  const actionButtons = (
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={handleSubmit(handleSaveDraft)}
        disabled={isSavingDraft || isPublishing}
      >
        {isSavingDraft ? t.common.loading : t.galleryForm.saveDraft}
      </Button>
      <Button
        type="button"
        onClick={handleSubmit(handlePublish)}
        disabled={isPublishing || isSavingDraft}
      >
        {isPublishing ? t.common.loading : t.galleryForm.publish}
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
      </div>
    </ContentFormShell>
  );
};

export default GalleryCreate;
