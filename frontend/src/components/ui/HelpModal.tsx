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

interface HelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpModal({ open, onOpenChange }: HelpModalProps) {
  const t = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.help.modalTitle}</DialogTitle>
          <DialogDescription className="sr-only">
            Информация за използване на административния панел
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create Content Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{t.help.sections.createContent.title}</h3>
            <p className="text-sm text-muted-foreground">
              {t.help.sections.createContent.content}
            </p>
          </div>

          {/* Publish Content Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{t.help.sections.publishContent.title}</h3>
            <p className="text-sm text-muted-foreground">
              {t.help.sections.publishContent.content}
            </p>
          </div>

          {/* Edit/Delete Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{t.help.sections.editDelete.title}</h3>
            <p className="text-sm text-muted-foreground">
              {t.help.sections.editDelete.content}
            </p>
          </div>

          {/* Support Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{t.help.sections.support.title}</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {t.help.sections.support.content}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {t.buttons.close}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
