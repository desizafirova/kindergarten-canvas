import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GalleryImageUploadZone } from '@/components/admin/GalleryImageUploadZone';

vi.mock('@/hooks/useGalleryImages', () => ({
    default: () => ({
        uploadImage: vi.fn().mockResolvedValue({
            id: 1,
            imageUrl: 'https://res.cloudinary.com/test/image/upload/v1/test.jpg',
            thumbnailUrl: 'https://res.cloudinary.com/test/image/upload/w_150,h_150,c_fill/v1/test.jpg',
            altText: null,
            displayOrder: 0,
            createdAt: '2026-03-15T00:00:00.000Z',
        }),
        deleteImage: vi.fn(),
        reorderImages: vi.fn(),
    }),
}));

const createFile = (name: string, type: string, size = 1024) => {
    const file = new File(['x'.repeat(size)], name, { type });
    return file;
};

describe('GalleryImageUploadZone (AC1, AC2, AC4)', () => {
    const mockOnImagesUploaded = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders drop zone with correct Bulgarian text (AC1)', () => {
        render(<GalleryImageUploadZone galleryId={1} onImagesUploaded={mockOnImagesUploaded} />);
        expect(screen.getByText('Плъзнете снимки тук или кликнете за избор')).toBeInTheDocument();
        expect(screen.getByText('JPEG, PNG, GIF, WebP до 10MB')).toBeInTheDocument();
    });

    it('renders file input with multiple attribute (AC1)', () => {
        render(<GalleryImageUploadZone galleryId={1} onImagesUploaded={mockOnImagesUploaded} />);
        const input = screen.getByLabelText('Избор на снимки за качване');
        expect(input).toHaveAttribute('multiple');
    });

    it('rejects files with wrong type and shows Bulgarian error message (AC4)', async () => {
        render(<GalleryImageUploadZone galleryId={1} onImagesUploaded={mockOnImagesUploaded} />);

        const input = screen.getByLabelText('Избор на снимки за качване');
        const badFile = createFile('doc.pdf', 'application/pdf');

        fireEvent.change(input, { target: { files: [badFile] } });

        await waitFor(() => {
            expect(
                screen.getByText('Невалиден тип файл. Позволени са: JPEG, PNG, GIF, WebP')
            ).toBeInTheDocument();
        });
    });

    it('rejects files larger than 10MB with Bulgarian error message (AC4)', async () => {
        render(<GalleryImageUploadZone galleryId={1} onImagesUploaded={mockOnImagesUploaded} />);

        const input = screen.getByLabelText('Избор на снимки за качване');
        const bigFile = createFile('big.jpg', 'image/jpeg', 11 * 1024 * 1024);

        fireEvent.change(input, { target: { files: [bigFile] } });

        await waitFor(() => {
            expect(
                screen.getByText('Файлът е твърде голям. Максимален размер: 10MB')
            ).toBeInTheDocument();
        });
    });

    it('accepts valid JPEG file and calls onImagesUploaded after upload (AC2)', async () => {
        render(<GalleryImageUploadZone galleryId={1} onImagesUploaded={mockOnImagesUploaded} />);

        const input = screen.getByLabelText('Избор на снимки за качване');
        const validFile = createFile('photo.jpg', 'image/jpeg');

        fireEvent.change(input, { target: { files: [validFile] } });

        await waitFor(() => {
            expect(mockOnImagesUploaded).toHaveBeenCalledTimes(1);
        });
    });

    it('shows error items with remove button (AC4)', async () => {
        render(<GalleryImageUploadZone galleryId={1} onImagesUploaded={mockOnImagesUploaded} />);

        const input = screen.getByLabelText('Избор на снимки за качване');
        const badFile = createFile('doc.pdf', 'application/pdf');

        fireEvent.change(input, { target: { files: [badFile] } });

        await waitFor(() => {
            expect(screen.getByLabelText(/Премахни doc.pdf/)).toBeInTheDocument();
        });
    });

    it('supports drag-and-drop of multiple files (AC1)', async () => {
        render(<GalleryImageUploadZone galleryId={1} onImagesUploaded={mockOnImagesUploaded} />);

        const dropZone = screen.getByRole('button', { name: /Зона за качване/ });
        const file1 = createFile('a.jpg', 'image/jpeg');
        const file2 = createFile('b.png', 'image/png');

        fireEvent.drop(dropZone, {
            dataTransfer: { files: [file1, file2] },
        });

        await waitFor(() => {
            expect(mockOnImagesUploaded).toHaveBeenCalledTimes(2);
        });
    });
});
