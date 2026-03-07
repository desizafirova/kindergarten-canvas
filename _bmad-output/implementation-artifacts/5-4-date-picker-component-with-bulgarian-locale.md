# Story 5.4: Date Picker Component with Bulgarian Locale

Status: done

## Story

As an **administrator**,
I want **to select dates using a Bulgarian date picker**,
so that **I can easily set event and deadline dates in my preferred format**.

## Acceptance Criteria

1. **Calendar opens with Bulgarian locale** – When clicking the date field on the Events or Deadlines form, a Radix UI Date Picker calendar opens displaying Bulgarian month names (Януари, Февруари, etc.), Bulgarian day abbreviations (Пн, Вт, Ср, etc.), and week starting on Monday.

2. **Date displays in Bulgarian format** – After selecting a date, the trigger button shows the date in `dd.MM.yyyy` format (e.g., `15.03.2026`) consistently across Events and Deadlines forms.

3. **Month navigation** – Left/right arrow buttons navigate between months; clicking the month/year header reveals a dropdown for fast month/year selection.

4. **Select closes picker** – Selecting a date closes the Popover, populates the trigger button with the formatted date, and updates the form state with the ISO datetime value.

5. **Keyboard navigation** – Focusing the trigger and pressing `Enter` or `Space` opens the calendar; arrow keys navigate days; `Enter` selects the focused day; `Escape` closes without selection (all handled natively by react-day-picker + Radix UI Popover).

6. **Required-date validation** – When a required date is missing at form submission, an inline error message `"Моля, изберете дата"` appears below the field and the trigger border turns red.

7. **End-date-before-start validation** – The `DatePickerField` component accepts a `minDate` prop; dates before `minDate` are disabled in the calendar. The end-date Zod validation message `"Крайната дата трябва да е след началната"` is displayed by the consuming form (Stories 5.5/5.6) via the `error` prop.

## Tasks / Subtasks

- [x] Task 1: Add Bulgarian i18n strings for date picker (AC: 6, 7)
  - [x] Add `datePicker` section to `frontend/src/lib/i18n/types.ts`:
    ```typescript
    datePicker: {
      placeholder: string;
      requiredError: string;
      endBeforeStartError: string;
    };
    ```
  - [x] Add translations to `frontend/src/lib/i18n/bg.ts`:
    ```typescript
    datePicker: {
      placeholder: 'Изберете дата',
      requiredError: 'Моля, изберете дата',
      endBeforeStartError: 'Крайната дата трябва да е след началната',
    },
    ```

- [x] Task 2: Create `DatePickerField` reusable component (AC: 1–7)
  - [x] Create `frontend/src/components/admin/DatePickerField.tsx`
  - [x] Import `Popover`, `PopoverContent`, `PopoverTrigger` from `@/components/ui/popover`
  - [x] Import `Calendar` from `@/components/ui/calendar`
  - [x] Import `format` from `date-fns` and `bg` from `date-fns/locale`
  - [x] Import `CalendarIcon` from `lucide-react`, `Button` from `@/components/ui/button`, `Label` from `@/components/ui/label`, `cn` from `@/lib/utils`
  - [x] Define component props interface (see Dev Notes for exact shape)
  - [x] Implement open/close state with `useState<boolean>(false)`
  - [x] Trigger button: shows `format(selectedDate, 'dd.MM.yyyy', { locale: bg })` or placeholder; apply `border-destructive` when `error` is truthy
  - [x] Calendar props: `mode="single"`, `locale={bg}`, `weekStartsOn={1}`, `captionLayout="dropdown"`, `fromYear={currentYear - 5}`, `toYear={currentYear + 5}`, `initialFocus`
  - [x] `disabled` prop on Calendar: when `minDate` provided, `(date: Date) => date < minDate`
  - [x] `onSelect` handler: call `onChange(date.toISOString())` and `setOpen(false)`; on undefined selection call `onChange(null)`
  - [x] Error display: `<p id="{id}-error" role="alert" className="text-sm text-destructive">` below trigger
  - [x] ARIA: `aria-invalid={!!error}`, `aria-describedby={error ? '{id}-error' : undefined}` on trigger

- [x] Task 3: Write unit tests (AC: 1–7)
  - [x] Create `frontend/src/__tests__/DatePickerField.test.tsx`
  - [x] Mock `react-day-picker` calendar rendering if Radix Popover portal causes jsdom issues (see Dev Notes)
  - [x] Test: renders label and placeholder button
  - [x] Test: opens popover on trigger click (Radix pointer event workaround if needed)
  - [x] Test: selects a date → trigger shows `dd.MM.yyyy` format, `onChange` called with ISO string
  - [x] Test: shows error message and `border-destructive` class when `error` prop is provided
  - [x] Test: dates before `minDate` are disabled (Calendar's `disabled` function evaluated correctly)

## Dev Notes

### Architecture: Date Picker Stack (MANDATORY)

```
Radix UI Popover  ←  @radix-ui/react-popover (already installed)
  └── shadcn Calendar  ←  react-day-picker v8 (already installed)
  └── date-fns v3 + bg locale (already installed)
```

**Do NOT install additional date libraries.** Everything required is already in `frontend/package.json`.

### Component API

```typescript
interface DatePickerFieldProps {
  id: string;
  label: string;
  value: string | null;     // ISO 8601 datetime string or null
  onChange: (isoDate: string | null) => void;
  error?: string;           // Inline error message; also makes border red
  required?: boolean;       // Shows asterisk on label (visual only)
  placeholder?: string;     // Default: 'Изберете дата'
  minDate?: Date;           // Disables calendar dates before this; used for eventEndDate
}
```

### Full Component Implementation

```tsx
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
    onChange(date ? date.toISOString() : null);
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-1" aria-hidden>*</span>}
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
            {selectedDate
              ? format(selectedDate, 'dd.MM.yyyy', { locale: bg })
              : placeholder}
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
            disabled={minDate ? (date: Date) => date < minDate! : undefined}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {error && (
        <p
          id={`${id}-error`}
          className="text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default DatePickerField;
```

### CRITICAL: `type="button"` on Trigger

Always set `type="button"` on the trigger `Button`. Without this, clicking the trigger inside a `<form>` element will submit the form (default button type is `"submit"`). Every prior form (TeacherCreate, NewsCreate) wraps content in `<form>`. Missing `type="button"` is a regression risk.

### Date Format Rules (from Architecture)

| Context | Format | Example |
|---|---|---|
| API payload | ISO 8601 string | `2026-03-15T00:00:00.000Z` |
| DB (Prisma) | `DateTime` | auto-handled |
| UI display | `dd.MM.yyyy` | `15.03.2026` |
| Internal state | ISO string or `Date` object | `2026-03-15T...` |

**Always** call `date.toISOString()` when passing values to the API. **Always** use `format(date, 'dd.MM.yyyy', { locale: bg })` for display.

### react-day-picker v8 + date-fns v3 Compatibility Note

`react-day-picker` v8.10.1 was written against `date-fns` v2 internally. When passing `locale={bg}` (from `date-fns/locale`), the `Locale` type shape is compatible. The `bg` locale in date-fns v3 has `weekStartsOn: 1` by default, but we explicitly pass `weekStartsOn={1}` to be safe. Custom display formatting in the trigger uses `format` from date-fns v3 directly, which is fine.

### `captionLayout="dropdown"` Requirements

For the dropdown month/year selector to render, `fromYear` and `toYear` must be provided. Use `currentYear - 5` to `currentYear + 5` as reasonable bounds for kindergarten events/deadlines. This renders native `<select>` elements for month and year, which are accessible and keyboard-navigable.

### i18n: Using Translations in Consuming Forms

The `DatePickerField` accepts `placeholder` and `error` as props. Consuming forms (Stories 5.5, 5.6) should pass Bulgarian strings from the translation system:

```tsx
// In Events/Deadlines form (future stories):
const t = useTranslation();

<DatePickerField
  id="eventDate"
  label="Дата на събитието"
  value={eventDate}
  onChange={(iso) => setValue('eventDate', iso, { shouldValidate: true })}
  error={errors.eventDate?.message}  // Zod produces: 'Моля, изберете дата'
  required
/>

// For end date with minDate constraint:
<DatePickerField
  id="eventEndDate"
  label="Крайна дата"
  value={eventEndDate}
  onChange={(iso) => setValue('eventEndDate', iso, { shouldValidate: true })}
  error={errors.eventEndDate?.message}  // Zod produces: 'Крайната дата трябва да е след началната'
  minDate={eventDate ? new Date(eventDate) : undefined}
/>
```

### Integration with React Hook Form (Stories 5.5/5.6 Context)

`DatePickerField` is a controlled component — use `watch` + `setValue` pattern (same as `RichTextEditor` and `ImageUploadZone` in TeacherCreate/NewsCreate):

```tsx
const eventDate = watch('eventDate');   // ISO string | null

<DatePickerField
  id="eventDate"
  label="Дата на събитието"
  value={eventDate ?? null}
  onChange={(iso) => setValue('eventDate', iso, { shouldValidate: true })}
  error={errors.eventDate?.message}
  required
/>
```

### Testing Challenges: Radix UI Popover + jsdom

Radix UI Popover uses pointer events. In jsdom (vitest), `PointerEvent` may not be fully implemented. If clicking the trigger doesn't open the popover, add this in the test file or a global setup:

```typescript
// At the top of the test file or in vitest setup:
window.HTMLElement.prototype.scrollIntoView = vi.fn();
Object.defineProperty(window, 'PointerEvent', { value: MouseEvent });
Object.assign(window.HTMLElement.prototype, {
  hasPointerCapture: vi.fn(),
  releasePointerCapture: vi.fn(),
  setPointerCapture: vi.fn(),
});
```

Alternatively, mock the entire Calendar/Popover for unit tests and test the component logic in isolation:

```typescript
// Mocking approach (simpler):
vi.mock('@/components/ui/calendar', () => ({
  Calendar: ({ onSelect, selected, disabled }: any) => (
    <div data-testid="mock-calendar">
      <button onClick={() => onSelect(new Date('2026-03-15'))}>Select March 15</button>
      <button
        onClick={() => onSelect(new Date('2026-01-01'))}
        data-disabled={disabled ? disabled(new Date('2026-01-01')) : false}
      >
        Select Jan 1
      </button>
    </div>
  ),
}));

vi.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: any) => <div>{children}</div>,
  PopoverTrigger: ({ children, asChild }: any) => <div>{children}</div>,
  PopoverContent: ({ children }: any) => <div data-testid="popover-content">{children}</div>,
}));
```

This is the **recommended approach** for unit tests — mock the Radix/shadcn primitives and test logic/rendering.

### File Placement

```
frontend/src/
├── components/
│   └── admin/
│       └── DatePickerField.tsx     ← NEW (follows RichTextEditor.tsx pattern)
├── lib/
│   └── i18n/
│       ├── types.ts                ← MODIFY (add datePicker section)
│       └── bg.ts                  ← MODIFY (add datePicker translations)
└── __tests__/
    └── DatePickerField.test.tsx    ← NEW
```

**Location rationale:** `components/admin/` is the correct location (alongside `RichTextEditor.tsx`, `ImageUploadZone.tsx`, `ContentFormShell.tsx`) since the date picker is an admin form utility component.

### Project Structure Notes

- Follows the same controlled-component wrapper pattern as `RichTextEditor.tsx` and `ImageUploadZone.tsx`
- The `calendar.tsx` and `popover.tsx` UI primitives at `frontend/src/components/ui/` already exist — do NOT recreate them
- The `bg` locale from `date-fns/locale` is the same import used in the architecture example at `format(date, 'dd.MM.yyyy', { locale: bg })`
- Form schema for events/deadlines validation belongs to Stories 5.5/5.6 (Zod schemas go in `frontend/src/schemas/`)
- This component is purely a UI widget — no API calls, no hooks for data fetching

### Existing Component to Reference

Compare implementation against `RichTextEditor.tsx` for:
- Controlled `value`/`onChange` props interface
- Error prop → `border-destructive` CSS class + `role="alert"` error paragraph
- `Label` + `id` pairing
- Wrapper `div` with `space-y-2` class

See: [frontend/src/components/admin/RichTextEditor.tsx](frontend/src/components/admin/RichTextEditor.tsx)

### References

- Existing Calendar UI component: [frontend/src/components/ui/calendar.tsx](frontend/src/components/ui/calendar.tsx)
- Existing Popover UI component: [frontend/src/components/ui/popover.tsx](frontend/src/components/ui/popover.tsx)
- Existing RichTextEditor pattern: [frontend/src/components/admin/RichTextEditor.tsx](frontend/src/components/admin/RichTextEditor.tsx)
- Existing TeacherCreate form (React Hook Form + controlled component pattern): [frontend/src/pages/admin/TeacherCreate.tsx](frontend/src/pages/admin/TeacherCreate.tsx)
- i18n types: [frontend/src/lib/i18n/types.ts](frontend/src/lib/i18n/types.ts)
- i18n translations: [frontend/src/lib/i18n/bg.ts](frontend/src/lib/i18n/bg.ts)
- Test pattern: [frontend/src/__tests__/TeacherCreate.test.tsx](frontend/src/__tests__/TeacherCreate.test.tsx)
- Architecture (Date formatting): Architecture.md §"Date/Time Formatting Patterns"
- Architecture (Date Picker decision): Architecture.md §"Date Picker — Decision: Radix UI Date Picker (via shadcn-ui)"
- Consuming stories: Story 5.5 (Events form), Story 5.6 (Deadlines form)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- Fixed `vi.mock` inside test body causing calendar mock override: moved all mocks to top-level with a single Calendar mock that includes both "Select March 15", "Clear Selection", and "Select Jan 1" (with `data-testid="btn-jan-1"`) buttons for all test scenarios.

### Completion Notes List

- ✅ Task 1: Added `datePicker` section to `frontend/src/lib/i18n/types.ts` and `frontend/src/lib/i18n/bg.ts` with Bulgarian translations (`placeholder`, `requiredError`, `endBeforeStartError`).
- ✅ Task 2: Created `frontend/src/components/admin/DatePickerField.tsx` — fully implements all AC 1–7: Bulgarian locale calendar (`bg` from date-fns, `weekStartsOn={1}`, `captionLayout="dropdown"`), `dd.MM.yyyy` display format, `border-destructive` on error, `aria-invalid` + `aria-describedby` for accessibility, `minDate` prop disabling dates, `type="button"` on trigger (critical for form compatibility).
- ✅ Task 3: Created `frontend/src/__tests__/DatePickerField.test.tsx` — 14 tests all pass. Uses recommended mock approach (Calendar + Popover mocked as simple elements). Covers: label/placeholder rendering, custom placeholder, date formatting display, required asterisk, onChange with ISO string, onChange with null, error message, border-destructive, aria attributes, no error state, minDate disabled, no minDate enabled, popover content rendering.
- ✅ All 14 new tests pass. No regressions in files touched by this story. Pre-existing failures (40 tests in AutoSave timing tests, WebSocket tests, Teacher CRUD tests from Story 4.x) are unrelated to this story's changes.

### File List

- `frontend/src/lib/i18n/types.ts` — modified (added `datePicker` section)
- `frontend/src/lib/i18n/bg.ts` — modified (added `datePicker` translations)
- `frontend/src/components/admin/DatePickerField.tsx` — created
- `frontend/src/components/ui/calendar.tsx` — modified (added `caption_dropdowns` and `vhidden` classNames for dropdown mode)
- `frontend/src/__tests__/DatePickerField.test.tsx` — created
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — modified (status updated to `done`)
- `_bmad-output/implementation-artifacts/5-4-date-picker-component-with-bulgarian-locale.md` — modified (story file updated)

## Senior Developer Review (AI)

**Reviewer:** claude-opus-4-6 on 2026-03-04
**Outcome:** Changes Required → Fixed (2 High, 2 Medium resolved)

### Findings Fixed

**H1 — Timezone bug in `minDate` comparison** [FIXED]
`DatePickerField.tsx:80` — The original `date < minDate!` compared react-day-picker's local-midnight dates against UTC-midnight `minDate` values (from ISO strings). In UTC+ timezones, local March 15 midnight is before UTC March 15 midnight, causing March 15 to be incorrectly disabled. Fixed by normalizing both dates to local midnight using date parts before comparing.

**H2 — `toISOString()` shifts date in eastern timezones** [FIXED]
`DatePickerField.tsx:37` — Calling `date.toISOString()` on a local-midnight date in UTC+ timezones produced the previous day in UTC (e.g., selecting March 15 in UTC+2 → stored as `2026-03-14T22:00:00.000Z`). Fixed by constructing UTC midnight explicitly from local date parts: `new Date(Date.UTC(y, m, d))`.

**M1 — `calendar.tsx` missing dropdown-mode classNames** [FIXED]
`calendar.tsx` — When `captionLayout="dropdown"` is used, react-day-picker renders `caption_dropdowns` and `vhidden` elements. Without classNames for these, the month/year `<select>` elements rendered unstyled. Added `caption_dropdowns: "flex gap-1"` and `vhidden: "sr-only"` to the Calendar classNames map.

**M2 — Popover open/close behavior not tested** [FIXED]
`DatePickerField.test.tsx` — The original Popover mock was transparent (always rendered content, ignored `open`/`onOpenChange`). Updated to an async factory that uses `React.cloneElement` to simulate Radix's `asChild` behavior, exposing `data-open` on the popover root. Added 2 new tests: "opens popover when trigger is clicked (AC4)" and "closes popover after date is selected (AC4)". Also fixed Calendar mock to use `new Date(year, month, day)` local constructors instead of ISO string `new Date('yyyy-mm-dd')` to avoid timezone shifts in the test assertions. Total tests: 16 (was 14), all passing.

## Change Log

- 2026-03-04: Implemented Story 5.4 — DatePickerField component with Bulgarian locale, i18n strings, and 14 unit tests (claude-sonnet-4-6)
- 2026-03-04: Code review — fixed 2 HIGH (timezone bugs in minDate/toISOString) + 2 MEDIUM (calendar dropdown styles, popover open/close tests); 16 tests all pass (claude-opus-4-6)
