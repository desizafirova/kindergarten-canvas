/**
 * Unit tests for useWebSocketPreview hook
 * Tests WebSocket connection, debouncing, and preview updates
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useWebSocketPreview } from '@/hooks/useWebSocketPreview';

// Mock Socket.io client
const mockSocket = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  connected: false,
};

vi.mock('@/lib/socket', () => ({
  getSocket: vi.fn(() => mockSocket),
  disconnectSocket: vi.fn(() => {
    mockSocket.disconnect();
  }),
}));

describe('useWebSocketPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSocket.connected = false;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('connects socket on mount and disconnects on unmount', async () => {
    const { result, unmount } = renderHook(() =>
      useWebSocketPreview({ title: 'Test', content: '<p>Test</p>', imageUrl: null })
    );

    // Should connect on mount
    expect(mockSocket.connect).toHaveBeenCalledTimes(1);
    expect(result.current.connectionStatus).toBe('connecting');

    // Simulate connection success
    act(() => {
      const connectHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'connect'
      )?.[1];
      connectHandler?.();
    });

    await waitFor(() => {
      expect(result.current.connectionStatus).toBe('connected');
      expect(result.current.isPreviewAvailable).toBe(true);
    });

    // Should disconnect on unmount
    unmount();

    expect(mockSocket.off).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockSocket.off).toHaveBeenCalledWith('connect_error', expect.any(Function));
    expect(mockSocket.off).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(mockSocket.off).toHaveBeenCalledWith('preview:render', expect.any(Function));
    expect(mockSocket.disconnect).toHaveBeenCalled();
  });

  it('sets error state on connection failure', async () => {
    const { result } = renderHook(() =>
      useWebSocketPreview({ title: 'Test', content: '<p>Test</p>', imageUrl: null })
    );

    // Simulate connection error
    act(() => {
      const errorHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'connect_error'
      )?.[1];
      errorHandler?.();
    });

    await waitFor(() => {
      expect(result.current.connectionStatus).toBe('error');
      expect(result.current.isPreviewAvailable).toBe(false);
    });
  });

  it('updates preview HTML when preview:render event received', async () => {
    const { result } = renderHook(() =>
      useWebSocketPreview({ title: 'Test', content: '<p>Test</p>', imageUrl: null })
    );

    // Simulate connection
    act(() => {
      const connectHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'connect'
      )?.[1];
      connectHandler?.();
    });

    // Simulate preview:render event
    act(() => {
      const renderHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'preview:render'
      )?.[1];
      renderHandler?.({ newsId: null, renderedHtml: '<p>Rendered content</p>' });
    });

    await waitFor(() => {
      expect(result.current.previewHtml).toBe('<p>Rendered content</p>');
    });
  });

  it('emits preview:update event when connected and form values change', async () => {
    mockSocket.connected = true;

    const { result, rerender } = renderHook(
      ({ formValues }) => useWebSocketPreview(formValues),
      {
        initialProps: {
          formValues: { title: 'Test', content: '<p>Test</p>', imageUrl: null },
        },
      }
    );

    // Simulate connection
    act(() => {
      const connectHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'connect'
      )?.[1];
      connectHandler?.();
    });

    await waitFor(() => {
      expect(result.current.connectionStatus).toBe('connected');
    });

    // Update form values
    act(() => {
      rerender({
        formValues: { title: 'New Title', content: '<p>New content</p>', imageUrl: null },
      });
    });

    // Wait for debounce (100ms) + buffer
    await waitFor(
      () => {
        expect(mockSocket.emit).toHaveBeenCalledWith('preview:update', {
          newsId: null,
          title: 'New Title',
          content: '<p>New content</p>',
          imageUrl: null,
        });
      },
      { timeout: 200 }
    );
  });

  it('sets disconnected state when socket disconnects', async () => {
    const { result } = renderHook(() =>
      useWebSocketPreview({ title: 'Test', content: '<p>Test</p>', imageUrl: null })
    );

    // Simulate connection
    act(() => {
      const connectHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'connect'
      )?.[1];
      connectHandler?.();
    });

    await waitFor(() => {
      expect(result.current.connectionStatus).toBe('connected');
    });

    // Simulate disconnection
    act(() => {
      const disconnectHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'disconnect'
      )?.[1];
      disconnectHandler?.();
    });

    await waitFor(() => {
      expect(result.current.connectionStatus).toBe('disconnected');
      expect(result.current.isPreviewAvailable).toBe(false);
    });
  });

  it('does not emit preview:update when not connected', async () => {
    mockSocket.connected = false;

    const { rerender } = renderHook(
      ({ formValues }) => useWebSocketPreview(formValues),
      {
        initialProps: {
          formValues: { title: 'Test', content: '<p>Test</p>', imageUrl: null },
        },
      }
    );

    // Update form values while not connected
    act(() => {
      rerender({
        formValues: { title: 'New Title', content: '<p>New content</p>', imageUrl: null },
      });
    });

    // Wait for debounce + buffer
    await waitFor(
      () => {
        expect(mockSocket.emit).not.toHaveBeenCalledWith('preview:update', expect.anything());
      },
      { timeout: 200 }
    );
  });
});
