/**
 * NewsList Component Integration Tests
 * Tests news list rendering, filtering, edit/delete actions, and API integration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NewsList from '@/pages/admin/NewsList';
import * as useNewsHook from '@/hooks/useNews';
import { NewsStatus } from '@/types/news';
import api from '@/lib/api';
import { toast } from 'sonner';

// Mock the useNews hook
vi.mock('@/hooks/useNews');

// Mock the API
vi.mock('@/lib/api');

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock news data - using ISO string dates as returned by API
const mockNewsItems = [
  {
    id: 1,
    title: 'Прием 2026',
    content: '<p>Content...</p>',
    imageUrl: null,
    status: NewsStatus.DRAFT,
    publishedAt: null,
    createdAt: '2024-03-15T10:30:00Z',
    updatedAt: '2024-03-15T11:00:00Z',
  },
  {
    id: 2,
    title: 'Коледен концерт',
    content: '<p>Content...</p>',
    imageUrl: 'https://example.com/image.jpg',
    status: NewsStatus.PUBLISHED,
    publishedAt: '2024-03-14T09:00:00Z',
    createdAt: '2024-03-14T08:00:00Z',
    updatedAt: '2024-03-14T09:00:00Z',
  },
];

// Helper to create mock setData function
const createMockSetData = () => vi.fn();

describe('NewsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering and Loading States', () => {
    it('renders list of news items with correct data', async () => {
      vi.mocked(useNewsHook.useNews).mockReturnValue({
        data: mockNewsItems,
        loading: false,
        error: null,
        refetch: vi.fn(),
        setData: createMockSetData(),
      });

      render(
        <BrowserRouter>
          <NewsList />
        </BrowserRouter>
      );

      // Should render page title
      await waitFor(() => {
        expect(screen.getByText('Новини')).toBeInTheDocument();
      });

      // Should render subtitle
      expect(screen.getByText('Управлявайте новините на вашия уебсайт')).toBeInTheDocument();

      // Should render news items
      expect(screen.getByText('Прием 2026')).toBeInTheDocument();
      expect(screen.getByText('Коледен концерт')).toBeInTheDocument();

      // Should render status badges
      expect(screen.getByText('Чернова')).toBeInTheDocument();
      expect(screen.getByText('Публикуван')).toBeInTheDocument();

      // Should render dates in dd.MM.yyyy format
      expect(screen.getByText('15.03.2024')).toBeInTheDocument();
      expect(screen.getByText('14.03.2024')).toBeInTheDocument();
    });

    it('shows loading state with skeletons', () => {
      vi.mocked(useNewsHook.useNews).mockReturnValue({
        data: [],
        loading: true,
        error: null,
        refetch: vi.fn(),
        setData: createMockSetData(),
      });

      render(
        <BrowserRouter>
          <NewsList />
        </BrowserRouter>
      );

      // Should render skeleton loaders
      const skeletons = document.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('shows empty state when no items exist (ALL filter)', async () => {
      vi.mocked(useNewsHook.useNews).mockReturnValue({
        data: [],
        loading: false,
        error: null,
        refetch: vi.fn(),
        setData: createMockSetData(),
      });

      render(
        <BrowserRouter>
          <NewsList />
        </BrowserRouter>
      );

      // Should render empty state message for ALL filter
      await waitFor(() => {
        expect(screen.getByText('Няма новини все още. Създайте първата!')).toBeInTheDocument();
      });

      // Should render create button in empty state
      const createButtons = screen.getAllByText('Създай новина');
      expect(createButtons.length).toBeGreaterThan(0);
    });

    it('empty state has create button only in ALL filter', async () => {
      vi.mocked(useNewsHook.useNews).mockReturnValue({
        data: [],
        loading: false,
        error: null,
        refetch: vi.fn(),
        setData: createMockSetData(),
      });

      render(
        <BrowserRouter>
          <NewsList />
        </BrowserRouter>
      );

      // In ALL filter (default), empty state should have create button
      await waitFor(() => {
        expect(screen.getByText('Няма новини все още. Създайте първата!')).toBeInTheDocument();
      });

      // Should render create button in empty state for ALL filter
      const createButtons = screen.getAllByRole('button', { name: /Създай новина/i });
      // One in header, one in empty state
      expect(createButtons.length).toBe(2);
    });

    it('shows error state when API fails', async () => {
      const mockError = { message: 'Network error', isNetworkError: true, isAuthError: false } as useNewsHook.NewsError;
      vi.mocked(useNewsHook.useNews).mockReturnValue({
        data: [],
        loading: false,
        error: mockError,
        refetch: vi.fn(),
        setData: createMockSetData(),
      });

      render(
        <BrowserRouter>
          <NewsList />
        </BrowserRouter>
      );

      // Should render error message using translation
      await waitFor(() => {
        expect(screen.getByText('Грешка при зареждане на новините')).toBeInTheDocument();
      });
    });
  });

  describe('Filter Tabs', () => {
    it('renders filter tabs (All, Drafts, Published)', async () => {
      vi.mocked(useNewsHook.useNews).mockReturnValue({
        data: mockNewsItems,
        loading: false,
        error: null,
        refetch: vi.fn(),
        setData: createMockSetData(),
      });

      render(
        <BrowserRouter>
          <NewsList />
        </BrowserRouter>
      );

      // Should render all three tabs
      await waitFor(() => {
        expect(screen.getByText('Всички')).toBeInTheDocument();
        expect(screen.getByText('Чернови')).toBeInTheDocument();
        expect(screen.getByText('Публикувани')).toBeInTheDocument();
      });
    });

    it('filter tabs are clickable and functional', async () => {
      vi.mocked(useNewsHook.useNews).mockReturnValue({
        data: mockNewsItems,
        loading: false,
        error: null,
        refetch: vi.fn(),
        setData: createMockSetData(),
      });

      render(
        <BrowserRouter>
          <NewsList />
        </BrowserRouter>
      );

      // All three filter tabs should be rendered
      expect(screen.getByText('Всички')).toBeInTheDocument();
      expect(screen.getByText('Чернови')).toBeInTheDocument();
      expect(screen.getByText('Публикувани')).toBeInTheDocument();

      // Tabs should be clickable (tested by not throwing error)
      const draftsTab = screen.getByRole('tab', { name: /Чернови/i });
      fireEvent.click(draftsTab);

      // News items should still be visible after tab click
      await waitFor(() => {
        expect(screen.getByText('Прием 2026')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation and Actions', () => {
    it('navigates to edit page when Edit button is clicked', async () => {
      vi.mocked(useNewsHook.useNews).mockReturnValue({
        data: mockNewsItems,
        loading: false,
        error: null,
        refetch: vi.fn(),
        setData: createMockSetData(),
      });

      render(
        <BrowserRouter>
          <NewsList />
        </BrowserRouter>
      );

      // Click Edit button for first item
      const editButtons = await screen.findAllByText('Редактирай');
      fireEvent.click(editButtons[0]);

      // Should navigate to edit page
      expect(mockNavigate).toHaveBeenCalledWith('/admin/news/1/edit');
    });

    it('navigates to create page when Create button is clicked', async () => {
      vi.mocked(useNewsHook.useNews).mockReturnValue({
        data: mockNewsItems,
        loading: false,
        error: null,
        refetch: vi.fn(),
        setData: createMockSetData(),
      });

      render(
        <BrowserRouter>
          <NewsList />
        </BrowserRouter>
      );

      // Click Create button in header
      const createButtons = await screen.findAllByText('Създай новина');
      fireEvent.click(createButtons[0]);

      // Should navigate to create page
      expect(mockNavigate).toHaveBeenCalledWith('/admin/news/create');
    });

    it('opens delete confirmation dialog when Delete button is clicked', async () => {
      vi.mocked(useNewsHook.useNews).mockReturnValue({
        data: mockNewsItems,
        loading: false,
        error: null,
        refetch: vi.fn(),
        setData: createMockSetData(),
      });

      render(
        <BrowserRouter>
          <NewsList />
        </BrowserRouter>
      );

      // Click Delete button for first item
      const deleteButtons = await screen.findAllByText('Изтрий');
      fireEvent.click(deleteButtons[0]);

      // Should open dialog with item title
      await waitFor(() => {
        expect(screen.getByText('Изтриване на новина')).toBeInTheDocument();
        expect(screen.getByText(/Сигурни ли сте/)).toBeInTheDocument();
      });
    });
  });

  describe('Delete Functionality', () => {
    it('calls DELETE API and performs optimistic update on confirm', async () => {
      const mockRefetch = vi.fn();
      const mockSetData = vi.fn();
      vi.mocked(useNewsHook.useNews).mockReturnValue({
        data: mockNewsItems,
        loading: false,
        error: null,
        refetch: mockRefetch,
        setData: mockSetData,
      });

      vi.mocked(api.delete).mockResolvedValue({ data: { success: true } });

      render(
        <BrowserRouter>
          <NewsList />
        </BrowserRouter>
      );

      // Click Delete button
      const deleteButtons = await screen.findAllByText('Изтрий');
      fireEvent.click(deleteButtons[0]);

      // Wait for dialog to appear
      await waitFor(() => {
        expect(screen.getByText('Изтриване на новина')).toBeInTheDocument();
      });

      // Click confirm button in dialog (second "Изтрий" button - the one in AlertDialog)
      const allDeleteButtons = screen.getAllByText('Изтрий');
      const confirmButton = allDeleteButtons[allDeleteButtons.length - 1]; // Last one is in the dialog
      fireEvent.click(confirmButton);

      // Should perform optimistic update
      await waitFor(() => {
        expect(mockSetData).toHaveBeenCalled();
      });

      // Should call DELETE API
      await waitFor(() => {
        expect(api.delete).toHaveBeenCalledWith('/api/admin/v1/news/1');
      });

      // Should show success toast
      expect(toast.success).toHaveBeenCalledWith('Новината е изтрита успешно');

      // Should refetch news list
      expect(mockRefetch).toHaveBeenCalled();
    });

    it('shows error toast if delete fails', async () => {
      const mockRefetch = vi.fn();
      const mockSetData = vi.fn();
      vi.mocked(useNewsHook.useNews).mockReturnValue({
        data: mockNewsItems,
        loading: false,
        error: null,
        refetch: mockRefetch,
        setData: mockSetData,
      });

      vi.mocked(api.delete).mockRejectedValue(new Error('Delete failed'));

      render(
        <BrowserRouter>
          <NewsList />
        </BrowserRouter>
      );

      // Click Delete button
      const deleteButtons = await screen.findAllByText('Изтрий');
      fireEvent.click(deleteButtons[0]);

      // Click confirm button in dialog
      const allDeleteButtons = await screen.findAllByText('Изтрий');
      const confirmButton = allDeleteButtons[allDeleteButtons.length - 1]; // Last one is in the dialog
      fireEvent.click(confirmButton);

      // Should show error toast
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Грешка при изтриване на новината');
      });
    });

    it('closes dialog when Cancel is clicked', async () => {
      vi.mocked(useNewsHook.useNews).mockReturnValue({
        data: mockNewsItems,
        loading: false,
        error: null,
        refetch: vi.fn(),
        setData: createMockSetData(),
      });

      render(
        <BrowserRouter>
          <NewsList />
        </BrowserRouter>
      );

      // Click Delete button
      const deleteButtons = await screen.findAllByText('Изтрий');
      fireEvent.click(deleteButtons[0]);

      // Wait for dialog
      await waitFor(() => {
        expect(screen.getByText('Изтриване на новина')).toBeInTheDocument();
      });

      // Click Cancel button
      const cancelButton = screen.getByText('Отказ');
      fireEvent.click(cancelButton);

      // Dialog should close (title no longer visible)
      await waitFor(() => {
        expect(screen.queryByText(/Това действие не може да бъде отменено/)).not.toBeInTheDocument();
      });
    });

    it('loading state prevents multiple delete clicks', async () => {
      const mockRefetch = vi.fn();
      const mockSetData = vi.fn();
      let resolveDelete: () => void;
      const deletePromise = new Promise<any>((resolve) => {
        resolveDelete = () => resolve({ data: { success: true } });
      });

      vi.mocked(useNewsHook.useNews).mockReturnValue({
        data: mockNewsItems,
        loading: false,
        error: null,
        refetch: mockRefetch,
        setData: mockSetData,
      });

      vi.mocked(api.delete).mockReturnValue(deletePromise);

      render(
        <BrowserRouter>
          <NewsList />
        </BrowserRouter>
      );

      // Click Delete button to open dialog
      const deleteButtons = await screen.findAllByText('Изтрий');
      fireEvent.click(deleteButtons[0]);

      // Wait for dialog to appear
      await waitFor(() => {
        expect(screen.getByText('Изтриване на новина')).toBeInTheDocument();
      });

      // Get the confirm button in dialog (use alertdialog role to scope the search)
      const dialog = screen.getByRole('alertdialog');
      const confirmButton = within(dialog).getByRole('button', { name: /изтрий/i });
      const cancelButton = within(dialog).getByRole('button', { name: /отказ/i });

      // Click confirm button
      fireEvent.click(confirmButton);

      // While deletion is in progress, dialog buttons should be disabled
      await waitFor(() => {
        expect(confirmButton).toBeDisabled();
      });

      // Cancel button should also be disabled
      expect(cancelButton).toBeDisabled();

      // API should be called only once (multiple clicks prevented by disabled state)
      expect(api.delete).toHaveBeenCalledTimes(1);

      // Resolve the delete operation
      resolveDelete!();

      // Wait for operation to complete
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels on action buttons', async () => {
      vi.mocked(useNewsHook.useNews).mockReturnValue({
        data: mockNewsItems,
        loading: false,
        error: null,
        refetch: vi.fn(),
        setData: createMockSetData(),
      });

      render(
        <BrowserRouter>
          <NewsList />
        </BrowserRouter>
      );

      // Should have ARIA labels with item titles
      await waitFor(() => {
        expect(screen.getByLabelText('Редактирай: Прием 2026')).toBeInTheDocument();
        expect(screen.getByLabelText('Изтрий: Прием 2026')).toBeInTheDocument();
      });
    });

    it('has role="list" on news list container', async () => {
      vi.mocked(useNewsHook.useNews).mockReturnValue({
        data: mockNewsItems,
        loading: false,
        error: null,
        refetch: vi.fn(),
        setData: createMockSetData(),
      });

      render(
        <BrowserRouter>
          <NewsList />
        </BrowserRouter>
      );

      // Should have list role
      await waitFor(() => {
        const listElement = screen.getByRole('list', { name: /Списък с новини/ });
        expect(listElement).toBeInTheDocument();
      });
    });

    it('has ARIA live region for announcements', async () => {
      vi.mocked(useNewsHook.useNews).mockReturnValue({
        data: mockNewsItems,
        loading: false,
        error: null,
        refetch: vi.fn(),
        setData: createMockSetData(),
      });

      render(
        <BrowserRouter>
          <NewsList />
        </BrowserRouter>
      );

      // Should have ARIA live region
      const liveRegion = document.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
    });

    it('rows are keyboard focusable', async () => {
      vi.mocked(useNewsHook.useNews).mockReturnValue({
        data: mockNewsItems,
        loading: false,
        error: null,
        refetch: vi.fn(),
        setData: createMockSetData(),
      });

      render(
        <BrowserRouter>
          <NewsList />
        </BrowserRouter>
      );

      // Wait for items to render
      await waitFor(() => {
        expect(screen.getByText('Прием 2026')).toBeInTheDocument();
      });

      // Rows should have tabIndex=0 for keyboard navigation
      const listItems = document.querySelectorAll('[role="listitem"]');
      expect(listItems.length).toBe(2);
      listItems.forEach(item => {
        expect(item.getAttribute('tabIndex')).toBe('0');
      });
    });
  });
});
