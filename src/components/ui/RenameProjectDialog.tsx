import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useI18n } from '@/i18n/I18nContext';

interface RenameProjectDialogProps {
  open: boolean;
  currentName?: string;
  onCancel: () => void;
  onConfirm: (name: string) => void;
}

export function RenameProjectDialog({
  open,
  currentName,
  onCancel,
  onConfirm,
}: RenameProjectDialogProps) {
  const { t } = useI18n();
  const [value, setValue] = useState(currentName ?? '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValue(currentName ?? '');
      setError(null);
    }
  }, [open, currentName]);

  const submit = () => {
    const name = value.trim();
    if (!name) {
      setError(t('dialog.rename.required'));
      return;
    }
    if (name.length > 80) {
      setError(t('dialog.rename.max'));
      return;
    }
    onConfirm(name);
  };

  return (
    <Modal open={open} onClose={onCancel} title={t('dialog.rename.title')}>
      <div className="flex flex-col gap-4">
        <Input
          label={t('newProject.projectName')}
          value={value}
          maxLength={80}
          autoFocus
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
          error={error ?? undefined}
        />
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button onClick={submit}>{t('dialog.rename.save')}</Button>
        </div>
      </div>
    </Modal>
  );
}
