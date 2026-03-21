import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GalleryImage } from '@/types/gallery';
import useGalleryImages from '@/hooks/useGalleryImages';

interface UploadItem {
    id: string;
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'done' | 'error';
    error: string | null;
    result: GalleryImage | null;
}

interface GalleryImageUploadZoneProps {
    galleryId: number;
    onImagesUploaded: (images: GalleryImage[]) => void;
}

const VALID_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_CONCURRENT = 3;

const validateFile = (file: File): string | null => {
    if (!VALID_TYPES.includes(file.type)) {
        return 'Невалиден тип файл. Позволени са: JPEG, PNG, GIF, WebP';
    }
    if (file.size > MAX_SIZE) {
        return 'Файлът е твърде голям. Максимален размер: 10MB';
    }
    return null;
};

const uploadWithConcurrency = async (
    items: UploadItem[],
    uploadFn: (item: UploadItem) => Promise<void>,
    maxConcurrent = MAX_CONCURRENT
) => {
    const queue = [...items];
    const workers = Array.from({ length: Math.min(maxConcurrent, items.length) }, async () => {
        while (queue.length > 0) {
            const item = queue.shift()!;
            await uploadFn(item);
        }
    });
    await Promise.all(workers);
};

export const GalleryImageUploadZone: React.FC<GalleryImageUploadZoneProps> = ({
    galleryId,
    onImagesUploaded,
}) => {
    const [items, setItems] = useState<UploadItem[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { uploadImage } = useGalleryImages();

    const updateItem = useCallback((id: string, updates: Partial<UploadItem>) => {
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
    }, []);

    const uploadItem = useCallback(
        async (item: UploadItem) => {
            updateItem(item.id, { status: 'uploading', progress: 0 });

            try {
                const result = await uploadImage(galleryId, item.file, (pct) => {
                    updateItem(item.id, { progress: pct });
                });
                updateItem(item.id, { status: 'done', progress: 100, result });
                onImagesUploaded([result]);
            } catch (err: any) {
                const msg =
                    err?.response?.data?.message || 'Грешка при качване на снимката';
                updateItem(item.id, { status: 'error', error: msg });
            }
        },
        [galleryId, onImagesUploaded, updateItem, uploadImage]
    );

    const processFiles = useCallback(
        async (files: File[]) => {
            const newItems: UploadItem[] = files.map((file) => {
                const validationError = validateFile(file);
                return {
                    id: crypto.randomUUID(),
                    file,
                    progress: 0,
                    status: validationError ? 'error' : 'pending',
                    error: validationError,
                    result: null,
                };
            });

            setItems((prev) => [...prev, ...newItems]);

            const validItems = newItems.filter((i) => i.status === 'pending');
            if (validItems.length > 0) {
                await uploadWithConcurrency(validItems, uploadItem);
            }
        },
        [uploadItem]
    );

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) processFiles(files);
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
        const files = Array.from(e.target.files ?? []);
        if (files.length > 0) processFiles(files);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
    };

    return (
        <div className="space-y-4">
            {/* Drop zone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        fileInputRef.current?.click();
                    }
                }}
                aria-label="Зона за качване на снимки"
                className={cn(
                    'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                    'hover:border-primary hover:bg-primary/5',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    isDragOver && 'border-primary bg-primary/10'
                )}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    aria-label="Избор на снимки за качване"
                />
                <div className="flex flex-col items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-4">
                        <Upload className="h-8 w-8 text-primary" aria-hidden="true" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium">
                            Плъзнете снимки тук или кликнете за избор
                        </p>
                        <p className="text-xs text-muted-foreground">
                            JPEG, PNG, GIF, WebP до 10MB
                        </p>
                    </div>
                </div>
            </div>

            {/* Upload list */}
            {items.length > 0 && (
                <div className="space-y-2">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center gap-3 rounded-lg border p-3 text-sm"
                        >
                            {/* Thumbnail or status icon */}
                            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded">
                                {item.result?.thumbnailUrl ? (
                                    <img
                                        src={item.result.thumbnailUrl}
                                        alt={item.file.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : item.status === 'uploading' ? (
                                    <div className="flex h-full w-full items-center justify-center bg-muted">
                                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                    </div>
                                ) : item.status === 'error' ? (
                                    <div className="flex h-full w-full items-center justify-center bg-destructive/10">
                                        <AlertCircle className="h-5 w-5 text-destructive" />
                                    </div>
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-muted">
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    </div>
                                )}
                            </div>

                            {/* File info + progress */}
                            <div className="flex-1 min-w-0">
                                <p className="truncate font-medium">{item.file.name}</p>
                                {item.status === 'uploading' && (
                                    <div className="mt-1">
                                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full bg-primary transition-all duration-200"
                                                style={{ width: `${item.progress}%` }}
                                            />
                                        </div>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            {item.progress}%
                                        </p>
                                    </div>
                                )}
                                {item.status === 'error' && item.error && (
                                    <p className="mt-0.5 text-xs text-destructive">{item.error}</p>
                                )}
                                {item.status === 'done' && (
                                    <p className="mt-0.5 text-xs text-green-600">Качено успешно</p>
                                )}
                            </div>

                            {/* Remove button */}
                            {(item.status === 'error' || item.status === 'done') && (
                                <button
                                    type="button"
                                    onClick={() => removeItem(item.id)}
                                    aria-label={`Премахни ${item.file.name}`}
                                    className="flex-shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
