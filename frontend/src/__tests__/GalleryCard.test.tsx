import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GalleryCard } from '@/components/public/GalleryCard';
import type { PublicGallery } from '@/types/gallery';

vi.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    publicGallery: {
      imageCount: ' снимки',
    },
  }),
}));

const mockGallery: PublicGallery = {
  id: 1,
  title: 'Пролетна фотосесия',
  description: 'Снимки от пролетното тържество',
  coverImageUrl: 'https://example.com/cover.jpg',
  imageCount: 12,
  publishedAt: '2026-03-01T10:00:00Z',
  createdAt: '2026-03-01T10:00:00Z',
  updatedAt: '2026-03-01T10:00:00Z',
};

describe('GalleryCard', () => {
  it('renders cover image when coverImageUrl is present', () => {
    render(<GalleryCard gallery={mockGallery} onClick={() => {}} />);

    const img = screen.getByRole('img', { name: 'Пролетна фотосесия' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/cover.jpg');
  });

  it('renders placeholder icon when no coverImageUrl', () => {
    const galleryWithoutCover: PublicGallery = { ...mockGallery, coverImageUrl: null };

    render(<GalleryCard gallery={galleryWithoutCover} onClick={() => {}} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders title and image count', () => {
    render(<GalleryCard gallery={mockGallery} onClick={() => {}} />);

    expect(screen.getByText('Пролетна фотосесия')).toBeInTheDocument();
    expect(screen.getByText('12 снимки')).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    const handleClick = vi.fn();

    render(<GalleryCard gallery={mockGallery} onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button', { name: /пролетна/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
