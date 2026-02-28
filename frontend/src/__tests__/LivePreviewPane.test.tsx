/**
 * Unit tests for LivePreviewPane component
 * Tests connection status display, preview rendering, and accessibility
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LivePreviewPane } from '@/components/admin/LivePreviewPane';

// Mock useTranslation
vi.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    previewPane: {
      title: 'Преглед на живо',
      unavailable: 'Прегледът не е наличен',
      connecting: 'Свързване...',
      connected: 'Свързан',
      disconnected: 'Връзката е прекъсната',
    },
  }),
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  format: () => '27.02.2026',
}));

vi.mock('date-fns/locale', () => ({
  bg: {},
}));

describe('LivePreviewPane', () => {
  it('renders with connection status badge', () => {
    render(
      <LivePreviewPane
        connectionStatus="connected"
        previewHtml="<p>Test content</p>"
        isPreviewAvailable={true}
        title="Test News"
        imageUrl={null}
      />
    );

    expect(screen.getByText('Свързан')).toBeInTheDocument();
    expect(screen.getByText('Преглед на живо')).toBeInTheDocument();
  });

  it('displays preview HTML with public site styling', () => {
    render(
      <LivePreviewPane
        connectionStatus="connected"
        previewHtml="<p>Test content</p>"
        isPreviewAvailable={true}
        title="Test Title"
        imageUrl={null}
      />
    );

    const titleElement = screen.getByText('Test Title');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveClass('text-2xl', 'font-bold', 'text-gray-900');

    // Check if preview HTML is rendered
    const previewContainer = screen.getByRole('region');
    expect(previewContainer.innerHTML).toContain('<p>Test content</p>');
  });

  it('shows unavailable message when isPreviewAvailable is false', () => {
    render(
      <LivePreviewPane
        connectionStatus="error"
        previewHtml=""
        isPreviewAvailable={false}
        title=""
        imageUrl={null}
      />
    );

    expect(screen.getByText('Прегледът не е наличен')).toBeInTheDocument();
  });

  it('connection status badge colors match status - connecting (yellow)', () => {
    const { container } = render(
      <LivePreviewPane
        connectionStatus="connecting"
        previewHtml=""
        isPreviewAvailable={false}
        title=""
        imageUrl={null}
      />
    );

    const badge = screen.getByText('Свързване...');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  it('connection status badge colors match status - connected (green)', () => {
    render(
      <LivePreviewPane
        connectionStatus="connected"
        previewHtml=""
        isPreviewAvailable={true}
        title=""
        imageUrl={null}
      />
    );

    const badge = screen.getByText('Свързан');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('connection status badge colors match status - disconnected (gray)', () => {
    render(
      <LivePreviewPane
        connectionStatus="disconnected"
        previewHtml=""
        isPreviewAvailable={false}
        title=""
        imageUrl={null}
      />
    );

    const badge = screen.getByText('Връзката е прекъсната');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
  });

  it('connection status badge colors match status - error (red)', () => {
    render(
      <LivePreviewPane
        connectionStatus="error"
        previewHtml=""
        isPreviewAvailable={false}
        title=""
        imageUrl={null}
      />
    );

    const badge = screen.getByText('Връзката е прекъсната');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('ARIA live region announces preview updates to screen readers', () => {
    render(
      <LivePreviewPane
        connectionStatus="connected"
        previewHtml="<p>Content</p>"
        isPreviewAvailable={true}
        title="Title"
        imageUrl={null}
      />
    );

    const liveRegion = screen.getByRole('region');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    expect(liveRegion).toHaveAttribute('aria-label', 'Преглед на живо');
  });

  it('renders image when imageUrl is provided', () => {
    render(
      <LivePreviewPane
        connectionStatus="connected"
        previewHtml="<p>Content</p>"
        isPreviewAvailable={true}
        title="News with image"
        imageUrl="https://example.com/image.jpg"
      />
    );

    const image = screen.getByAltText('News with image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    expect(image).toHaveClass('aspect-video', 'object-cover', 'rounded-lg', 'w-full');
  });

  it('does not render image when imageUrl is null', () => {
    render(
      <LivePreviewPane
        connectionStatus="connected"
        previewHtml="<p>Content</p>"
        isPreviewAvailable={true}
        title="News without image"
        imageUrl={null}
      />
    );

    const images = screen.queryAllByRole('img');
    expect(images).toHaveLength(0);
  });

  it('displays formatted date with Bulgarian locale (dd.MM.yyyy)', () => {
    render(
      <LivePreviewPane
        connectionStatus="connected"
        previewHtml="<p>Content</p>"
        isPreviewAvailable={true}
        title="Title"
        imageUrl={null}
      />
    );

    // Mocked date returns '27.02.2026'
    expect(screen.getByText('27.02.2026')).toBeInTheDocument();
  });
});
