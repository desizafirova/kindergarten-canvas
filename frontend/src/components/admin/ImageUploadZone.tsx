import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import api from '@/lib/api';

interface ImageUploadZoneProps {
  onUpload: (url: string) => void;
  onRemove: () => void;
  previewUrl?: string | null;
  label?: string;
}

export const ImageUploadZone: React.FC<ImageUploadZoneProps> = ({
  onUpload,
  onRemove,
  previewUrl,
  label = 'Изображение',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  const validateFile = (file: File): boolean => {
    if (!validTypes.includes(file.type)) {
      toast.error('Невалиден тип файл. Позволени са: JPEG, PNG, GIF, WebP');
      return false;
    }

    if (file.size > maxSize) {
      toast.error('Файлът е твърде голям. Максимален размер: 10MB');
      return false;
    }

    return true;
  };

  const uploadImage = async (file: File) => {
    if (!validateFile(file)) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      const response = await api.post('/api/admin/v1/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const imageUrl = response.data.content.url;
      onUpload(imageUrl);
      toast.success('Изображението е качено успешно');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Грешка при качване на изображението');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      uploadImage(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleBrowseClick();
    }
  };

  const handleRemove = () => {
    onRemove();
    toast.success('Изображението е премахнато');
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}

      {previewUrl ? (
        /* Preview State */
        <div className="relative group">
          <div className="relative overflow-hidden rounded-lg border border-input">
            <img
              src={previewUrl}
              alt="Преглед на изображението"
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                className="gap-2"
                aria-label="Премахни изображението"
              >
                <X className="h-4 w-4" />
                Премахни
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Upload State */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleBrowseClick}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
          aria-label="Зона за качване на изображение. Кликнете или плъзнете файл тук"
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            'hover:border-primary hover:bg-primary/5',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            isDragOver && 'border-primary bg-primary/10',
            isUploading && 'pointer-events-none opacity-50'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Избор на файл за качване"
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-12 w-12 text-primary animate-spin" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">Качва се...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-full bg-primary/10 p-4">
                <Upload className="h-8 w-8 text-primary" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Плъзнете изображение тук или кликнете за избор
                </p>
                <p className="text-xs text-muted-foreground">
                  JPEG, PNG, GIF, WebP до 10MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
