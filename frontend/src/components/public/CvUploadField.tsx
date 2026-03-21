import { useRef, useState, DragEvent } from 'react';
import { useController, Control } from 'react-hook-form';
import { useTranslation } from '@/lib/i18n';
import { ApplicationFormData } from '@/schemas/application-form.schema';

interface CvUploadFieldProps {
  control: Control<ApplicationFormData>;
  isSubmitting: boolean;
}

export function CvUploadField({ control, isSubmitting }: CvUploadFieldProps) {
  const t = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { field, fieldState } = useController({
    name: 'cv',
    control,
  });

  const validateAndSetFile = (file: File) => {
    if (file.type !== 'application/pdf') {
      setLocalError(t.applicationForm.cvInvalidType);
      setSelectedFile(null);
      field.onChange(null);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setLocalError(t.applicationForm.cvFileTooLarge);
      setSelectedFile(null);
      field.onChange(null);
      return;
    }
    setLocalError(null);
    setSelectedFile(file);
    field.onChange(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isSubmitting) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (isSubmitting) return;
    const file = e.dataTransfer.files[0];
    if (file) validateAndSetFile(file);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setLocalError(null);
    field.onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  const displayError = localError ?? fieldState.error?.message;

  return (
    <div>
      {/* Hidden file input — id="app-cv" preserves label association */}
      <input
        ref={inputRef}
        id="app-cv"
        type="file"
        accept=".pdf"
        className="sr-only"
        onChange={handleInputChange}
        disabled={isSubmitting}
        tabIndex={-1}
      />

      {selectedFile ? (
        /* Selected file display */
        <div className="flex items-center gap-2 p-3 border border-green-300 bg-green-50 rounded">
          <span className="text-green-600 text-sm font-bold" aria-hidden="true">
            ✓
          </span>
          <span className="text-sm text-gray-700 flex-1 truncate">{selectedFile.name}</span>
          <button
            type="button"
            onClick={handleRemove}
            disabled={isSubmitting}
            className="text-sm text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
          >
            {t.applicationForm.cvRemoveButton}
          </button>
        </div>
      ) : (
        /* Drop zone */
        <div
          role="button"
          tabIndex={isSubmitting ? -1 : 0}
          onClick={() => !isSubmitting && inputRef.current?.click()}
          onKeyDown={handleKeyDown}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={[
            'flex flex-col items-center justify-center p-6 border-2 border-dashed rounded transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50',
            isSubmitting ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
          ].join(' ')}
          aria-label={t.applicationForm.cvDropZoneText}
        >
          <svg
            className="w-8 h-8 text-gray-400 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          <p className="text-sm text-gray-600 text-center">
            {t.applicationForm.cvDropZoneText}
          </p>
          <p className="text-xs text-gray-400 mt-1">{t.applicationForm.cvHelp}</p>
        </div>
      )}

      {displayError && (
        <p className="text-red-500 text-xs mt-1">{displayError}</p>
      )}
    </div>
  );
}
