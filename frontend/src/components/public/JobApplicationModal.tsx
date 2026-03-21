import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/lib/api';
import { useTranslation } from '@/lib/i18n';
import { applicationFormSchema, type ApplicationFormData } from '@/schemas/application-form.schema';
import { CvUploadField } from './CvUploadField';

interface JobApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: { id: number; title: string } | null;
}

export function JobApplicationModal({ isOpen, onClose, job }: JobApplicationModalProps) {
  const t = useTranslation();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    control,
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationFormSchema),
  });

  // Reset form and success state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      reset();
      setIsSuccess(false);
    }
  }, [isOpen, reset]);

  // Unified keyboard handler: Escape closes modal, Tab implements focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusableSelectors =
          'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(focusableSelectors),
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Move focus to first focusable element on open
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      const focusableSelectors =
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled])';
      dialogRef.current.querySelector<HTMLElement>(focusableSelectors)?.focus();
    }
  }, [isOpen]);

  const onSubmit = async (data: ApplicationFormData) => {
    if (!job) return;
    clearErrors('root');

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    if (data.coverLetter) formData.append('coverLetter', data.coverLetter);
    formData.append('jobId', String(job.id));
    formData.append('cv', data.cv);

    try {
      await api.post('/api/v1/public/applications', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      reset();
      setIsSuccess(true);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 429) {
          setError('root', { message: t.applicationForm.rateLimitError });
          return;
        }
      }
      setError('root', { message: t.applicationForm.genericError });
    }
  };

  if (!isOpen || !job) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="application-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Modal panel */}
      <div
        ref={dialogRef}
        className="relative z-10 w-full max-w-lg mx-4 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 id="application-modal-title" className="text-xl font-semibold text-gray-900">
                {t.applicationForm.title}
              </h2>
              <p className="text-primary font-medium mt-1">{job.title}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={t.applicationForm.closeButton}
            >
              ✕
            </button>
          </div>

          {isSuccess ? (
            <div className="text-center py-4">
              <p className="text-green-600 text-base font-medium mb-2">
                {t.applicationForm.successMessage}
              </p>
              <p className="text-gray-500 text-sm mb-6">
                {t.applicationForm.successSubtext}
              </p>
              <Link
                to="/jobs"
                onClick={onClose}
                className="inline-block bg-primary text-white font-medium py-2.5 px-6 rounded hover:bg-primary/90 transition-colors"
              >
                {t.applicationForm.backToJobsLink}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Name */}
              <div className="mb-4">
                <label htmlFor="app-name" className="block text-sm font-medium text-gray-700 mb-1">
                  {t.applicationForm.nameLabel} *
                </label>
                <input
                  id="app-name"
                  type="text"
                  placeholder={t.applicationForm.namePlaceholder}
                  {...register('name')}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={isSubmitting}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div className="mb-4">
                <label htmlFor="app-email" className="block text-sm font-medium text-gray-700 mb-1">
                  {t.applicationForm.emailLabel} *
                </label>
                <input
                  id="app-email"
                  type="email"
                  placeholder={t.applicationForm.emailPlaceholder}
                  {...register('email')}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={isSubmitting}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              {/* Phone */}
              <div className="mb-4">
                <label htmlFor="app-phone" className="block text-sm font-medium text-gray-700 mb-1">
                  {t.applicationForm.phoneLabel} *
                </label>
                <input
                  id="app-phone"
                  type="tel"
                  placeholder={t.applicationForm.phonePlaceholder}
                  {...register('phone')}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={isSubmitting}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>

              {/* Cover Letter */}
              <div className="mb-4">
                <label htmlFor="app-cover" className="block text-sm font-medium text-gray-700 mb-1">
                  {t.applicationForm.coverLetterLabel}
                </label>
                <textarea
                  id="app-cover"
                  rows={4}
                  placeholder={t.applicationForm.coverLetterPlaceholder}
                  {...register('coverLetter')}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  disabled={isSubmitting}
                />
              </div>

              {/* CV Upload — enhanced drag-and-drop (Story 6.6) */}
              <div className="mb-6">
                <label htmlFor="app-cv" className="block text-sm font-medium text-gray-700 mb-1">
                  {t.applicationForm.cvLabel} *
                </label>
                <CvUploadField control={control} isSubmitting={isSubmitting} />
              </div>

              {/* Root error (API errors) */}
              {errors.root && (
                <p className="text-red-600 text-sm mb-4 bg-red-50 border border-red-200 rounded p-3">
                  {errors.root.message}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white font-medium py-2.5 px-4 rounded hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t.applicationForm.submittingButton}
                  </>
                ) : (
                  t.applicationForm.submitButton
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
