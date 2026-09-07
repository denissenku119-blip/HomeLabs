import { useState } from 'react';
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

export function SettingsPage() {
  const [currency, setCurrency] = useState('USD');
  const [voltage, setVoltage] = useState('120');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
                label="Electricity rate"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.12"
                helperText="Cost per kWh, used to estimate ongoing power costs."
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
            <Button variant="ghost">Reset</Button>
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
