import { format } from 'date-fns';
import { bg } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  imageUrl: string | null;
  publishedAt?: Date | null;
}

/**
 * PreviewModal - Preview component for news content.
 *
 * Shows how news will appear on the public website before publishing.
 * Features responsive layout (full-screen mobile, centered desktop),
 * Bulgarian date formatting, and proper accessibility attributes.
 */
export function PreviewModal({
  isOpen,
  onClose,
  title,
  content,
  imageUrl,
  publishedAt,
}: PreviewModalProps) {
  const t = useTranslation();

  // Format date in Bulgarian (dd.MM.yyyy)
  const formattedDate = publishedAt
    ? format(publishedAt, 'dd.MM.yyyy', { locale: bg })
    : format(new Date(), 'dd.MM.yyyy', { locale: bg }) + ' (Чернова)';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="h-full w-full sm:max-w-[800px] sm:h-auto overflow-y-auto"
        closeLabel={t.previewModal.close}
      >
        <DialogHeader>
          <DialogTitle>
            {t.previewModal.previewOf} {title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t.previewModal.description}
          </DialogDescription>
        </DialogHeader>

        {/* Preview content styled like public site */}
        <div className="space-y-4 py-4">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={title}
              className="aspect-video object-cover rounded-lg w-full"
            />
          )}

          <p className="text-sm text-gray-600">{formattedDate}</p>

          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>

          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            {t.previewModal.close}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
