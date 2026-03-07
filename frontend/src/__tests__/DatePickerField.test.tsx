import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DatePickerField } from '@/components/admin/DatePickerField';

// Mock Radix UI Popover and shadcn Calendar to avoid jsdom pointer event issues.
// Using the mocking approach recommended in the story Dev Notes.
vi.mock('@/components/ui/calendar', () => ({
  Calendar: ({ onSelect, disabled }: any) => (
    <div data-testid="mock-calendar">
      {/* Use local date constructors (not ISO strings) to avoid timezone shift in tests */}
      <button onClick={() => onSelect(new Date(2026, 2, 15))}>Select March 15</button>
      <button onClick={() => onSelect(undefined)}>Clear Selection</button>
      <button
        onClick={() => onSelect(new Date(2026, 0, 1))}
        data-disabled={disabled ? String(disabled(new Date(2026, 0, 1))) : 'false'}
        data-testid="btn-jan-1"
      >
        Select Jan 1
      </button>
    </div>
  ),
}));

// Async factory needed to access React.cloneElement for asChild simulation (M2 fix)
vi.mock('@/components/ui/popover', async () => {
  const { default: React } = await import('react');
  return {
    Popover: ({ children, open, onOpenChange }: any) => (
      <div data-testid="popover-root" data-open={String(!!open)}>
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<any>, {
                _popoverToggle: () => onOpenChange?.(!open),
              })
            : child,
        )}
      </div>
    ),
    // Simulate Radix asChild: merge _popoverToggle as onClick onto the child button
    PopoverTrigger: ({ children, asChild, _popoverToggle }: any) => {
      if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
          onClick: _popoverToggle,
        });
      }
      return (
        <div data-testid="popover-trigger" onClick={_popoverToggle}>
          {children}
        </div>
      );
    },
    PopoverContent: ({ children }: any) => (
      <div data-testid="popover-content">{children}</div>
    ),
  };
});

describe('DatePickerField', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders label and placeholder button', () => {
    render(
      <DatePickerField id="test-date" label="Дата на събитието" value={null} onChange={vi.fn()} />,
    );

    expect(screen.getByText('Дата на събитието')).toBeInTheDocument();
    expect(screen.getByText('Изберете дата')).toBeInTheDocument();
  });

  it('renders custom placeholder when provided', () => {
    render(
      <DatePickerField
        id="test-date"
        label="Дата"
        value={null}
        onChange={vi.fn()}
        placeholder="Изберете начална дата"
      />,
    );

    expect(screen.getByText('Изберете начална дата')).toBeInTheDocument();
  });

  it('shows formatted date in dd.MM.yyyy when value is provided', () => {
    render(
      <DatePickerField
        id="test-date"
        label="Дата"
        value="2026-03-15T00:00:00.000Z"
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText('15.03.2026')).toBeInTheDocument();
  });

  it('renders required asterisk when required prop is true', () => {
    render(
      <DatePickerField id="test-date" label="Дата" value={null} onChange={vi.fn()} required />,
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('calls onChange with ISO string when a date is selected', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();

    render(
      <DatePickerField id="test-date" label="Дата" value={null} onChange={mockOnChange} />,
    );

    await user.click(screen.getByText('Select March 15'));

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(expect.stringMatching(/2026-03-15/));
  });

  it('calls onChange with null when selection is cleared (undefined onSelect)', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();

    render(
      <DatePickerField
        id="test-date"
        label="Дата"
        value="2026-03-15T00:00:00.000Z"
        onChange={mockOnChange}
      />,
    );

    await user.click(screen.getByText('Clear Selection'));

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(null);
  });

  it('shows error message below the field when error prop is provided', () => {
    render(
      <DatePickerField
        id="test-date"
        label="Дата"
        value={null}
        onChange={vi.fn()}
        error="Моля, изберете дата"
      />,
    );

    const errorEl = screen.getByRole('alert');
    expect(errorEl).toBeInTheDocument();
    expect(errorEl).toHaveTextContent('Моля, изберете дата');
    expect(errorEl).toHaveAttribute('id', 'test-date-error');
  });

  it('applies border-destructive class to trigger when error is provided', () => {
    render(
      <DatePickerField
        id="test-date"
        label="Дата"
        value={null}
        onChange={vi.fn()}
        error="Моля, изберете дата"
      />,
    );

    const triggerButton = screen.getByRole('button', { name: 'Дата' });
    expect(triggerButton).toHaveClass('border-destructive');
  });

  it('does not show error message when error prop is absent', () => {
    render(
      <DatePickerField id="test-date" label="Дата" value={null} onChange={vi.fn()} />,
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('sets aria-invalid and aria-describedby on trigger when error is provided', () => {
    render(
      <DatePickerField
        id="test-date"
        label="Дата"
        value={null}
        onChange={vi.fn()}
        error="Моля, изберете дата"
      />,
    );

    const triggerButton = screen.getByRole('button', { name: 'Дата' });
    expect(triggerButton).toHaveAttribute('aria-invalid', 'true');
    expect(triggerButton).toHaveAttribute('aria-describedby', 'test-date-error');
  });

  it('does not set aria-describedby when no error', () => {
    render(
      <DatePickerField id="test-date" label="Дата" value={null} onChange={vi.fn()} />,
    );

    const triggerButton = screen.getByRole('button', { name: 'Дата' });
    expect(triggerButton).toHaveAttribute('aria-invalid', 'false');
    expect(triggerButton).not.toHaveAttribute('aria-describedby');
  });

  it('disables calendar dates before minDate', () => {
    const minDate = new Date('2026-02-01');

    render(
      <DatePickerField
        id="test-date"
        label="Дата"
        value={null}
        onChange={vi.fn()}
        minDate={minDate}
      />,
    );

    // Jan 1 is before Feb 1 minDate → disabled
    const jan1Button = screen.getByTestId('btn-jan-1');
    expect(jan1Button).toHaveAttribute('data-disabled', 'true');
  });

  it('does not disable dates when no minDate is provided', () => {
    render(
      <DatePickerField id="test-date" label="Дата" value={null} onChange={vi.fn()} />,
    );

    const jan1Button = screen.getByTestId('btn-jan-1');
    expect(jan1Button).toHaveAttribute('data-disabled', 'false');
  });

  it('renders the mock calendar in popover content', () => {
    render(
      <DatePickerField id="test-date" label="Дата" value={null} onChange={vi.fn()} />,
    );

    expect(screen.getByTestId('popover-content')).toBeInTheDocument();
    expect(screen.getByTestId('mock-calendar')).toBeInTheDocument();
  });

  it('opens popover when trigger button is clicked (AC4)', async () => {
    const user = userEvent.setup();
    render(
      <DatePickerField id="test-date" label="Дата" value={null} onChange={vi.fn()} />,
    );

    expect(screen.getByTestId('popover-root')).toHaveAttribute('data-open', 'false');

    await user.click(screen.getByRole('button', { name: 'Дата' }));

    expect(screen.getByTestId('popover-root')).toHaveAttribute('data-open', 'true');
  });

  it('closes popover after date is selected (AC4)', async () => {
    const user = userEvent.setup();
    render(
      <DatePickerField id="test-date" label="Дата" value={null} onChange={vi.fn()} />,
    );

    // Open the popover first
    await user.click(screen.getByRole('button', { name: 'Дата' }));
    expect(screen.getByTestId('popover-root')).toHaveAttribute('data-open', 'true');

    // Select a date — handleSelect calls setOpen(false)
    await user.click(screen.getByText('Select March 15'));

    expect(screen.getByTestId('popover-root')).toHaveAttribute('data-open', 'false');
  });
});
