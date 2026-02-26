/**
 * AutoSaveIndicator Component Unit Tests
 * Tests rendering, state transitions, ARIA attributes, and fade animations
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AutoSaveIndicator } from '@/components/admin/AutoSaveIndicator';

describe('AutoSaveIndicator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Rendering for Each Status', () => {
    it('renders null when status is idle', () => {
      const { container } = render(
        <AutoSaveIndicator status="idle" />
      );

      // Should not render anything
      expect(container.firstChild).toBeNull();
    });

    it('renders saving state with spinner icon', () => {
      render(<AutoSaveIndicator status="saving" />);

      // Should render default Bulgarian text
      expect(screen.getByText('Запазва...')).toBeInTheDocument();

      // Should have spinner icon (Loader2 with animate-spin class)
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('renders saved state with check icon', () => {
      render(<AutoSaveIndicator status="saved" />);

      // Should render default Bulgarian text
      expect(screen.getByText('Запазено')).toBeInTheDocument();

      // Should have check icon (should be visible initially)
      const indicator = screen.getByRole('status');
      expect(indicator).toBeInTheDocument();
    });

    it('renders error state with X icon', () => {
      render(<AutoSaveIndicator status="error" />);

      // Should render default Bulgarian text
      expect(screen.getByText('Грешка при запазване')).toBeInTheDocument();

      // Should have error indicator
      const indicator = screen.getByRole('status');
      expect(indicator).toBeInTheDocument();
    });
  });

  describe('Custom Messages', () => {
    it('renders custom message for saving state', () => {
      render(<AutoSaveIndicator status="saving" message="Saving draft..." />);

      expect(screen.getByText('Saving draft...')).toBeInTheDocument();
      expect(screen.queryByText('Запазва...')).not.toBeInTheDocument();
    });

    it('renders custom message for saved state', () => {
      render(<AutoSaveIndicator status="saved" message="Draft saved!" />);

      expect(screen.getByText('Draft saved!')).toBeInTheDocument();
      expect(screen.queryByText('Запазено')).not.toBeInTheDocument();
    });

    it('renders custom message for error state', () => {
      render(<AutoSaveIndicator status="error" message="Network error occurred" />);

      expect(screen.getByText('Network error occurred')).toBeInTheDocument();
      expect(screen.queryByText('Грешка при запазване')).not.toBeInTheDocument();
    });
  });

  describe('ARIA Attributes', () => {
    it('has role="status" for screen readers', () => {
      render(<AutoSaveIndicator status="saving" />);

      const statusElement = screen.getByRole('status');
      expect(statusElement).toBeInTheDocument();
    });

    it('has aria-live="polite" attribute', () => {
      render(<AutoSaveIndicator status="saving" />);

      const statusElement = screen.getByRole('status');
      expect(statusElement).toHaveAttribute('aria-live', 'polite');
    });

    it('has aria-atomic="true" attribute', () => {
      render(<AutoSaveIndicator status="saving" />);

      const statusElement = screen.getByRole('status');
      expect(statusElement).toHaveAttribute('aria-atomic', 'true');
    });

    it('icons have aria-hidden="true" attribute', () => {
      render(<AutoSaveIndicator status="saving" />);

      const icon = document.querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Icon Display', () => {
    it('displays Loader2 (spinner) icon for saving state', () => {
      render(<AutoSaveIndicator status="saving" />);

      // Loader2 has animate-spin class
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(spinner?.classList.contains('h-4')).toBe(true);
      expect(spinner?.classList.contains('w-4')).toBe(true);
    });

    it('displays Check icon for saved state', () => {
      render(<AutoSaveIndicator status="saved" />);

      // Check icon should be present
      const statusElement = screen.getByRole('status');
      expect(statusElement).toBeInTheDocument();

      // Should have check icon (we can verify by looking for the svg element)
      const svg = statusElement.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('displays X icon for error state', () => {
      render(<AutoSaveIndicator status="error" />);

      // X icon should be present
      const statusElement = screen.getByRole('status');
      expect(statusElement).toBeInTheDocument();

      // Should have error icon
      const svg = statusElement.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Fade-out Animation for Saved State', () => {
    it('starts fade-out after 3 seconds', async () => {
      render(<AutoSaveIndicator status="saved" />);

      const statusElement = screen.getByRole('status');

      // Initially should not have opacity-0 class
      expect(statusElement.classList.contains('opacity-0')).toBe(false);

      // Fast-forward 3 seconds
      vi.advanceTimersByTime(3000);

      // Should now have opacity-0 class for fade effect
      await waitFor(() => {
        expect(statusElement.classList.contains('opacity-0')).toBe(true);
      });
    });

    it('completely hides after fade animation completes (3.5s total)', async () => {
      const { container } = render(<AutoSaveIndicator status="saved" />);

      // Initially should be visible
      expect(screen.getByRole('status')).toBeInTheDocument();

      // Fast-forward to just before hide (3.4s)
      vi.advanceTimersByTime(3400);

      // Should still be in DOM
      expect(screen.getByRole('status')).toBeInTheDocument();

      // Fast-forward to after hide (3.5s)
      vi.advanceTimersByTime(100);

      // Should be completely removed from DOM
      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });

    it('does not fade out for error state', async () => {
      render(<AutoSaveIndicator status="error" />);

      const statusElement = screen.getByRole('status');

      // Fast-forward past 3.5 seconds
      vi.advanceTimersByTime(5000);

      // Error state should persist (not fade or disappear)
      expect(statusElement).toBeInTheDocument();
      expect(statusElement.classList.contains('opacity-0')).toBe(false);
    });

    it('does not fade out for saving state', async () => {
      render(<AutoSaveIndicator status="saving" />);

      const statusElement = screen.getByRole('status');

      // Fast-forward past 3.5 seconds
      vi.advanceTimersByTime(5000);

      // Saving state should persist
      expect(statusElement).toBeInTheDocument();
      expect(statusElement.classList.contains('opacity-0')).toBe(false);
    });
  });

  describe('State Transitions', () => {
    it('shows indicator when transitioning from idle to saving', () => {
      const { rerender, container } = render(<AutoSaveIndicator status="idle" />);

      // Initially idle (null)
      expect(container.firstChild).toBeNull();

      // Transition to saving
      rerender(<AutoSaveIndicator status="saving" />);

      // Should now be visible
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Запазва...')).toBeInTheDocument();
    });

    it('transitions from saving to saved', () => {
      const { rerender } = render(<AutoSaveIndicator status="saving" />);

      expect(screen.getByText('Запазва...')).toBeInTheDocument();

      // Transition to saved
      rerender(<AutoSaveIndicator status="saved" />);

      expect(screen.getByText('Запазено')).toBeInTheDocument();
    });

    it('transitions from saving to error', () => {
      const { rerender } = render(<AutoSaveIndicator status="saving" />);

      expect(screen.getByText('Запазва...')).toBeInTheDocument();

      // Transition to error
      rerender(<AutoSaveIndicator status="error" />);

      expect(screen.getByText('Грешка при запазване')).toBeInTheDocument();
    });

    it('cleans up timers when unmounting during saved state', () => {
      const { unmount } = render(<AutoSaveIndicator status="saved" />);

      // Unmount before fade completes
      unmount();

      // Should not throw error when advancing timers
      expect(() => {
        vi.advanceTimersByTime(5000);
      }).not.toThrow();
    });
  });

  describe('CSS Classes', () => {
    it('applies correct text color for saving state', () => {
      render(<AutoSaveIndicator status="saving" />);

      const statusElement = screen.getByRole('status');
      expect(statusElement.classList.contains('text-muted-foreground')).toBe(true);
    });

    it('applies correct text color for saved state', () => {
      render(<AutoSaveIndicator status="saved" />);

      const statusElement = screen.getByRole('status');
      expect(
        statusElement.classList.contains('text-green-600') ||
        statusElement.classList.contains('dark:text-green-500')
      ).toBe(true);
    });

    it('applies correct text color for error state', () => {
      render(<AutoSaveIndicator status="error" />);

      const statusElement = screen.getByRole('status');
      expect(statusElement.classList.contains('text-destructive')).toBe(true);
    });

    it('has transition-opacity class for smooth fade', () => {
      render(<AutoSaveIndicator status="saved" />);

      const statusElement = screen.getByRole('status');
      expect(statusElement.classList.contains('transition-opacity')).toBe(true);
      expect(statusElement.classList.contains('duration-500')).toBe(true);
    });
  });
});
