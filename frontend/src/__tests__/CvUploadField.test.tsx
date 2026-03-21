import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { CvUploadField } from '@/components/public/CvUploadField';

vi.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    applicationForm: {
      cvLabel: 'CV (PDF)',
      cvHelp: 'Качете вашето CV в PDF формат (до 10MB)',
      cvDropZoneText: 'Натиснете или плъзнете PDF файл тук',
      cvRemoveButton: 'Премахни',
      cvInvalidType: 'Моля, качете PDF файл',
      cvFileTooLarge: 'Файлът е твърде голям. Максимален размер: 10MB',
    },
  }),
}));

vi.mock('@/schemas/application-form.schema', async () => {
  const { z } = await import('zod');
  const applicationFormSchema = z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    coverLetter: z.string().optional(),
    cv: z.any().refine((file: unknown) => file != null, 'CV файлът е задължителен'),
  });
  return { applicationFormSchema };
});

// Test wrapper that provides RHF control
function WrapperForm({ isSubmitting = false }: { isSubmitting?: boolean }) {
  const { control } = useForm<any>({ defaultValues: { cv: null } });
  return <CvUploadField control={control} isSubmitting={isSubmitting} />;
}

function createMockFile(name: string, type: string, size = 1024): File {
  const file = new File(['content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

function fireChangeOnHiddenInput(file: File) {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  Object.defineProperty(input, 'files', {
    value: { 0: file, length: 1, item: () => file },
    configurable: true,
  });
  fireEvent.change(input);
}

describe('CvUploadField', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders drop zone with correct text', () => {
    render(<WrapperForm />);
    expect(screen.getByText('Натиснете или плъзнете PDF файл тук')).toBeInTheDocument();
    expect(screen.getByText('Качете вашето CV в PDF формат (до 10MB)')).toBeInTheDocument();
  });

  it('drop zone has role="button" and tabIndex=0', () => {
    render(<WrapperForm />);
    const dropZone = screen.getByRole('button', { name: /Натиснете или плъзнете/ });
    expect(dropZone).toBeInTheDocument();
    expect(dropZone).toHaveAttribute('tabindex', '0');
  });

  it('shows filename with checkmark and Remove button after selecting valid PDF', () => {
    render(<WrapperForm />);
    fireChangeOnHiddenInput(createMockFile('my-cv.pdf', 'application/pdf'));

    expect(screen.getByText('my-cv.pdf')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Премахни' })).toBeInTheDocument();
    // Drop zone should be gone
    expect(screen.queryByText('Натиснете или плъзнете PDF файл тук')).not.toBeInTheDocument();
  });

  it('shows non-PDF error and keeps drop zone when non-PDF file is selected', () => {
    render(<WrapperForm />);
    fireChangeOnHiddenInput(createMockFile('photo.jpg', 'image/jpeg'));

    expect(screen.getByText('Моля, качете PDF файл')).toBeInTheDocument();
    // Drop zone should still be visible
    expect(screen.getByText('Натиснете или плъзнете PDF файл тук')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Премахни' })).not.toBeInTheDocument();
  });

  it('shows size error when PDF is over 10MB', () => {
    render(<WrapperForm />);
    const bigFile = createMockFile('large-cv.pdf', 'application/pdf', 11 * 1024 * 1024);
    fireChangeOnHiddenInput(bigFile);

    expect(screen.getByText('Файлът е твърде голям. Максимален размер: 10MB')).toBeInTheDocument();
    expect(screen.getByText('Натиснете или плъзнете PDF файл тук')).toBeInTheDocument();
  });

  it('accepts exactly 10MB PDF without size error', () => {
    render(<WrapperForm />);
    const exactFile = createMockFile('exact-cv.pdf', 'application/pdf', 10 * 1024 * 1024);
    fireChangeOnHiddenInput(exactFile);

    expect(screen.queryByText(/твърде голям/)).not.toBeInTheDocument();
    expect(screen.getByText('exact-cv.pdf')).toBeInTheDocument();
  });

  it('clicking Remove restores drop zone and clears selected file', async () => {
    const user = userEvent.setup();
    render(<WrapperForm />);

    // Select a file
    fireChangeOnHiddenInput(createMockFile('cv.pdf', 'application/pdf'));
    expect(screen.getByText('cv.pdf')).toBeInTheDocument();

    // Click Remove
    await user.click(screen.getByRole('button', { name: 'Премахни' }));

    expect(screen.queryByText('cv.pdf')).not.toBeInTheDocument();
    expect(screen.getByText('Натиснете или плъзнете PDF файл тук')).toBeInTheDocument();
  });

  it('shows filename after dropping valid PDF file via drag-drop', () => {
    render(<WrapperForm />);
    const file = createMockFile('dropped-cv.pdf', 'application/pdf');
    const dropZone = screen.getByRole('button', { name: /Натиснете или плъзнете/ });

    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] },
    });

    expect(screen.getByText('dropped-cv.pdf')).toBeInTheDocument();
  });

  it('shows non-PDF error when non-PDF is dragged and dropped', () => {
    render(<WrapperForm />);
    const file = createMockFile('photo.png', 'image/png');
    const dropZone = screen.getByRole('button', { name: /Натиснете или плъзнете/ });

    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] },
    });

    expect(screen.getByText('Моля, качете PDF файл')).toBeInTheDocument();
  });

  it('applies drag-over styling when file is dragged over', () => {
    render(<WrapperForm />);
    const dropZone = screen.getByRole('button', { name: /Натиснете или плъзнете/ });

    fireEvent.dragOver(dropZone);
    expect(dropZone.className).toContain('border-primary');

    fireEvent.dragLeave(dropZone);
    expect(dropZone.className).toContain('border-gray-300');
  });

  it('drop zone has tabIndex=-1 when submitting', () => {
    render(<WrapperForm isSubmitting={true} />);
    const dropZone = screen.getByRole('button', { name: /Натиснете или плъзнете/ });
    expect(dropZone).toHaveAttribute('tabindex', '-1');
  });

  it('pressing Enter on the drop zone triggers file input click', () => {
    render(<WrapperForm />);
    const dropZone = screen.getByRole('button', { name: /Натиснете или плъзнете/ });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click').mockImplementation(() => {});

    fireEvent.keyDown(dropZone, { key: 'Enter' });

    expect(clickSpy).toHaveBeenCalledTimes(1);
    clickSpy.mockRestore();
  });

  it('pressing Space on the drop zone triggers file input click', () => {
    render(<WrapperForm />);
    const dropZone = screen.getByRole('button', { name: /Натиснете или плъзнете/ });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click').mockImplementation(() => {});

    fireEvent.keyDown(dropZone, { key: ' ' });

    expect(clickSpy).toHaveBeenCalledTimes(1);
    clickSpy.mockRestore();
  });

  it('dropping a file while submitting is ignored', () => {
    render(<WrapperForm isSubmitting={true} />);
    const dropZone = screen.getByRole('button', { name: /Натиснете или плъзнете/ });
    const file = createMockFile('cv.pdf', 'application/pdf');

    fireEvent.drop(dropZone, { dataTransfer: { files: [file] } });

    expect(screen.queryByText('cv.pdf')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Натиснете или плъзнете/ })).toBeInTheDocument();
  });

  it('Remove button is disabled when submitting', () => {
    function ControllableWrapper({ isSubmitting }: { isSubmitting: boolean }) {
      const { control } = useForm<any>({ defaultValues: { cv: null } });
      return <CvUploadField control={control} isSubmitting={isSubmitting} />;
    }

    const { rerender } = render(<ControllableWrapper isSubmitting={false} />);

    // Select a file
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = createMockFile('cv.pdf', 'application/pdf');
    Object.defineProperty(input, 'files', {
      value: { 0: file, length: 1, item: () => file },
      configurable: true,
    });
    fireEvent.change(input);

    expect(screen.getByText('cv.pdf')).toBeInTheDocument();

    // Re-render same component instance with isSubmitting=true — preserves selectedFile state
    rerender(<ControllableWrapper isSubmitting={true} />);

    expect(screen.getByRole('button', { name: 'Премахни' })).toBeDisabled();
  });
});
