import { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { shareProject, buildProjectSummary } from '@/features/share/shareProject';
import type { Project } from '@/types';
import { useI18n } from '@/i18n/I18nContext';

interface ShareProjectButtonProps {
  project: Project | null;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost';
}

/**
 * Shares the current project as a readable summary. Projects are stored on the
 * device, so there is no public URL — the summary itself is what gets shared,
 * and it is always shown so the user can see exactly what was sent or copied.
 */
export function ShareProjectButton({
  project,
  size = 'sm',
  variant = 'ghost',
}: ShareProjectButtonProps) {
  const { t, langId } = useI18n();
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState('');
  const [method, setMethod] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleShare = async () => {
    if (!project || busy) return;
    setBusy(true);
    try {
      const result = await shareProject(project, langId);
      setSummary(result.text);
      setMethod(result.method);
      // Native and Web Share sheets already showed the content; the preview is
      // only opened when nothing else handled it, or after a clipboard copy.
      if (result.method !== 'native' && result.method !== 'web') setOpen(true);
    } catch {
      setSummary(buildProjectSummary(project, langId));
      setMethod('none');
      setOpen(true);
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <Button
        size={size}
        variant={variant}
        onClick={handleShare}
        disabled={!project || busy}
        aria-label={t('share.projectAria')}
        leftIcon={<Share2 className="w-3.5 h-3.5" />}
        className="min-h-[44px]"
      >
        <span className="hidden sm:inline">{t('common.share')}</span>
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title={t('share.projectTitle')}>
        <p className="text-sm text-base-300 leading-relaxed">
          {method === 'clipboard'
            ? t('share.clipboardBody')
            : t('share.summaryBody')}
        </p>
        <pre className="mt-4 max-h-[50vh] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-base-700 bg-base-850 p-3 text-xs text-base-200">
          {summary}
        </pre>
        <div className="mt-4 flex flex-wrap justify-end gap-3">
          <Button
            onClick={handleCopy}
            leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          >
            {copied ? t('common.copied') : t('share.copySummary')}
          </Button>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            {t('common.close')}
          </Button>
        </div>
      </Modal>
    </>
  );
}
