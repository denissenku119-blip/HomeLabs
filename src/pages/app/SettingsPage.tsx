import { useState, useEffect } from 'react';
import { Save, Globe, ChevronRight } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { CurrencySelect } from '@/components/CurrencySelect';
import { LanguagePicker } from '@/components/LanguagePicker';
import { APP_VERSION } from '@/config/app';
import { useI18n } from '@/i18n/I18nContext';
import { getLanguage } from '@/i18n/languages';

const voltageOptions = [
  { value: '120', label: '120V (North America)' },
  { value: '230', label: '230V (Europe / Asia)' },
];

const SETTINGS_KEY = 'homelab-architect:settings';

interface AppSettings {
  defaultCurrency: string;
  defaultVoltage: string;
  electricityRate: string;
}

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw) as AppSettings;
  } catch {
    // fail silently
  }
  return { defaultCurrency: 'USD', defaultVoltage: '120', electricityRate: '0.15' };
}

function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // fail silently
  }
}

export function SettingsPage() {
  const { t, langId } = useI18n();
  const [currency, setCurrency] = useState('USD');
  const [voltage, setVoltage] = useState('120');
  const [electricityRate, setElectricityRate] = useState('0.15');
  const [saved, setSaved] = useState(false);
  const [langPickerOpen, setLangPickerOpen] = useState(false);

  const currentLang = getLanguage(langId);

  useEffect(() => {
    const s = loadSettings();
    setCurrency(s.defaultCurrency);
    setVoltage(s.defaultVoltage);
    setElectricityRate(s.electricityRate);
  }, []);

  const handleSave = () => {
    saveSettings({
      defaultCurrency: currency,
      defaultVoltage: voltage,
      electricityRate: electricityRate || '0.15',
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setCurrency('USD');
    setVoltage('120');
    setElectricityRate('0.15');
  };

  return (
    <AppShell>
      <LanguagePicker open={langPickerOpen} onClose={() => setLangPickerOpen(false)} />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <SectionHeader
          title={t('settings.title')}
          description={t('settings.description')}
        />

        <div className="mt-8 flex flex-col gap-6">
          {/* Language */}
          <Card>
            <h3 className="text-sm font-semibold text-base-100 mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-accent" />
              {t('settings.language')}
            </h3>
            <button
              onClick={() => setLangPickerOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-base-850 border border-base-700 hover:border-base-600 transition-colors text-left"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-base-100">
                  {currentLang?.nativeName ?? 'English'}
                </p>
                <p className="text-2xs text-base-400">
                  {currentLang?.englishName}
                </p>
              </div>
              <span className="text-2xs text-accent font-medium">
                {t('settings.changeLanguage')}
              </span>
              <ChevronRight className="w-4 h-4 text-base-400 rtl:rotate-180" />
            </button>
          </Card>

          {/* Preferences */}
          <Card>
            <h3 className="text-sm font-semibold text-base-100 mb-4">{t('settings.preferences')}</h3>
            <div className="flex flex-col gap-5">
              <CurrencySelect
                label={t('settings.defaultCurrency')}
                value={currency}
                onChange={setCurrency}
                helperText={t('settings.defaultCurrencyHelper')}
              />
              <Select
                label={t('settings.defaultVoltage')}
                options={voltageOptions}
                value={voltage}
                onChange={(e) => setVoltage(e.target.value)}
                helperText={t('settings.defaultVoltageHelper')}
              />
              <Input
                label={t('settings.electricityRate')}
                type="number"
                step="0.01"
                min="0"
                placeholder="0.15"
                value={electricityRate}
                onChange={(e) => setElectricityRate(e.target.value)}
                helperText={t('settings.electricityRateHelper')}
              />
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-base-100 mb-4">{t('settings.account')}</h3>
            <p className="text-sm text-base-300">
              {t('settings.accountDescription')}
            </p>
            <p className="text-2xs text-base-400 mt-3 font-mono">
              v{APP_VERSION}
            </p>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-base-100 mb-4">{t('settings.data')}</h3>
            <p className="text-sm text-base-300">
              {t('settings.dataDescription')}
            </p>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={handleReset}>{t('common.reset')}</Button>
            <Button
              leftIcon={<Save className="w-4 h-4" />}
              onClick={handleSave}
            >
              {saved ? t('common.saved') : t('settings.saveChanges')}
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
