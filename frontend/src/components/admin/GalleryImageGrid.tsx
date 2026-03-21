import React, { useState, useCallback, useRef } from 'react';
import { X } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable,
    arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GalleryImage } from '@/types/gallery';
import { cn } from '@/lib/utils';

interface GalleryImageGridProps {
    images: GalleryImage[];
    onDelete: (imageId: number) => void;
    onReorder: (images: GalleryImage[]) => void;
}

interface SortableImageProps {
    image: GalleryImage;
    onDelete: (imageId: number) => void;
}

const SortableImage: React.FC<SortableImageProps> = ({ image, onDelete }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: image.id,
    });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : undefined,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
            {...attributes}
        >
            {/* Drag handle area */}
            <div
                {...listeners}
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
                aria-label="Плъзнете за преподреждане"
            />

            {/* Image */}
            <img
                src={image.thumbnailUrl ?? image.imageUrl}
                alt={image.altText ?? `Снимка ${image.displayOrder + 1}`}
                className="h-full w-full object-cover"
                draggable={false}
            />

            {/* Hover delete overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(image.id);
                    }}
                    aria-label="Изтрий снимката"
                    className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full',
                        'bg-destructive text-destructive-foreground',
                        'hover:bg-destructive/90 transition-colors',
                        'text-lg font-bold leading-none'
                    )}
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export const GalleryImageGrid: React.FC<GalleryImageGridProps> = ({
    images,
    onDelete,
    onReorder,
}) => {
    const [localImages, setLocalImages] = useState<GalleryImage[]>(images);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Sync when parent images prop changes
    React.useEffect(() => {
        setLocalImages(images);
    }, [images]);

    // Clear any pending debounce on unmount to prevent stale callbacks
    React.useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            if (!over || active.id === over.id) return;

            setLocalImages((prev) => {
                const oldIndex = prev.findIndex((i) => i.id === active.id);
                const newIndex = prev.findIndex((i) => i.id === over.id);
                const reordered = arrayMove(prev, oldIndex, newIndex).map((img, idx) => ({
                    ...img,
                    displayOrder: idx,
                }));

                // Debounce the reorder API call (500ms)
                if (debounceRef.current) clearTimeout(debounceRef.current);
                debounceRef.current = setTimeout(() => {
                    onReorder(reordered);
                }, 500);

                return reordered;
            });
        },
        [onReorder]
    );

    if (localImages.length === 0) return null;

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
                items={localImages.map((i) => i.id)}
                strategy={rectSortingStrategy}
            >
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {localImages.map((image) => (
                        <SortableImage key={image.id} image={image} onDelete={onDelete} />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
};
