import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SectionHeader } from '@/components/ui/SectionHeader';

const currencyOptions = [
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
];

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
  const [currency, setCurrency] = useState('USD');
  const [voltage, setVoltage] = useState('120');
  const [electricityRate, setElectricityRate] = useState('0.15');
  const [saved, setSaved] = useState(false);

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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <SectionHeader
          title="Settings"
          description="Configure your HomeLab Architect preferences."
        />

        <div className="mt-8 flex flex-col gap-6">
          <Card>
            <h3 className="text-sm font-semibold text-base-100 mb-4">Preferences</h3>
            <div className="flex flex-col gap-5">
              <Select
                label="Default currency"
                options={currencyOptions}
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                helperText="Used for all new projects unless overridden."
              />
              <Select
                label="Default voltage"
                options={voltageOptions}
                value={voltage}
                onChange={(e) => setVoltage(e.target.value)}
                helperText="Used for power cost calculations."
              />
              <Input
                label="Electricity rate (per kWh)"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.15"
                value={electricityRate}
                onChange={(e) => setElectricityRate(e.target.value)}
                helperText="Cost per kWh, used to estimate ongoing power costs. This is a configurable assumption — enter your local electricity price."
              />
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-base-100 mb-4">Account</h3>
            <p className="text-sm text-base-300">
              Account management and authentication will be available in a future update.
            </p>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-base-100 mb-4">Data</h3>
            <p className="text-sm text-base-300">
              Cloud project sync and history will be available in a future update. Your
              projects are currently stored locally.
            </p>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={handleReset}>Reset</Button>
            <Button
              leftIcon={<Save className="w-4 h-4" />}
              onClick={handleSave}
            >
              {saved ? 'Saved' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
