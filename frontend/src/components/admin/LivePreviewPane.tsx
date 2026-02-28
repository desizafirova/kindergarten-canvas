/**
 * LivePreviewPane - Real-time preview component for news content
 *
 * Shows live preview of content as it's being edited via WebSocket connection.
 * Features connection status indicator, responsive layout, and graceful degradation
 * to manual preview modal if WebSocket connection fails.
 */

import { format } from 'date-fns';
import { bg } from 'date-fns/locale';
import { useTranslation } from '@/lib/i18n';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface LivePreviewPaneProps {
  connectionStatus: ConnectionStatus;
  previewHtml: string;
  isPreviewAvailable: boolean;
  title: string;
  imageUrl: string | null;
}

/**
 * LivePreviewPane component
 * @param connectionStatus - Current WebSocket connection status
 * @param previewHtml - Rendered HTML content from server
 * @param isPreviewAvailable - Whether preview is available
 * @param title - News title
 * @param imageUrl - News image URL
 */
export function LivePreviewPane({
  connectionStatus,
  previewHtml,
  isPreviewAvailable,
  title,
  imageUrl,
}: LivePreviewPaneProps) {
  const t = useTranslation();

  // Connection status badge colors
  const statusColors: Record<ConnectionStatus, string> = {
    connecting: 'bg-yellow-100 text-yellow-800',
    connected: 'bg-green-100 text-green-800',
    disconnected: 'bg-gray-100 text-gray-800',
    error: 'bg-red-100 text-red-800',
  };

  // Connection status text from translations
  const statusText: Record<ConnectionStatus, string> = {
    connecting: t.previewPane.connecting,
    connected: t.previewPane.connected,
    disconnected: t.previewPane.disconnected,
    error: t.previewPane.disconnected,
  };

  // Format date in Bulgarian (dd.MM.yyyy)
  const formattedDate = format(new Date(), 'dd.MM.yyyy', { locale: bg });

  return (
    <div className="border rounded-lg p-6 bg-white">
      {/* Header with connection status */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{t.previewPane.title}</h3>
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${statusColors[connectionStatus]}`}
        >
          {statusText[connectionStatus]}
        </span>
      </div>

      {/* Preview content or unavailable message */}
      <div
        className="border rounded-lg p-6 space-y-4"
        role="region"
        aria-live="polite"
        aria-label={t.previewPane.title}
      >
        {isPreviewAvailable ? (
          <>
            {/* Image (if provided) */}
            {imageUrl && (
              <img
                src={imageUrl}
                alt={title}
                className="aspect-video object-cover rounded-lg w-full mb-4"
              />
            )}

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>

            {/* Date */}
            <p className="text-sm text-gray-600 mb-4">{formattedDate}</p>

            {/* Content (HTML from TipTap) */}
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>{t.previewPane.unavailable}</p>
          </div>
        )}
      </div>
    </div>
  );
}
