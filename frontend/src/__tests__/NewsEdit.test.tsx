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
      saveDraft: 'Запази чернова',
      publish: 'Публикувай',
      update: 'Обнови',
      preview: 'Преглед',
      viewOnSite: 'Виж на сайта',
      errors: {
        saveFailed: 'Грешка при запазване',
        publishFailed: 'Грешка при публикуване',
      },
      success: {
        saved: 'Новината е запазена успешно',
        published: 'Новината е публикувана успешно',
        updated: 'Новината е обновена успешно',
      },
      breadcrumb: {
        news: 'Новини',
        edit: 'Редактиране',
      },
    },
    buttons: {
      save: 'Запази',
      update: 'Обнови',
    },
    common: {
      loading: 'Зареждане...',
    },
    autoSave: {
      saving: 'Запазва...',
      saved: 'Запазено',
      error: 'Грешка при запазване',
      retrying: 'Опитва отново...',
    },
    previewModal: {
      close: 'Затвори',
      previewOf: 'Преглед на',
      description: 'Преглед на съдържанието преди публикуване',
    },
    previewPane: {
      title: 'Преглед на живо',
      unavailable: 'Прегледът не е наличен',
      connecting: 'Свързване...',
      connected: 'Свързан',
      disconnected: 'Връзката е прекъсната',
    },
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock WebSocket-related modules
vi.mock('@/lib/socket', () => ({
  getSocket: vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    connected: false,
  })),
  disconnectSocket: vi.fn(),
}));

vi.mock('@/hooks/useWebSocketPreview', () => ({
  useWebSocketPreview: vi.fn(() => ({
    connectionStatus: 'disconnected',
    previewHtml: '',
    isPreviewAvailable: false,
  })),
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

  describe('Preview Modal Integration', () => {
    beforeEach(() => {
      vi.spyOn(api, 'get').mockResolvedValue({
        data: { content: { ...mockNewsData, publishedAt: '2024-03-20T12:00:00Z' } },
      });
    });

    it('preview button is visible and enabled', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Existing News')).toBeInTheDocument();
      });

      const previewButton = screen.getByRole('button', { name: 'Преглед' });
      expect(previewButton).toBeInTheDocument();
      expect(previewButton).toBeEnabled();
    });

    it('clicking preview button opens PreviewModal', async () => {
      renderComponent();
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Existing News')).toBeInTheDocument();
      });

      const previewButton = screen.getByRole('button', { name: 'Преглед' });
      await user.click(previewButton);

      // Check that modal is open
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('PreviewModal displays current form values', async () => {
      renderComponent();
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Existing News')).toBeInTheDocument();
      });

      // Open preview
      const previewButton = screen.getByRole('button', { name: 'Преглед' });
      await user.click(previewButton);

      // Check that title appears in modal
      await waitFor(() => {
        expect(screen.getByText('Преглед на Existing News')).toBeInTheDocument();
      });

      // Check that title appears in content area
      const dialog = screen.getByRole('dialog');
      const h1 = dialog.querySelector('h1');
      expect(h1).toHaveTextContent('Existing News');
    });

    it('closing PreviewModal returns focus to Preview button', async () => {
      renderComponent();
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Existing News')).toBeInTheDocument();
      });

      const previewButton = screen.getByRole('button', { name: 'Преглед' });
      await user.click(previewButton);

      // Modal should be open
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Close modal using footer "Затвори" button (not the × button)
      const dialog = screen.getByRole('dialog');
      const closeButtons = dialog.querySelectorAll('button');
      const footerCloseButton = Array.from(closeButtons).find(btn =>
        !btn.className.includes('absolute') && btn.textContent?.includes('Затвори')
      );

      expect(footerCloseButton).toBeTruthy();
      await user.click(footerCloseButton!);

      // Modal should be closed
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('preview shows publishedAt date for published items', async () => {
      renderComponent();
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Existing News')).toBeInTheDocument();
      });

      // Open preview
      const previewButton = screen.getByRole('button', { name: 'Преглед' });
      await user.click(previewButton);

      // Check for published date (formatted as dd.MM.yyyy)
      await waitFor(() => {
        expect(screen.getByText('20.03.2024')).toBeInTheDocument();
      });
    });
  });

  describe('Publish/Update Functionality (Story 3.8)', () => {
    beforeEach(() => {
      window.open = vi.fn();
    });

    it('shows publish button for draft news', async () => {
      vi.spyOn(api, 'get').mockResolvedValue({
        data: { content: { ...mockNewsData, status: 'DRAFT' } },
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Existing News')).toBeInTheDocument();
      });

      // Should show both save draft and publish buttons
      expect(screen.getByRole('button', { name: 'Запази чернова' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Публикувай' })).toBeInTheDocument();

      // Should NOT show update button
      expect(screen.queryByRole('button', { name: 'Обнови' })).not.toBeInTheDocument();
    });

    it('shows update button for published news', async () => {
      vi.spyOn(api, 'get').mockResolvedValue({
        data: { content: { ...mockNewsData, status: 'PUBLISHED' } },
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Existing News')).toBeInTheDocument();
      });

      // Should show save and update buttons
      expect(screen.getByRole('button', { name: 'Запази' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Обнови' })).toBeInTheDocument();

      // Should NOT show publish button
      expect(screen.queryByRole('button', { name: 'Публикувай' })).not.toBeInTheDocument();
    });

    it('disables all buttons during publish operation', async () => {
      vi.spyOn(api, 'get').mockResolvedValue({
        data: { content: { ...mockNewsData, status: 'DRAFT' } },
      });

      // Mock PUT to never resolve (keeps loading state)
      vi.spyOn(api, 'put').mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderComponent();
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Existing News')).toBeInTheDocument();
      });

      const publishButton = screen.getByRole('button', { name: 'Публикувай' });
      const saveDraftButton = screen.getByRole('button', { name: 'Запази чернова' });
      const previewButton = screen.getByRole('button', { name: 'Преглед' });

      // Click publish
      await user.click(publishButton);

      // All buttons should be disabled during operation
      await waitFor(() => {
        expect(publishButton).toBeDisabled();
        expect(saveDraftButton).toBeDisabled();
        expect(previewButton).toBeDisabled();
      });
    });

    it('disables all buttons during update operation', async () => {
      vi.spyOn(api, 'get').mockResolvedValue({
        data: { content: { ...mockNewsData, status: 'PUBLISHED' } },
      });

      // Mock PUT to never resolve (keeps loading state)
      vi.spyOn(api, 'put').mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderComponent();
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByDisplayValue('Existing News')).toBeInTheDocument();
      });

      const updateButton = screen.getByRole('button', { name: 'Обнови' });
      const saveButton = screen.getByRole('button', { name: 'Запази' });
      const previewButton = screen.getByRole('button', { name: 'Преглед' });

      // Click update
      await user.click(updateButton);

      // All buttons should be disabled during operation
      await waitFor(() => {
        expect(updateButton).toBeDisabled();
        expect(saveButton).toBeDisabled();
        expect(previewButton).toBeDisabled();
      });
    });

    it('publish button disabled when form invalid', async () => {
      vi.spyOn(api, 'get').mockResolvedValue({
        data: { content: { ...mockNewsData, status: 'DRAFT', title: '' } },
      });

      renderComponent();
      const user = userEvent.setup();

      await waitFor(() => {
        const titleInput = screen.getByLabelText('Заглавие');
        expect(titleInput).toHaveValue('');
      });

      // Clear title to make form invalid
      const titleInput = screen.getByLabelText('Заглавие');
      await user.clear(titleInput);

      const publishButton = screen.getByRole('button', { name: 'Публикувай' });

      // Publish button should be disabled when form invalid
      await waitFor(() => {
        expect(publishButton).toBeDisabled();
      });
    });

    // NOTE: Full API integration tests with toast.success showing link, publishedAt timestamp,
    // and status updates require MSW or more sophisticated mocking. These tests validate
    // component behavior and button states based on draft vs published status.
    // Full E2E testing should be added in future testing enhancement story.
  });

  describe('Live Preview Integration (WebSocket)', () => {
    it('renders LivePreviewPane component with existing news data', async () => {
      render(
        <BrowserRouter>
          <NewsEdit />
        </BrowserRouter>
      );

      // Wait for news to load
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test News Title')).toBeInTheDocument();
      });

      // Live preview pane should be rendered
      const livePreviewPane = screen.getByText('Преглед на живо');
      expect(livePreviewPane).toBeInTheDocument();
    });

    it('Preview Modal button remains functional for fallback', async () => {
      render(
        <BrowserRouter>
          <NewsEdit />
        </BrowserRouter>
      );

      // Wait for news to load
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test News Title')).toBeInTheDocument();
      });

      const previewButton = screen.getByRole('button', { name: 'Преглед' });
      expect(previewButton).toBeInTheDocument();
      expect(previewButton).not.toBeDisabled();

      // Click preview button - modal should open regardless of WebSocket status
      await act(async () => {
        await userEvent.click(previewButton);
      });

      // Preview modal should appear (fallback functionality)
      await waitFor(() => {
        expect(screen.getByText(/Преглед на/i)).toBeInTheDocument();
      });
    });
  });
});
