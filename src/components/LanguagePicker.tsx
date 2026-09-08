import { useState, useMemo } from 'react';
import { Search, Check, X, Globe } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { LANGUAGES } from '@/i18n/languages';
import { cn } from '@/lib/utils';

interface LanguagePickerProps {
  open: boolean;
  onClose: () => void;
}

export function LanguagePicker({ open, onClose }: LanguagePickerProps) {
  const { langId, setLanguage, t } = useI18n();
  const [search, setSearch] = useState('');
  const [pendingLang, setPendingLang] = useState(langId);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return LANGUAGES.filter((l) => l.enabled);
    return LANGUAGES.filter((l) =>
      l.enabled && (
        l.nativeName.toLowerCase().includes(q) ||
        l.englishName.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q)
      )
    );
  }, [search]);

  if (!open) return null;

  const handleConfirm = () => {
    setLanguage(pendingLang);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base-950/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border border-base-700 bg-base-900 shadow-elevated overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-base-700">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-base-100">{t('settings.changeLanguage')}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-base-400 hover:text-base-200 transition-colors"
            aria-label={t('common.close')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative px-4 py-3 border-b border-base-700">
          <Search className="absolute inset-inline-start-7 top-1/2 -translate-y-1/2 w-4 h-4 text-base-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('onboarding.searchPlaceholder')}
            className="w-full ps-9 pe-3 py-2 text-sm rounded-lg bg-base-850 border border-base-700 text-base-100 placeholder:text-base-500 focus:outline-none focus:border-accent transition-colors"
            aria-label={t('onboarding.searchPlaceholder')}
          />
        </div>

        {/* Language list */}
        <div className="max-h-[300px] overflow-y-auto">
          {filtered.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setPendingLang(lang.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors border-b border-base-800 last:border-0',
                pendingLang === lang.id ? 'bg-accent/10' : 'hover:bg-base-850'
              )}
              aria-pressed={pendingLang === lang.id}
            >
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-sm font-medium',
                  pendingLang === lang.id ? 'text-accent' : 'text-base-100'
                )}>
                  {lang.nativeName}
                </p>
                <p className="text-2xs text-base-400">
                  {lang.englishName}
                  {lang.direction === 'rtl' && <span className="ms-2 badge">{t('settings.rtl')}</span>}
                </p>
              </div>
              {pendingLang === lang.id && (
                <Check className="w-4 h-4 text-accent flex-shrink-0" />
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-base-700">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium rounded-lg text-base-300 hover:text-base-100 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-accent text-base-950 hover:bg-accent-400 transition-colors"
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
