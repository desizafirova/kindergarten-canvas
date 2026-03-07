import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
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

/**
 * TeacherCreate - Create new teacher page for the admin panel.
 *
 * Features:
 * - React Hook Form with Zod validation
 * - Required fields: firstName, lastName, position
 * - Optional fields: bio (rich text), photoUrl (image upload)
 * - Save Draft and Publish buttons
 * - Bulgarian error messages and success toasts
 * - Navigation to list view after successful creation
 */
export const TeacherCreate: React.FC = () => {
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

  const handleBioChange = (html: string) => {
    setValue('bio', html, { shouldValidate: true });
  };

  const handleImageUpload = (url: string) => {
    setValue('photoUrl', url, { shouldValidate: true });
  };

  const handleImageRemove = () => {
    setValue('photoUrl', null, { shouldValidate: true });
  };

  const handleSaveDraft = useCallback(async (data: TeacherFormData) => {
    try {
      setIsSavingDraft(true);
      const payload = {
        ...data,
        status: 'DRAFT',
      };

      await api.post('/api/admin/v1/teachers', payload);

      toast.success(t.teacherForm.success.saved);
      navigate('/admin/teachers');
    } catch (error) {
      console.error('Save draft error:', error);
      toast.error(t.teacherForm.errors.saveFailed);
    } finally {
      setIsSavingDraft(false);
    }
  }, [navigate, t.teacherForm.success.saved, t.teacherForm.errors.saveFailed]);

  const handlePublish = useCallback(async (data: TeacherFormData) => {
    try {
      setIsPublishing(true);
      const payload = {
        ...data,
        status: 'PUBLISHED',
      };

      await api.post('/api/admin/v1/teachers', payload);

      toast.success(t.teacherForm.success.published);
      navigate('/admin/teachers');
    } catch (error) {
      console.error('Publish teacher error:', error);
      toast.error(t.teacherForm.errors.publishFailed);
    } finally {
      setIsPublishing(false);
    }
  }, [navigate, t.teacherForm.success.published, t.teacherForm.errors.publishFailed]);

  const breadcrumbItems = [
    { label: t.teacherForm.breadcrumb.teachers, href: '/admin/teachers' },
    { label: t.teacherForm.breadcrumb.create },
  ];

  const actionButtons = (
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={handleSubmit(handleSaveDraft)}
        disabled={isSavingDraft || isPublishing}
      >
        {isSavingDraft ? t.common.loading : t.teacherForm.saveDraft}
      </Button>
      <Button
        type="button"
        onClick={handleSubmit(handlePublish)}
        disabled={!isValid || isPublishing || isSavingDraft}
      >
        {isPublishing ? t.common.loading : t.teacherForm.publish}
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

export default TeacherCreate;
