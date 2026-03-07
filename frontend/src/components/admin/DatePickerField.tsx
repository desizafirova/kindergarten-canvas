import React, { useState } from 'react';
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface DatePickerFieldProps {
  id: string;
  label: string;
  value: string | null;
  onChange: (isoDate: string | null) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  minDate?: Date;
}

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  id,
  label,
  value,
  onChange,
  error,
  required = false,
  placeholder = 'Изберете дата',
  minDate,
}) => {
  const [open, setOpen] = useState(false);
  const selectedDate = value ? new Date(value) : undefined;
  const currentYear = new Date().getFullYear();

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      // Build UTC midnight from local date parts to avoid timezone shift (H2 fix)
      const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      onChange(utcDate.toISOString());
    } else {
      onChange(null);
    }
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-hidden>
            *
          </span>
        )}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !selectedDate && 'text-muted-foreground',
              error && 'border-destructive',
            )}
            aria-label={label}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
          >
            <CalendarIcon className="mr-2 h-4 w-4" aria-hidden />
            {selectedDate ? format(selectedDate, 'dd.MM.yyyy', { locale: bg }) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            locale={bg}
            weekStartsOn={1}
            captionLayout="dropdown"
            fromYear={currentYear - 5}
            toYear={currentYear + 5}
            disabled={
              minDate
                ? (date: Date) => {
                    // Compare local date parts only to avoid UTC/local timezone boundary issues (H1 fix)
                    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                    const m = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
                    return d < m;
                  }
                : undefined
            }
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default DatePickerField;
