import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { ContentFormShell } from '@/components/admin/ContentFormShell';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { ImageUploadZone } from '@/components/admin/ImageUploadZone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { teacherFormSchema, type TeacherFormData } from '@/schemas/teacher-form.schema';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

/**
 * TeacherEdit - Edit existing teacher page for the admin panel.
 *
 * Features:
 * - Fetches and pre-populates form with existing teacher data
 * - React Hook Form with Zod validation
 * - Status-aware action buttons (Draft vs Published)
 * - Update functionality via PUT API
 * - Bulgarian error messages and success toasts
 * - Loading and error states
 */
export const TeacherEdit: React.FC = () => {
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
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherFormSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      position: '',
      bio: null,
      photoUrl: null,
      status: 'DRAFT',
    },
  });

  const bio = watch('bio');
  const photoUrl = watch('photoUrl');
  const status = watch('status');

  // Load existing teacher data
  useEffect(() => {
    const loadTeacher = async () => {
      if (!id) {
        setLoadError('Invalid teacher ID');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await api.get(`/api/admin/v1/teachers/${id}`);
        const teacherData = response.data.content;

        reset({
          firstName: teacherData.firstName,
          lastName: teacherData.lastName,
          position: teacherData.position,
          bio: teacherData.bio,
          photoUrl: teacherData.photoUrl,
          status: teacherData.status,
        });
      } catch (error: any) {
        console.error('Load teacher error:', error);
        if (error.response?.status === 404) {
          setLoadError('Учителят не е намерен');
        } else {
          setLoadError(t.teachersList.loadError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadTeacher();
  }, [id, reset, t.teachersList.loadError]);

  const handleBioChange = (html: string) => {
    setValue('bio', html, { shouldValidate: true });
  };

  const handleImageUpload = (url: string) => {
    setValue('photoUrl', url, { shouldValidate: true });
  };

  const handleImageRemove = () => {
    setValue('photoUrl', null, { shouldValidate: true });
  };

  const handleSave = useCallback(async (data: TeacherFormData) => {
    if (!id) return;

    try {
      setIsSaving(true);
      await api.put(`/api/admin/v1/teachers/${id}`, {
        ...data,
        // Preserve current status when saving
        status: data.status,
      });

      toast.success(t.teacherForm.success.saved);
      navigate('/admin/teachers');
    } catch (error) {
      console.error('Save teacher error:', error);
      toast.error(t.teacherForm.errors.saveFailed);
    } finally {
      setIsSaving(false);
    }
  }, [id, navigate, t.teacherForm.success.saved, t.teacherForm.errors.saveFailed]);

  const handlePublish = useCallback(async (data: TeacherFormData) => {
    if (!id) return;

    try {
      setIsPublishing(true);
      await api.put(`/api/admin/v1/teachers/${id}`, {
        ...data,
        status: 'PUBLISHED',
      });

      toast.success(t.teacherForm.success.published);
      navigate('/admin/teachers');
    } catch (error) {
      console.error('Publish teacher error:', error);
      toast.error(t.teacherForm.errors.publishFailed);
    } finally {
      setIsPublishing(false);
    }
  }, [id, navigate, t.teacherForm.success.published, t.teacherForm.errors.publishFailed]);

  const handleUpdate = useCallback(async (data: TeacherFormData) => {
    if (!id) return;

    try {
      setIsUpdating(true);
      await api.put(`/api/admin/v1/teachers/${id}`, {
        ...data,
        status: data.status, // Keep published status
      });

      toast.success(t.teacherForm.success.updated);

      // Reload teacher data to reflect changes
      const response = await api.get(`/api/admin/v1/teachers/${id}`);
      const teacherData = response.data.content;
      reset({
        firstName: teacherData.firstName,
        lastName: teacherData.lastName,
        position: teacherData.position,
        bio: teacherData.bio,
        photoUrl: teacherData.photoUrl,
        status: teacherData.status,
      });
    } catch (error) {
      console.error('Update teacher error:', error);
      toast.error(t.teacherForm.errors.updateFailed);
    } finally {
      setIsUpdating(false);
    }
  }, [id, reset, t.teacherForm.success.updated, t.teacherForm.errors.updateFailed]);

  const breadcrumbItems = [
    { label: t.teacherForm.breadcrumb.teachers, href: '/admin/teachers' },
    { label: t.teacherForm.breadcrumb.edit },
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
            {isSaving ? t.common.loading : t.buttons.save}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit(handlePublish)}
            disabled={!isValid || isSubmitting}
          >
            {isPublishing ? t.common.loading : t.teacherForm.publish}
          </Button>
        </>
      ) : (
        <Button
          type="button"
          onClick={handleSubmit(handleUpdate)}
          disabled={!isValid || isSubmitting}
        >
          {isUpdating ? t.common.loading : t.teacherForm.update}
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
            onClick={() => navigate('/admin/teachers')}
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
          {/* First Name Field */}
          <div className="space-y-2">
            <Label htmlFor="firstName">{t.teacherForm.firstNameLabel}</Label>
            <Input
              id="firstName"
              placeholder={t.teacherForm.firstNamePlaceholder}
              {...register('firstName')}
              className={cn(errors.firstName && 'border-destructive')}
              aria-invalid={!!errors.firstName}
              aria-describedby={errors.firstName ? 'firstName-error' : undefined}
            />
            {errors.firstName && (
              <p
                id="firstName-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Last Name Field */}
          <div className="space-y-2">
            <Label htmlFor="lastName">{t.teacherForm.lastNameLabel}</Label>
            <Input
              id="lastName"
              placeholder={t.teacherForm.lastNamePlaceholder}
              {...register('lastName')}
              className={cn(errors.lastName && 'border-destructive')}
              aria-invalid={!!errors.lastName}
              aria-describedby={errors.lastName ? 'lastName-error' : undefined}
            />
            {errors.lastName && (
              <p
                id="lastName-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {errors.lastName.message}
              </p>
            )}
          </div>

          {/* Position Field */}
          <div className="space-y-2">
            <Label htmlFor="position">{t.teacherForm.positionLabel}</Label>
            <Input
              id="position"
              placeholder={t.teacherForm.positionPlaceholder}
              {...register('position')}
              className={cn(errors.position && 'border-destructive')}
              aria-invalid={!!errors.position}
              aria-describedby={errors.position ? 'position-error' : undefined}
            />
            {errors.position && (
              <p
                id="position-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {errors.position.message}
              </p>
            )}
          </div>

          {/* Bio Field (TipTap Editor) */}
          <div className="space-y-2">
            <div id="bio-label" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {t.teacherForm.bioLabel}
            </div>
            <RichTextEditor
              id="bio"
              value={bio || ''}
              onChange={handleBioChange}
              error={!!errors.bio}
              placeholder={t.teacherForm.bioPlaceholder}
            />
            {errors.bio && (
              <p className="text-sm text-destructive" role="alert">
                {errors.bio.message}
              </p>
            )}
          </div>

          {/* Photo Upload */}
          <ImageUploadZone
            onUpload={handleImageUpload}
            onRemove={handleImageRemove}
            previewUrl={photoUrl}
            label={t.teacherForm.photoLabel}
          />
        </form>
      </div>
    </ContentFormShell>
  );
};

export default TeacherEdit;
