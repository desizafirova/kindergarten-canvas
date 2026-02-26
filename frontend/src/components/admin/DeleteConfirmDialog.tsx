import { AlertTriangle, Loader2 } from 'lucide-react';
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

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  itemTitle: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * DeleteConfirmDialog - Reusable confirmation dialog for destructive delete actions.
 *
 * Features:
 * - Displays item title and warning message in Bulgarian
 * - Cancel button (secondary, default focus) and Delete button (destructive red)
 * - Loading spinner when isDeleting is true
 * - Focus trap and escape key handling via Radix Dialog
 * - ARIA labels for accessibility
 */
export function DeleteConfirmDialog({
  isOpen,
  itemTitle,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  const t = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isDeleting && onCancel()}>
      <DialogContent
        className="sm:max-w-[425px]"
        aria-describedby="delete-dialog-description"
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" aria-hidden="true" />
            </div>
            <DialogTitle className="text-left">
              Изтриване на новина
            </DialogTitle>
          </div>
          <DialogDescription id="delete-dialog-description" className="text-left pt-4">
            Сигурни ли сте, че искате да изтриете <strong className="font-semibold text-gray-900">"{itemTitle}"</strong>?
            <br />
            <span className="text-red-600 font-medium mt-2 block">
              Това действие не може да бъде отменено.
            </span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isDeleting}
            autoFocus
            aria-label="Отказ от изтриване"
          >
            {t.buttons.cancel}
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            aria-label={`Потвърди изтриване на ${itemTitle}`}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                Изтриване...
              </>
            ) : (
              <>{t.buttons.delete}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
