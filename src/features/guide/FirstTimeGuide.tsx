import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Compass, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { hasSeenGuide, markGuideSeen, useGuideOpenRequests } from '@/features/guide/guideStore';
import { useI18n } from '@/i18n/I18nContext';

interface GuideStep {
  title: string;
  body: string;
}

export function FirstTimeGuide() {
  const { t } = useI18n();
  const STEPS: GuideStep[] = Array.from({ length: 9 }, (_, index) => ({
    title: t(`guide.${index + 1}.title`),
    body: t(`guide.${index + 1}.body`),
  }));
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!hasSeenGuide()) {
      setStep(0);
      setOpen(true);
    }
  }, []);

  useGuideOpenRequests(() => {
    setStep(0);
    setOpen(true);
  });

  const close = () => {
    markGuideSeen();
    setOpen(false);
  };

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <Modal open={open} onClose={close} size="md">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-accent/15 text-accent">
              <Compass className="w-4.5 h-4.5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-base-50">{t('guide.title')}</h2>
              <p className="text-2xs text-base-400">
                {t('guide.stepCount', { current: step + 1, total: STEPS.length })}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label={t('guide.close')}
            className="p-1.5 rounded-md text-base-400 hover:text-base-100 hover:bg-base-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="rounded-xl border border-base-700 bg-base-850 p-4">
          <h3 className="text-sm font-semibold text-base-50">{current?.title}</h3>
          <p className="text-xs text-base-300 mt-1.5 leading-relaxed">{current?.body}</p>
        </div>

        <div className="flex items-center gap-1">
          {STEPS.map((s, index) => (
            <span
              key={s.title}
              className={
                index === step
                  ? 'h-1 flex-1 rounded-full bg-accent'
                  : 'h-1 flex-1 rounded-full bg-base-700'
              }
            />
          ))}
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2">
          <Button variant="ghost" onClick={close}>
            {t('guide.skip')}
          </Button>
          <div className="flex gap-2 sm:justify-end">
            {step > 0 && (
              <Button
                variant="ghost"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
              >
                {t('common.back')}
              </Button>
            )}
            <Button
              rightIcon={!isLast ? <ArrowRight className="w-4 h-4" /> : undefined}
              onClick={() => (isLast ? close() : setStep((s) => s + 1))}
            >
              {isLast ? t('guide.start') : t('common.next')}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
