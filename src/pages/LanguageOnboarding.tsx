import { useState, useMemo } from 'react';
import { Server, Search, Check, ArrowRight } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { LANGUAGES } from '@/i18n/languages';
import { cn } from '@/lib/utils';

export function LanguageOnboarding() {
  const { completeOnboarding, t } = useI18n();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState('en');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return LANGUAGES.filter((l) => l.enabled);
    return LANGUAGES.filter((l) =>
      l.enabled && (
        l.nativeName.toLowerCase().includes(q) ||
        l.englishName.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q) ||
        l.locale.toLowerCase().includes(q)
      )
    );
  }, [search]);

  const handleContinue = () => {
    completeOnboarding(selected);
  };

  return (
    <div className="min-h-screen bg-base-950 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent text-base-950">
            <Server className="w-6 h-6" strokeWidth={2.5} />
          </span>
          <span className="text-sm font-bold text-base-50">
            HomeLab <span className="text-accent">Architect</span>
          </span>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-base-50 mb-2">
            {t('onboarding.title')}
          </h1>
          <p className="text-sm text-base-300">
            {t('onboarding.subtitle')}
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute inset-inline-start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('onboarding.searchPlaceholder')}
            className="w-full ps-9 pe-3 py-2.5 text-sm rounded-lg bg-base-900 border border-base-700 text-base-100 placeholder:text-base-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            aria-label={t('onboarding.searchPlaceholder')}
          />
        </div>

        {/* Language list */}
        <div className="max-h-[320px] overflow-y-auto rounded-lg border border-base-700 bg-base-900">
          {filtered.length === 0 ? (
            <p className="px-4 py-6 text-sm text-base-400 text-center">—</p>
          ) : (
            filtered.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setSelected(lang.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors border-b border-base-800 last:border-0',
                  selected === lang.id
                    ? 'bg-accent/10'
                    : 'hover:bg-base-850'
                )}
                aria-pressed={selected === lang.id}
              >
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm font-medium',
                    selected === lang.id ? 'text-accent' : 'text-base-100'
                  )}>
                    {lang.nativeName}
                  </p>
                  <p className="text-2xs text-base-400">
                    {lang.englishName}
                    {lang.direction === 'rtl' && <span className="ms-2">RTL</span>}
                  </p>
                </div>
                {selected === lang.id && (
                  <Check className="w-4 h-4 text-accent flex-shrink-0" />
                )}
              </button>
            ))
          )}
        </div>

        {/* Continue button */}
        <button
          onClick={handleContinue}
          className="w-full mt-6 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-lg bg-accent text-base-950 hover:bg-accent-400 transition-colors"
        >
          {t('onboarding.continue')}
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
}
