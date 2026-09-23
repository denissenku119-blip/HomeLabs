import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/i18n/I18nContext';

interface DeleteProjectDialogProps {
  open: boolean;
  projectName?: string;
  error?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteProjectDialog({
  open,
  projectName,
  error,
  onCancel,
  onConfirm,
}: DeleteProjectDialogProps) {
  const { t } = useI18n();
  return (
    <Modal open={open} onClose={onCancel} title={t('dialog.delete.title')} size="sm">
      <p className="text-sm text-base-200">
        {t('dialog.delete.description', { name: projectName ? ` “${projectName}”` : '' })}
      </p>
      {error && (
        <p className="mt-3 text-xs text-danger-400" role="alert">
          {error}
        </p>
      )}
      <div className="mt-6 flex items-center justify-end gap-3">
        <Button variant="secondary" size="sm" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button variant="danger" size="sm" onClick={onConfirm}>
          {t('common.delete')}
        </Button>
      </div>
    </Modal>
  );
}
