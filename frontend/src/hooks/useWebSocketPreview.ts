/**
 * Custom hook for WebSocket-powered real-time preview
 * Manages connection state, debounced updates, and preview rendering
 */

import { useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { getSocket, disconnectSocket } from '@/lib/socket';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface PreviewData {
  title: string;
  content: string;
  imageUrl: string | null;
}

interface UseWebSocketPreviewReturn {
  connectionStatus: ConnectionStatus;
  previewHtml: string;
  isPreviewAvailable: boolean;
}

/**
 * Hook to manage WebSocket connection and real-time preview updates
 * @param formValues - Current form values (title, content, imageUrl)
 * @returns Connection status, preview HTML, and availability flag
 */
export function useWebSocketPreview(formValues: PreviewData): UseWebSocketPreviewReturn {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [isPreviewAvailable, setIsPreviewAvailable] = useState(false);

  // Initialize socket connection on mount
  useEffect(() => {
    const socket = getSocket();

    setConnectionStatus('connecting');
    socket.connect();

    // Connection event handlers
    const handleConnect = () => {
      setConnectionStatus('connected');
      setIsPreviewAvailable(true);
    };

    const handleConnectError = () => {
      setConnectionStatus('error');
      setIsPreviewAvailable(false);
    };

    const handleDisconnect = () => {
      setConnectionStatus('disconnected');
      setIsPreviewAvailable(false);
    };

    // Listen for preview renders from server
    const handlePreviewRender = (data: { newsId: string | null; renderedHtml: string }) => {
      setPreviewHtml(data.renderedHtml);
    };

    // Attach event listeners
    socket.on('connect', handleConnect);
    socket.on('connect_error', handleConnectError);
    socket.on('disconnect', handleDisconnect);
    socket.on('preview:render', handlePreviewRender);

    // Cleanup on unmount
    return () => {
      socket.off('connect', handleConnect);
      socket.off('connect_error', handleConnectError);
      socket.off('disconnect', handleDisconnect);
      socket.off('preview:render', handlePreviewRender);
      disconnectSocket();
    };
  }, []);

  // Debounced preview update (100ms delay)
  const debouncedEmitPreview = useDebouncedCallback((data: PreviewData) => {
    const socket = getSocket();
    if (socket.connected) {
      socket.emit('preview:update', {
        newsId: null,
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl,
      });
    }
  }, 100);

  // Emit preview update when form values change
  useEffect(() => {
    if (connectionStatus === 'connected') {
      debouncedEmitPreview(formValues);
    }
    // Cleanup: cancel pending debounced calls to prevent delayed events after unmount
    return () => {
      debouncedEmitPreview.cancel();
    };
  }, [formValues.title, formValues.content, formValues.imageUrl, connectionStatus, debouncedEmitPreview]);

  return {
    connectionStatus,
    previewHtml,
    isPreviewAvailable,
  };
}
