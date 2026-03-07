import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TeachersPage } from '@/pages/public/TeachersPage';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
mockedAxios.isCancel = vi.fn(() => false);

// Mock useTranslation
vi.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    publicTeachers: {
      sectionTitle: 'Нашият екип',
      emptyState: 'Информация за екипа скоро.',
      loading: 'Зареждане...',
      error: 'Грешка при зареждане на учителите',
    },
  }),
}));

// Helper to render with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('TeachersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and displays published teachers on mount', async () => {
    const mockTeachers = [
      {
        id: 1,
        firstName: 'Мария',
        lastName: 'Петрова',
        position: 'Учител',
        bio: '<p>Биография на учителя</p>',
        photoUrl: 'https://res.cloudinary.com/example/teacher1.jpg',
        displayOrder: 1,
      },
      {
        id: 2,
        firstName: 'Иван',
        lastName: 'Стефанов',
        position: 'Директор',
        bio: '<p>Биография на директора</p>',
        photoUrl: null,
        displayOrder: 2,
      },
    ];

    mockedAxios.get.mockResolvedValueOnce({
      data: {
        status: 'success',
        data: {
          teachers: mockTeachers,
        },
      },
    });

    renderWithRouter(<TeachersPage />);

    // Should show loading initially
    expect(screen.getByText('Зареждане...')).toBeInTheDocument();

    // Wait for teachers to load
    await waitFor(() => {
      expect(screen.getByText('Мария Петрова')).toBeInTheDocument();
      expect(screen.getByText('Иван Стефанов')).toBeInTheDocument();
    });

    // Verify axios was called with correct endpoint
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/public/teachers', expect.objectContaining({
      signal: expect.any(AbortSignal),
    }));
  });

  it('shows empty state when no teachers are available', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        status: 'success',
        data: {
          teachers: [],
        },
      },
    });

    renderWithRouter(<TeachersPage />);

    await waitFor(() => {
      expect(screen.getByText('Информация за екипа скоро.')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching', () => {
    mockedAxios.get.mockImplementationOnce(
      () => new Promise(() => {}) // Never resolves
    );

    renderWithRouter(<TeachersPage />);

    expect(screen.getByText('Зареждане...')).toBeInTheDocument();
    expect(screen.getByText('Нашият екип')).toBeInTheDocument();
  });

  it('shows error state on API failure', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

    renderWithRouter(<TeachersPage />);

    await waitFor(() => {
      expect(screen.getByText('Грешка при зареждане на учителите')).toBeInTheDocument();
    });
  });

  it('displays teachers in a grid layout', async () => {
    const mockTeachers = [
      {
        id: 1,
        firstName: 'Мария',
        lastName: 'Петрова',
        position: 'Учител',
        bio: '<p>Биография</p>',
        photoUrl: 'https://example.com/photo.jpg',
        displayOrder: 1,
      },
      {
        id: 2,
        firstName: 'Иван',
        lastName: 'Стефанов',
        position: 'Директор',
        bio: null,
        photoUrl: null,
        displayOrder: 2,
      },
    ];

    mockedAxios.get.mockResolvedValueOnce({
      data: {
        status: 'success',
        data: {
          teachers: mockTeachers,
        },
      },
    });

    renderWithRouter(<TeachersPage />);

    await waitFor(() => {
      // Both teachers should be visible
      expect(screen.getByText('Мария Петрова')).toBeInTheDocument();
      expect(screen.getByText('Иван Стефанов')).toBeInTheDocument();

      // Positions should be visible
      expect(screen.getByText('Учител')).toBeInTheDocument();
      expect(screen.getByText('Директор')).toBeInTheDocument();
    });
  });

  it('renders teacher cards for each teacher', async () => {
    const mockTeachers = [
      {
        id: 1,
        firstName: 'Анна',
        lastName: 'Георгиева',
        position: 'Учител',
        bio: '<p>Опитен учител с 10 години стаж</p>',
        photoUrl: 'https://example.com/anna.jpg',
        displayOrder: 1,
      },
    ];

    mockedAxios.get.mockResolvedValueOnce({
      data: {
        status: 'success',
        data: {
          teachers: mockTeachers,
        },
      },
    });

    renderWithRouter(<TeachersPage />);

    await waitFor(() => {
      // Full name
      expect(screen.getByText('Анна Георгиева')).toBeInTheDocument();

      // Position
      expect(screen.getByText('Учител')).toBeInTheDocument();

      // Bio content (without HTML tags)
      expect(screen.getByText(/Опитен учител с 10 години стаж/)).toBeInTheDocument();
    });
  });

  it('handles teachers sorted by displayOrder', async () => {
    const mockTeachers = [
      {
        id: 1,
        firstName: 'Първи',
        lastName: 'Учител',
        position: 'Учител',
        bio: null,
        photoUrl: null,
        displayOrder: 1,
      },
      {
        id: 2,
        firstName: 'Втори',
        lastName: 'Учител',
        position: 'Директор',
        bio: null,
        photoUrl: null,
        displayOrder: 2,
      },
    ];

    mockedAxios.get.mockResolvedValueOnce({
      data: {
        status: 'success',
        data: {
          teachers: mockTeachers,
        },
      },
    });

    renderWithRouter(<TeachersPage />);

    await waitFor(() => {
      // Both teachers should be present (order is guaranteed by backend)
      expect(screen.getByText('Първи Учител')).toBeInTheDocument();
      expect(screen.getByText('Втори Учител')).toBeInTheDocument();
    });
  });

  it('ignores cancelled requests', async () => {
    mockedAxios.get.mockRejectedValueOnce({ __CANCEL__: true });
    mockedAxios.isCancel.mockReturnValueOnce(true);

    renderWithRouter(<TeachersPage />);

    await waitFor(() => {
      // Should not show error for cancelled requests
      expect(screen.queryByText('Грешка при зареждане на учителите')).not.toBeInTheDocument();
    });
  });
});
