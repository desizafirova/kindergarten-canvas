/**
 * NewsEdit Component Integration Tests
 * Tests auto-save functionality, data loading, and update workflow
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { NewsEdit } from '@/pages/admin/NewsEdit';
import api from '@/lib/api';

// Mock dependencies
vi.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    newsForm: {
      titleLabel: 'Заглавие',
      titlePlaceholder: 'Въведете заглавие...',
      contentLabel: 'Съдържание',
      imageLabel: 'Изображение (по избор)',
      update: 'Обнови',
      errors: {
        saveFailed: 'Грешка при запазване',
      },
      success: {
        updated: 'Новината е обновена успешно',
      },
      breadcrumb: {
        news: 'Новини',
        edit: 'Редактиране',
      },
    },
    autoSave: {
      saving: 'Запазва...',
      saved: 'Запазено',
      error: 'Грешка при запазване',
      retrying: 'Опитва отново...',
    },
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockNewsData = {
  id: 1,
  title: 'Existing News',
  content: '<p>Existing content</p>',
  imageUrl: 'https://example.com/image.jpg',
  status: 'DRAFT',
  createdAt: '2024-03-15T10:00:00Z',
  updatedAt: '2024-03-15T10:00:00Z',
};

const renderComponent = (newsId = '1') => {
  return render(
    <MemoryRouter initialEntries={[`/admin/news/${newsId}/edit`]}>
      <Routes>
        <Route path="/admin/news/:id/edit" element={<NewsEdit />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('NewsEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Data Loading', () => {
    it('loads news data before starting auto-save', async () => {
      const mockGet = vi.spyOn(api, 'get').mockResolvedValue({
        data: { content: mockNewsData },
      });

      renderComponent();

      // Should show loading state
      expect(screen.getByText('Зареждане...')).toBeInTheDocument();

      // Wait for data to load
      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledWith('/api/admin/v1/news/1');
        expect(screen.getByDisplayValue('Existing News')).toBeInTheDocument();
      });
    });

    it('does not show auto-save indicator during loading', async () => {
      vi.spyOn(api, 'get').mockResolvedValue({
        data: { content: mockNewsData },
      });

      renderComponent();

      // During loading, no auto-save indicator
      expect(screen.queryByText('Запазва...')).not.toBeInTheDocument();
      expect(screen.queryByText('Запазено')).not.toBeInTheDocument();

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByDisplayValue('Existing News')).toBeInTheDocument();
      });
    });
  });

  describe('Auto-Save Functionality', () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      // Mock GET to load initial data
      vi.spyOn(api, 'get').mockResolvedValue({
        data: { content: mockNewsData },
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.useRealTimers();
    });

    it('triggers auto-save after typing changes', async () => {
      const mockPut = vi.spyOn(api, 'put').mockResolvedValue({});

      renderComponent();

      // Wait for data to load - need to advance timers for async operations
      await vi.waitFor(() => {
        expect(screen.getByDisplayValue('Existing News')).toBeInTheDocument();
      });

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const titleInput = screen.getByLabelText('Заглавие');

      // Make a change
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated News');

      // Fast-forward 10 seconds
      await act(async () => {
        vi.advanceTimersByTime(10000);
      });

      // Should trigger auto-save with PUT
      await vi.waitFor(() => {
        expect(mockPut).toHaveBeenCalledWith('/api/admin/v1/news/1', expect.objectContaining({
          title: 'Updated News',
        }));
      });
    });

    it('auto-save uses PUT not POST', async () => {
      const mockPost = vi.spyOn(api, 'post');
      const mockPut = vi.spyOn(api, 'put').mockResolvedValue({});

      renderComponent();

      await vi.waitFor(() => {
        expect(screen.getByDisplayValue('Existing News')).toBeInTheDocument();
      });

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const titleInput = screen.getByLabelText('Заглавие');

      await user.clear(titleInput);
      await user.type(titleInput, 'Changed Title');

      await act(async () => {
        vi.advanceTimersByTime(10000);
      });

      await vi.waitFor(() => {
        expect(mockPut).toHaveBeenCalled();
        expect(mockPost).not.toHaveBeenCalled();
      });
    });

    it('auto-save preserves original status (DRAFT)', async () => {
      const mockPut = vi.spyOn(api, 'put').mockResolvedValue({});

      renderComponent();

      await vi.waitFor(() => {
        expect(screen.getByDisplayValue('Existing News')).toBeInTheDocument();
      });

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const titleInput = screen.getByLabelText('Заглавие');

      await user.clear(titleInput);
      await user.type(titleInput, 'Modified');

      await act(async () => {
        vi.advanceTimersByTime(10000);
      });

      await vi.waitFor(() => {
        expect(mockPut).toHaveBeenCalledWith('/api/admin/v1/news/1', expect.objectContaining({
          status: 'DRAFT', // Should preserve original status
        }));
      });
    });

    it('auto-save preserves PUBLISHED status', async () => {
      vi.spyOn(api, 'get').mockResolvedValue({
        data: { content: { ...mockNewsData, status: 'PUBLISHED' } },
      });
      const mockPut = vi.spyOn(api, 'put').mockResolvedValue({});

      renderComponent();

      await vi.waitFor(() => {
        expect(screen.getByDisplayValue('Existing News')).toBeInTheDocument();
      });

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const titleInput = screen.getByLabelText('Заглавие');

      await user.clear(titleInput);
      await user.type(titleInput, 'Modified');

      await act(async () => {
        vi.advanceTimersByTime(10000);
      });

      await vi.waitFor(() => {
        expect(mockPut).toHaveBeenCalledWith('/api/admin/v1/news/1', expect.objectContaining({
          status: 'PUBLISHED', // Should preserve PUBLISHED status
        }));
      });
    });

    it('auto-save indicator shows correct states', async () => {
      // Use a controlled promise to pause the save operation
      let resolveSave: () => void;
      vi.spyOn(api, 'put').mockImplementation(
        () => new Promise((resolve) => { resolveSave = () => resolve({} as any); })
      );

      renderComponent();

      await vi.waitFor(() => {
        expect(screen.getByDisplayValue('Existing News')).toBeInTheDocument();
      });

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const titleInput = screen.getByLabelText('Заглавие');

      // Initially no indicator
      expect(screen.queryByText('Запазва...')).not.toBeInTheDocument();

      await user.clear(titleInput);
      await user.type(titleInput, 'Testing');

      await act(async () => {
        vi.advanceTimersByTime(10000);
      });

      // Should show saving (save is still pending)
      await vi.waitFor(() => {
        expect(screen.getByText('Запазва...')).toBeInTheDocument();
      });

      // Resolve the save
      await act(async () => {
        resolveSave!();
      });

      // Should show saved
      await vi.waitFor(() => {
        expect(screen.getByText('Запазено')).toBeInTheDocument();
      });

      // Should fade out
      await act(async () => {
        vi.advanceTimersByTime(3500);
      });

      await vi.waitFor(() => {
        expect(screen.queryByText('Запазено')).not.toBeInTheDocument();
      });
    });

    it('beforeunload handler works correctly during saving', async () => {
      let resolveSave: () => void;
      vi.spyOn(api, 'put').mockImplementation(
        () => new Promise((resolve) => { resolveSave = resolve as () => void; })
      );

      renderComponent();

      await vi.waitFor(() => {
        expect(screen.getByDisplayValue('Existing News')).toBeInTheDocument();
      });

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const titleInput = screen.getByLabelText('Заглавие');

      await user.clear(titleInput);
      await user.type(titleInput, 'Test');

      await act(async () => {
        vi.advanceTimersByTime(10000);
      });

      await vi.waitFor(() => {
        expect(screen.getByText('Запазва...')).toBeInTheDocument();
      });

      // Create beforeunload event
      const beforeUnloadEvent = new Event('beforeunload', { cancelable: true }) as BeforeUnloadEvent;
      Object.defineProperty(beforeUnloadEvent, 'returnValue', { writable: true });

      window.dispatchEvent(beforeUnloadEvent);

      // Should be prevented during saving
      expect(beforeUnloadEvent.defaultPrevented).toBe(true);

      // Resolve save
      await act(async () => {
        resolveSave!();
      });
    });

    it('beforeunload handler does not warn after successful save', async () => {
      vi.spyOn(api, 'put').mockResolvedValue({});

      renderComponent();

      await vi.waitFor(() => {
        expect(screen.getByDisplayValue('Existing News')).toBeInTheDocument();
      });

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const titleInput = screen.getByLabelText('Заглавие');

      await user.clear(titleInput);
      await user.type(titleInput, 'Test');

      await act(async () => {
        vi.advanceTimersByTime(10000);
      });

      await vi.waitFor(() => {
        expect(screen.getByText('Запазено')).toBeInTheDocument();
      });

      // Create beforeunload event
      const beforeUnloadEvent = new Event('beforeunload', { cancelable: true }) as BeforeUnloadEvent;
      Object.defineProperty(beforeUnloadEvent, 'returnValue', { writable: true });

      window.dispatchEvent(beforeUnloadEvent);

      // Should NOT be prevented after successful save
      expect(beforeUnloadEvent.defaultPrevented).toBe(false);
    });

    it('handles auto-save errors and shows error state', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(api, 'put').mockRejectedValue(new Error('Network error'));

      renderComponent();

      await vi.waitFor(() => {
        expect(screen.getByDisplayValue('Existing News')).toBeInTheDocument();
      });

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const titleInput = screen.getByLabelText('Заглавие');

      await user.clear(titleInput);
      await user.type(titleInput, 'Test Error');

      await act(async () => {
        vi.advanceTimersByTime(10000);
      });

      // Should show error state
      await vi.waitFor(() => {
        expect(screen.getByText('Грешка при запазване')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    it('retries save after error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockPut = vi.spyOn(api, 'put')
        .mockRejectedValueOnce(new Error('First fail'))
        .mockResolvedValueOnce({});

      renderComponent();

      await vi.waitFor(() => {
        expect(screen.getByDisplayValue('Existing News')).toBeInTheDocument();
      });

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const titleInput = screen.getByLabelText('Заглавие');

      await user.clear(titleInput);
      await user.type(titleInput, 'Retry Test');

      await act(async () => {
        vi.advanceTimersByTime(10000);
      });

      // Should show error
      await vi.waitFor(() => {
        expect(screen.getByText('Грешка при запазване')).toBeInTheDocument();
      });

      expect(mockPut).toHaveBeenCalledTimes(1);

      // Fast-forward 30 seconds for retry
      await act(async () => {
        vi.advanceTimersByTime(30000);
      });

      // Should retry and succeed
      await vi.waitFor(() => {
        expect(mockPut).toHaveBeenCalledTimes(2);
        expect(screen.getByText('Запазено')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });
});
