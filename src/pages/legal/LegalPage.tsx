import { Link } from '@/lib/router-compat';
import { Server } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { BackButton } from '@/components/layout/BackButton';
import { APP_NAME } from '@/config/app';
import { legalDocuments, type LegalDocument } from '@/pages/legal/legalContent';
import { useI18n } from '@/i18n/I18nContext';
import { translateVisibleText } from '@/i18n/translate';

const otherDocs: { to: string; label: string; id: LegalDocument['id'] }[] = [
  { to: '/privacy', label: 'Privacy Policy', id: 'privacy' },
  { to: '/terms', label: 'Terms of Use', id: 'terms' },
  { to: '/disclaimer', label: 'Disclaimer', id: 'disclaimer' },
];

export function LegalPage({ docId }: { docId: LegalDocument['id'] }) {
  const { t, langId } = useI18n();
  const doc = legalDocuments[docId];
  const localize = (value: string) => translateVisibleText(value, langId);

  return (
    <div className="public-page-scroll flex flex-col">
      <header className="sticky top-0 z-40 bg-base-950/80 backdrop-blur-md border-b border-base-800 safe-top">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent text-base-950">
              <Server className="w-4.5 h-4.5" strokeWidth={2.5} />
            </span>
            <span className="text-sm font-bold text-base-50">
              HomeLab <span className="text-accent">Architect</span>
            </span>
          </Link>
          <Link to="/app">
            <Button size="sm">{t('landing.launchApp')}</Button>
          </Link>
        </div>
      </header>

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14 safe-bottom">
        <BackButton to="/about" label={t('public.backAbout')} className="mb-4" />
        <SectionHeader eyebrow={t('public.legal')} title={localize(doc.title)} description={localize(doc.summary)} />
        <p className="mt-2 text-2xs text-base-400 font-mono">
          {t('public.lastUpdated', { date: localize(doc.updated), app: APP_NAME })}
        </p>

        <div className="mt-8 flex flex-col gap-4">
          {doc.sections.map((section) => (
            <Card key={section.heading}>
              <h2 className="text-sm font-semibold text-base-50">{localize(section.heading)}</h2>
              <div className="mt-2 flex flex-col gap-2">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-sm text-base-300 leading-relaxed">
                    {localize(paragraph)}
                  </p>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          {otherDocs
            .filter((d) => d.id !== doc.id)
            .map((d) => (
              <Link
                key={d.to}
                to={d.to}
                className="inline-flex items-center rounded-lg border border-base-700 bg-base-900 px-4 py-2.5 text-sm font-medium text-base-100 hover:bg-base-800 transition-colors"
              >
                {localize(d.label)}
              </Link>
            ))}
          <Link
            to="/feedback"
            className="inline-flex items-center rounded-lg border border-base-700 bg-base-900 px-4 py-2.5 text-sm font-medium text-base-100 hover:bg-base-800 transition-colors"
          >
            {t('legal.feedback')}
          </Link>
        </div>
      </div>
    </div>
  );
}
