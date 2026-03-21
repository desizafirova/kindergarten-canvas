import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JobApplicationModal } from '@/components/public/JobApplicationModal';

// Use vi.hoisted() pattern per Story 6.4 debug note for Vitest hoisting
const { mockPost } = vi.hoisted(() => ({
  mockPost: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  default: { post: mockPost },
}));

// Mock schema — cv is now a File (not FileList) since Story 6.6
vi.mock('@/schemas/application-form.schema', async () => {
  const { z } = await import('zod');
  const applicationFormSchema = z.object({
    name: z.string().min(1, 'Името е задължително'),
    email: z.string().min(1, 'Имейлът е задължителен').email('Невалиден имейл формат'),
    phone: z.string().min(1, 'Телефонът е задължителен').regex(/^(\+359|0)[0-9]{8,9}$/, 'Невалиден телефонен номер'),
    coverLetter: z.string().optional(),
    cv: z.any().refine((file: unknown) => file != null, 'CV файлът е задължителен'),
  });
  return { applicationFormSchema };
});

vi.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    applicationForm: {
      title: 'Кандидатствай за:',
      nameLabel: 'Име и фамилия',
      namePlaceholder: 'Въведете вашето пълно име',
      emailLabel: 'Имейл',
      emailPlaceholder: 'example@email.com',
      phoneLabel: 'Телефон',
      phonePlaceholder: '+359 888 123 456',
      coverLetterLabel: 'Мотивационно писмо (незадължително)',
      coverLetterPlaceholder: 'Разкажете ни защо искате да работите при нас...',
      cvLabel: 'CV (PDF)',
      cvHelp: 'Качете вашето CV в PDF формат (до 10MB)',
      cvDropZoneText: 'Натиснете или плъзнете PDF файл тук',
      cvRemoveButton: 'Премахни',
      cvInvalidType: 'Моля, качете PDF файл',
      cvFileTooLarge: 'Файлът е твърде голям. Максимален размер: 10MB',
      submitButton: 'Изпрати кандидатура',
      submittingButton: 'Изпращане...',
      successMessage: 'Кандидатурата е изпратена успешно!',
      rateLimitError: 'Твърде много заявки. Моля, опитайте отново по-късно.',
      genericError: 'Възникна грешка. Моля, опитайте отново.',
      closeButton: 'Затвори',
    },
  }),
}));

// Helper to mock file input in jsdom (DataTransfer not available in jsdom)
function createMockFile(name: string, type: string, size: number = 1024): File {
  const file = new File(['content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

function fireChangeWithFile(input: HTMLElement, file: File) {
  // Use a plain object (not FileList.prototype which has read-only length in jsdom)
  const mockFileList = { 0: file, length: 1, item: () => file };
  Object.defineProperty(input, 'files', {
    value: mockFileList,
    configurable: true,
  });
  fireEvent.change(input);
}

const defaultJob = { id: 1, title: 'Учител в детска градина' };

const renderModal = (props: Partial<{ isOpen: boolean; onClose: () => void; job: { id: number; title: string } | null }> = {}) => {
  const defaults = {
    isOpen: true,
    onClose: vi.fn(),
    job: defaultJob,
  };
  return render(<JobApplicationModal {...defaults} {...props} />);
};

describe('JobApplicationModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    renderModal({ isOpen: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders nothing when job is null', () => {
    renderModal({ job: null });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders form with all Bulgarian labels when open', () => {
    renderModal();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Кандидатствай за:')).toBeInTheDocument();
    expect(screen.getByText('Учител в детска градина')).toBeInTheDocument();
    expect(screen.getByLabelText(/Име и фамилия/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Имейл/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Телефон/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Мотивационно писмо/)).toBeInTheDocument();
    expect(screen.getByLabelText(/CV \(PDF\)/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Изпрати кандидатура' })).toBeInTheDocument();
  });

  it('shows the job title in the modal header', () => {
    renderModal({ job: { id: 2, title: 'Помощник-учител' } });
    expect(screen.getByText('Помощник-учител')).toBeInTheDocument();
  });

  it('shows validation errors for empty required fields on submit', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: 'Изпрати кандидатура' }));

    await waitFor(() => {
      expect(screen.getByText('Името е задължително')).toBeInTheDocument();
      expect(screen.getByText('Имейлът е задължителен')).toBeInTheDocument();
      expect(screen.getByText('Телефонът е задължителен')).toBeInTheDocument();
      expect(screen.getByText('CV файлът е задължителен')).toBeInTheDocument();
    });
  });

  it('shows email validation error for invalid email', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.type(screen.getByLabelText(/Имейл/), 'not-an-email');
    await user.click(screen.getByRole('button', { name: 'Изпрати кандидатура' }));

    await waitFor(() => {
      expect(screen.getByText('Невалиден имейл формат')).toBeInTheDocument();
    });
  });

  it('shows phone validation error for invalid phone', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.type(screen.getByLabelText(/Телефон/), '123');
    await user.click(screen.getByRole('button', { name: 'Изпрати кандидатура' }));

    await waitFor(() => {
      expect(screen.getByText('Невалиден телефонен номер')).toBeInTheDocument();
    });
  });

  it('shows CV required error when no file selected', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.type(screen.getByLabelText(/Име и фамилия/), 'Test User');
    await user.type(screen.getByLabelText(/Имейл/), 'test@example.com');
    await user.type(screen.getByLabelText(/Телефон/), '0888123456');
    await user.click(screen.getByRole('button', { name: 'Изпрати кандидатура' }));

    await waitFor(() => {
      expect(screen.getByText('CV файлът е задължителен')).toBeInTheDocument();
    });
  });

  it('submit button is disabled during submission', async () => {
    const user = userEvent.setup();
    mockPost.mockImplementationOnce(() => new Promise(() => {})); // never resolves

    renderModal();

    await user.type(screen.getByLabelText(/Име и фамилия/), 'Test User');
    await user.type(screen.getByLabelText(/Имейл/), 'test@example.com');
    await user.type(screen.getByLabelText(/Телефон/), '0888123456');

    const cvInput = screen.getByLabelText(/CV \(PDF\)/);
    fireChangeWithFile(cvInput, createMockFile('cv.pdf', 'application/pdf'));

    await user.click(screen.getByRole('button', { name: 'Изпрати кандидатура' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Изпращане/ })).toBeDisabled();
    });
  });

  it('shows 429 rate-limit message in Bulgarian', async () => {
    const user = userEvent.setup();
    mockPost.mockRejectedValueOnce({ response: { status: 429 } });

    renderModal();

    await user.type(screen.getByLabelText(/Име и фамилия/), 'Test User');
    await user.type(screen.getByLabelText(/Имейл/), 'test@example.com');
    await user.type(screen.getByLabelText(/Телефон/), '0888123456');

    const cvInput = screen.getByLabelText(/CV \(PDF\)/);
    fireChangeWithFile(cvInput, createMockFile('cv.pdf', 'application/pdf'));

    await user.click(screen.getByRole('button', { name: 'Изпрати кандидатура' }));

    await waitFor(() => {
      expect(screen.getByText('Твърде много заявки. Моля, опитайте отново по-късно.')).toBeInTheDocument();
    });
  });

  it('shows generic error on non-429 API failure', async () => {
    const user = userEvent.setup();
    mockPost.mockRejectedValueOnce({ response: { status: 500 } });

    renderModal();

    await user.type(screen.getByLabelText(/Име и фамилия/), 'Test User');
    await user.type(screen.getByLabelText(/Имейл/), 'test@example.com');
    await user.type(screen.getByLabelText(/Телефон/), '0888123456');

    const cvInput = screen.getByLabelText(/CV \(PDF\)/);
    fireChangeWithFile(cvInput, createMockFile('cv.pdf', 'application/pdf'));

    await user.click(screen.getByRole('button', { name: 'Изпрати кандидатура' }));

    await waitFor(() => {
      expect(screen.getByText('Възникна грешка. Моля, опитайте отново.')).toBeInTheDocument();
    });
  });

  it('shows success message after successful submission (201)', async () => {
    const user = userEvent.setup();
    mockPost.mockResolvedValueOnce({ status: 201, data: { status: 'success' } });

    renderModal();

    await user.type(screen.getByLabelText(/Име и фамилия/), 'Test User');
    await user.type(screen.getByLabelText(/Имейл/), 'test@example.com');
    await user.type(screen.getByLabelText(/Телефон/), '0888123456');

    const cvInput = screen.getByLabelText(/CV \(PDF\)/);
    fireChangeWithFile(cvInput, createMockFile('cv.pdf', 'application/pdf'));

    await user.click(screen.getByRole('button', { name: 'Изпрати кандидатура' }));

    await waitFor(() => {
      expect(screen.getByText('Кандидатурата е изпратена успешно!')).toBeInTheDocument();
    });
  });

  it('calls onClose when close button is clicked after success', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    mockPost.mockResolvedValueOnce({ status: 201, data: { status: 'success' } });

    renderModal({ onClose });

    await user.type(screen.getByLabelText(/Име и фамилия/), 'Test User');
    await user.type(screen.getByLabelText(/Имейл/), 'test@example.com');
    await user.type(screen.getByLabelText(/Телефон/), '0888123456');

    const cvInput = screen.getByLabelText(/CV \(PDF\)/);
    fireChangeWithFile(cvInput, createMockFile('cv.pdf', 'application/pdf'));

    await user.click(screen.getByRole('button', { name: 'Изпрати кандидатура' }));

    await waitFor(() => {
      expect(screen.getByText('Кандидатурата е изпратена успешно!')).toBeInTheDocument();
    });

    // Use last "Затвори" button (the success screen's, not the modal X button)
    await user.click(screen.getAllByRole('button', { name: 'Затвори' }).at(-1)!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal({ onClose });

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal({ onClose });

    // Click the backdrop (aria-hidden div behind modal)
    const backdrop = document.querySelector('[aria-hidden="true"]') as HTMLElement;
    await user.click(backdrop);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
