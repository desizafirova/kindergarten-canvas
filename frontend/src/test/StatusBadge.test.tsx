import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/ui/StatusBadge';

describe('StatusBadge', () => {
  describe('Draft Badge', () => {
    it('renders draft badge with correct Bulgarian text', () => {
      render(<StatusBadge status="draft" />);

      const badge = screen.getByRole('status');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('Чернова');
    });

    it('has amber background color for draft status', () => {
      render(<StatusBadge status="draft" />);

      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('bg-amber-500');
    });

    it('has white text color for draft status', () => {
      render(<StatusBadge status="draft" />);

      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('text-white');
    });

    it('has rounded corners for draft badge', () => {
      render(<StatusBadge status="draft" />);

      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('rounded-md');
    });
  });

  describe('Published Badge', () => {
    it('renders published badge with correct Bulgarian text', () => {
      render(<StatusBadge status="published" />);

      const badge = screen.getByRole('status');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('Публикуван');
    });

    it('has green background color for published status', () => {
      render(<StatusBadge status="published" />);

      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('bg-green-500');
    });

    it('has white text color for published status', () => {
      render(<StatusBadge status="published" />);

      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('text-white');
    });

    it('has rounded corners for published badge', () => {
      render(<StatusBadge status="published" />);

      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('rounded-md');
    });
  });

  describe('Accessibility', () => {
    it('includes role="status" attribute for screen readers', () => {
      render(<StatusBadge status="draft" />);

      const badge = screen.getByRole('status');
      expect(badge).toBeInTheDocument();
    });

    it('conveys status through both color and text', () => {
      const { rerender } = render(<StatusBadge status="draft" />);

      let badge = screen.getByRole('status');
      // Draft: has both color (amber) and text (Чернова)
      expect(badge).toHaveClass('bg-amber-500');
      expect(badge).toHaveTextContent('Чернова');

      rerender(<StatusBadge status="published" />);
      badge = screen.getByRole('status');
      // Published: has both color (green) and text (Публикуван)
      expect(badge).toHaveClass('bg-green-500');
      expect(badge).toHaveTextContent('Публикуван');
    });
  });

  describe('Custom Styling', () => {
    it('accepts optional className prop for additional styling', () => {
      render(<StatusBadge status="draft" className="ml-2 custom-class" />);

      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('ml-2');
      expect(badge).toHaveClass('custom-class');
    });

    it('preserves base styles when className is provided', () => {
      render(<StatusBadge status="published" className="ml-4" />);

      const badge = screen.getByRole('status');
      // Should still have base styles
      expect(badge).toHaveClass('bg-green-500');
      expect(badge).toHaveClass('text-white');
      expect(badge).toHaveClass('rounded-md');
      // Plus custom class
      expect(badge).toHaveClass('ml-4');
    });
  });

  describe('Typography and Spacing', () => {
    it('has correct typography classes', () => {
      render(<StatusBadge status="draft" />);

      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('text-xs'); // 13px font size
      expect(badge).toHaveClass('font-medium'); // 500 weight
    });

    it('has correct padding classes', () => {
      render(<StatusBadge status="draft" />);

      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('px-3'); // 12px horizontal
      expect(badge).toHaveClass('py-1'); // 4px vertical
    });

    it('uses inline-flex layout', () => {
      render(<StatusBadge status="draft" />);

      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('inline-flex');
      expect(badge).toHaveClass('items-center');
    });
  });
});
