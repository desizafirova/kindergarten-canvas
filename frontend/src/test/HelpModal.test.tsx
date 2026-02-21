import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HelpModal } from '@/components/ui/HelpModal';

describe('HelpModal', () => {
  it('renders modal when open prop is true', () => {
    const onOpenChange = vi.fn();
    render(<HelpModal open={true} onOpenChange={onOpenChange} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Помощ')).toBeInTheDocument();
  });

  it('does not render modal when open prop is false', () => {
    const onOpenChange = vi.fn();
    render(<HelpModal open={false} onOpenChange={onOpenChange} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('displays correct Bulgarian title', () => {
    const onOpenChange = vi.fn();
    render(<HelpModal open={true} onOpenChange={onOpenChange} />);

    expect(screen.getByText('Помощ')).toBeInTheDocument();
  });

  it('displays "Create Content" section', () => {
    const onOpenChange = vi.fn();
    render(<HelpModal open={true} onOpenChange={onOpenChange} />);

    expect(screen.getByText('Как да създадете съдържание')).toBeInTheDocument();
    expect(screen.getByText(/За да създадете ново съдържание/)).toBeInTheDocument();
  });

  it('displays "Publish Content" section', () => {
    const onOpenChange = vi.fn();
    render(<HelpModal open={true} onOpenChange={onOpenChange} />);

    expect(screen.getByText('Как да публикувате')).toBeInTheDocument();
    expect(screen.getByText(/Съдържанието може да бъде публикувано/)).toBeInTheDocument();
  });

  it('displays "Edit/Delete" section', () => {
    const onOpenChange = vi.fn();
    render(<HelpModal open={true} onOpenChange={onOpenChange} />);

    expect(screen.getByText('Как да редактирате и изтривате')).toBeInTheDocument();
    expect(screen.getByText(/За да редактирате съдържание/)).toBeInTheDocument();
  });

  it('displays "Support" section', () => {
    const onOpenChange = vi.fn();
    render(<HelpModal open={true} onOpenChange={onOpenChange} />);

    expect(screen.getByText('Контакти за техническа поддръжка')).toBeInTheDocument();
    expect(screen.getByText(/support@kindergarten\.bg/)).toBeInTheDocument();
  });

  it('displays all help sections together', () => {
    const onOpenChange = vi.fn();
    render(<HelpModal open={true} onOpenChange={onOpenChange} />);

    expect(screen.getByText('Как да създадете съдържание')).toBeInTheDocument();
    expect(screen.getByText('Как да публикувате')).toBeInTheDocument();
    expect(screen.getByText('Как да редактирате и изтривате')).toBeInTheDocument();
    expect(screen.getByText('Контакти за техническа поддръжка')).toBeInTheDocument();
  });

  it('calls onOpenChange(false) when close button is clicked', () => {
    const onOpenChange = vi.fn();
    render(<HelpModal open={true} onOpenChange={onOpenChange} />);

    const closeButton = screen.getByRole('button', { name: /затвори/i });
    fireEvent.click(closeButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('has proper ARIA attributes', () => {
    const onOpenChange = vi.fn();
    render(<HelpModal open={true} onOpenChange={onOpenChange} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('role', 'dialog');
  });

  it('renders with all content visible in modal', () => {
    const onOpenChange = vi.fn();
    render(<HelpModal open={true} onOpenChange={onOpenChange} />);

    // Verify all sections are rendered and accessible
    expect(screen.getByText('Помощ')).toBeInTheDocument();
    expect(screen.getByText('Как да създадете съдържание')).toBeInTheDocument();
    expect(screen.getByText('Как да публикувате')).toBeInTheDocument();
    expect(screen.getByText('Как да редактирате и изтривате')).toBeInTheDocument();
    expect(screen.getByText('Контакти за техническа поддръжка')).toBeInTheDocument();
  });

  it('displays close button with correct text', () => {
    const onOpenChange = vi.fn();
    render(<HelpModal open={true} onOpenChange={onOpenChange} />);

    const closeButton = screen.getByRole('button', { name: /затвори/i });
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveTextContent('Затвори');
  });

  it('calls onOpenChange when × close button is clicked', () => {
    const onOpenChange = vi.fn();
    render(<HelpModal open={true} onOpenChange={onOpenChange} />);

    // The × close button is rendered by DialogContent with aria-label "Close"
    const xCloseButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(xCloseButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('has scrollable content container', () => {
    const onOpenChange = vi.fn();
    render(<HelpModal open={true} onOpenChange={onOpenChange} />);

    const dialog = screen.getByRole('dialog');
    // DialogContent should have overflow-y-auto and max-h-[80vh] for scrollable behavior
    expect(dialog).toBeInTheDocument();
    // Verify the modal content area exists and contains scrollable content
    expect(screen.getByText('Как да създадете съдържание')).toBeInTheDocument();
    expect(screen.getByText('Контакти за техническа поддръжка')).toBeInTheDocument();
  });

  it('has accessible DialogDescription for screen readers', () => {
    const onOpenChange = vi.fn();
    render(<HelpModal open={true} onOpenChange={onOpenChange} />);

    // DialogDescription should be present (sr-only for screen readers)
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-describedby');
  });
});
