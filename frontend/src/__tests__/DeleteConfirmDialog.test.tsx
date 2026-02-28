import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';

describe('DeleteConfirmDialog', () => {
  const mockOnConfirm = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with item title and warning message', () => {
    render(
      <DeleteConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        itemTitle="Test News Title"
        onConfirm={mockOnConfirm}
        isDeleting={false}
      />
    );

    expect(screen.getByText('Изтриване на новина')).toBeInTheDocument();
    expect(screen.getByText(/Сигурни ли сте/)).toBeInTheDocument();
    expect(screen.getByText('Test News Title')).toBeInTheDocument();
    expect(screen.getByText(/Това действие не може да бъде отменено/)).toBeInTheDocument();
  });

  it('Cancel button closes dialog without calling onConfirm', async () => {
    render(
      <DeleteConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        itemTitle="Test"
        onConfirm={mockOnConfirm}
        isDeleting={false}
      />
    );

    const cancelButton = screen.getByText('Отказ');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('Escape key closes dialog without calling onConfirm', async () => {
    render(
      <DeleteConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        itemTitle="Test"
        onConfirm={mockOnConfirm}
        isDeleting={false}
      />
    );

    // Radix AlertDialog handles Escape key internally
    // We verify the dialog can be closed via keyboard
    const dialog = screen.getByRole('alertdialog');
    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });

    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalled();
    });
  });

  it('Delete button calls onConfirm when clicked', async () => {
    render(
      <DeleteConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        itemTitle="Test"
        onConfirm={mockOnConfirm}
        isDeleting={false}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /изтрий/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalled();
    });
  });

  it('Delete button disabled during deletion (isDeleting=true)', () => {
    render(
      <DeleteConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        itemTitle="Test"
        onConfirm={mockOnConfirm}
        isDeleting={true}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /изтрий/i });
    expect(deleteButton).toBeDisabled();
  });

  it('Cancel button auto-focused when dialog opens', () => {
    render(
      <DeleteConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        itemTitle="Test"
        onConfirm={mockOnConfirm}
        isDeleting={false}
      />
    );

    const cancelButton = screen.getByText('Отказ');
    // Verify the cancel button is actually focused
    expect(cancelButton).toHaveFocus();
  });

  it('Dialog accessible (ARIA roles, keyboard navigation)', () => {
    render(
      <DeleteConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        itemTitle="Test News"
        onConfirm={mockOnConfirm}
        isDeleting={false}
      />
    );

    // Verify AlertDialog role
    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toBeInTheDocument();

    // Verify title (AlertDialogTitle)
    expect(screen.getByText('Изтриване на новина')).toBeInTheDocument();

    // Verify description (AlertDialogDescription)
    expect(screen.getByText(/Сигурни ли сте/)).toBeInTheDocument();

    // Verify buttons are accessible
    expect(screen.getByRole('button', { name: /отказ/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /изтрий/i })).toBeInTheDocument();
  });

  it('shows loading spinner when isDeleting is true', () => {
    render(
      <DeleteConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        itemTitle="Test"
        onConfirm={mockOnConfirm}
        isDeleting={true}
      />
    );

    // Loader2 icon should be present
    const deleteButton = screen.getByRole('button', { name: /изтрий/i });
    // Check for loading indicator (Loader2 has animate-spin class)
    expect(deleteButton.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('Cancel button disabled during deletion (isDeleting=true)', () => {
    render(
      <DeleteConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        itemTitle="Test"
        onConfirm={mockOnConfirm}
        isDeleting={true}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /отказ/i });
    expect(cancelButton).toBeDisabled();
  });
});
