import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GalleryImageGrid } from '@/components/admin/GalleryImageGrid';
import { GalleryImage } from '@/types/gallery';

// Mock @dnd-kit to avoid complex DnD setup in tests
vi.mock('@dnd-kit/core', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@dnd-kit/core')>();
    return {
        ...actual,
        DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    };
});

vi.mock('@dnd-kit/sortable', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@dnd-kit/sortable')>();
    return {
        ...actual,
        SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
        useSortable: () => ({
            attributes: {},
            listeners: {},
            setNodeRef: () => {},
            transform: null,
            transition: undefined,
            isDragging: false,
        }),
    };
});

const makeImage = (id: number, order: number): GalleryImage => ({
    id,
    imageUrl: `https://example.com/img${id}.jpg`,
    thumbnailUrl: `https://example.com/thumb${id}.jpg`,
    altText: null,
    displayOrder: order,
    createdAt: '2026-03-15T00:00:00.000Z',
});

describe('GalleryImageGrid (AC6)', () => {
    const mockOnDelete = vi.fn();
    const mockOnReorder = vi.fn();
    const images: GalleryImage[] = [makeImage(1, 0), makeImage(2, 1), makeImage(3, 2)];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders image thumbnails for all provided images', () => {
        render(
            <GalleryImageGrid
                images={images}
                onDelete={mockOnDelete}
                onReorder={mockOnReorder}
            />
        );
        const imgs = screen.getAllByRole('img');
        expect(imgs.length).toBe(3);
    });

    it('renders nothing when images array is empty', () => {
        const { container } = render(
            <GalleryImageGrid
                images={[]}
                onDelete={mockOnDelete}
                onReorder={mockOnReorder}
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it('calls onDelete with imageId when delete button is clicked (AC6)', () => {
        render(
            <GalleryImageGrid
                images={images}
                onDelete={mockOnDelete}
                onReorder={mockOnReorder}
            />
        );

        const deleteButtons = screen.getAllByLabelText('Изтрий снимката');
        fireEvent.click(deleteButtons[0]);

        expect(mockOnDelete).toHaveBeenCalledWith(1);
    });

    it('renders delete button for each image thumbnail (AC6)', () => {
        render(
            <GalleryImageGrid
                images={images}
                onDelete={mockOnDelete}
                onReorder={mockOnReorder}
            />
        );

        const deleteButtons = screen.getAllByLabelText('Изтрий снимката');
        expect(deleteButtons.length).toBe(3);
    });
});
