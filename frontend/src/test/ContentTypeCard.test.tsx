/**
 * ContentTypeCard Component Tests
 * Tests for dashboard content type cards with Bulgarian translations
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContentTypeCard } from '@/components/dashboard/ContentTypeCard';

describe('ContentTypeCard', () => {
  const defaultProps = {
    icon: '📰',
    title: 'Новини',
    draftCount: 0,
    publishedCount: 0,
    onCardClick: vi.fn(),
    onCreateClick: vi.fn(),
  };

  it('renders icon, title, counts, and create button', () => {
    render(
      <ContentTypeCard
        {...defaultProps}
        draftCount={2}
        publishedCount={5}
      />
    );

    // Check icon renders
    expect(screen.getByText('📰')).toBeInTheDocument();

    // Check title renders
    expect(screen.getByText('Новини')).toBeInTheDocument();

    // Check counts render in single-line format per AC1: "X чернови, Y публикувани"
    expect(screen.getByTestId('counts-text')).toHaveTextContent('2 чернови, 5 публикувани');

    // Check create button renders
    expect(screen.getByText('Създай')).toBeInTheDocument();
  });

  it('calls onCardClick when card body is clicked', () => {
    const onCardClick = vi.fn();
    render(
      <ContentTypeCard
        {...defaultProps}
        onCardClick={onCardClick}
      />
    );

    // Click on the card title
    fireEvent.click(screen.getByText('Новини'));

    expect(onCardClick).toHaveBeenCalledTimes(1);
  });

  it('calls onCreateClick when create button is clicked', () => {
    const onCreateClick = vi.fn();
    render(
      <ContentTypeCard
        {...defaultProps}
        onCreateClick={onCreateClick}
      />
    );

    // Click on the create button
    fireEvent.click(screen.getByTestId('create-button'));

    expect(onCreateClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onCardClick when create button is clicked (event propagation stopped)', () => {
    const onCardClick = vi.fn();
    const onCreateClick = vi.fn();

    render(
      <ContentTypeCard
        {...defaultProps}
        onCardClick={onCardClick}
        onCreateClick={onCreateClick}
      />
    );

    // Click on the create button
    fireEvent.click(screen.getByTestId('create-button'));

    // onCreateClick should be called, but onCardClick should NOT
    expect(onCreateClick).toHaveBeenCalledTimes(1);
    expect(onCardClick).not.toHaveBeenCalled();
  });

  it('renders zero counts correctly', () => {
    render(<ContentTypeCard {...defaultProps} />);

    // Check zero counts render in correct format
    expect(screen.getByTestId('counts-text')).toHaveTextContent('0 чернови, 0 публикувани');
  });

  it('has cursor-pointer class on clickable area', () => {
    const { container } = render(<ContentTypeCard {...defaultProps} />);

    // Card should have cursor-pointer for visual feedback
    const cardElement = container.querySelector('[class*="cursor-pointer"]');
    expect(cardElement).toBeInTheDocument();
  });

  it('has hover effects on card', () => {
    const { container } = render(<ContentTypeCard {...defaultProps} />);

    // Card should have hover effect class
    const cardWithHover = container.querySelector('[class*="hover"]');
    expect(cardWithHover).toBeInTheDocument();
  });

  it('has accessibility attributes for screen readers', () => {
    render(<ContentTypeCard {...defaultProps} draftCount={3} publishedCount={7} />);

    // Card should have role="button" and aria-label
    const card = screen.getByRole('button', { name: /Новини - 3 чернови, 7 публикувани/i });
    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute('tabindex', '0');
  });

  it('calls onCardClick when Enter key is pressed', () => {
    const onCardClick = vi.fn();
    render(
      <ContentTypeCard
        {...defaultProps}
        onCardClick={onCardClick}
      />
    );

    // Get card by data-testid to avoid conflict with button inside
    const card = screen.getByTestId('content-card-новини');
    fireEvent.keyDown(card, { key: 'Enter' });

    expect(onCardClick).toHaveBeenCalledTimes(1);
  });

  it('calls onCardClick when Space key is pressed', () => {
    const onCardClick = vi.fn();
    render(
      <ContentTypeCard
        {...defaultProps}
        onCardClick={onCardClick}
      />
    );

    // Get card by data-testid to avoid conflict with button inside
    const card = screen.getByTestId('content-card-новини');
    fireEvent.keyDown(card, { key: ' ' });

    expect(onCardClick).toHaveBeenCalledTimes(1);
  });
});
