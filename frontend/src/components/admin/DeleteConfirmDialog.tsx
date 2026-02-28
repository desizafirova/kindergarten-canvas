import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useTranslation } from '@/lib/i18n';
import { Loader2 } from 'lucide-react';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemTitle: string;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

/**
 * DeleteConfirmDialog - Reusable confirmation dialog for destructive delete actions.
 *
 * Features:
 * - Uses AlertDialog (designed specifically for confirmations)
 * - Displays item title and warning message from i18n translations
 * - Cancel button (secondary, auto-focused) and Delete button (destructive red)
 * - Loading spinner when isDeleting is true
 * - Focus trap and escape key handling via Radix AlertDialog
 * - ARIA roles for accessibility
 */
export function DeleteConfirmDialog({
  open,
  onOpenChange,
  itemTitle,
  onConfirm,
  isDeleting,
}: DeleteConfirmDialogProps) {
  const t = useTranslation();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.deleteConfirmDialog.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.deleteConfirmDialog.message}
            <span className="font-semibold block mt-2">{itemTitle}</span>
            <span className="text-muted-foreground text-xs block mt-2">
              {t.deleteConfirmDialog.confirmMessage}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel autoFocus disabled={isDeleting}>
            {t.buttons.cancel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault(); // Prevent default close behavior
              onConfirm();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t.buttons.delete}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
