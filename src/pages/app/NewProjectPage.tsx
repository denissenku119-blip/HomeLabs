import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Rocket } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { CurrencySelect } from '@/components/CurrencySelect';
import { useI18n } from '@/i18n/I18nContext';
import { getCurrencySymbol } from '@/data/currencies';
import type { PrimaryGoal, ExperienceLevel, CreateProjectInput } from '@/types';

export function NewProjectPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [goal, setGoal] = useState<PrimaryGoal | ''>('');
  const [level, setLevel] = useState<ExperienceLevel | ''>('');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [errors, setErrors] = useState<{ name?: string; goal?: string; level?: string }>({});

  const goalOptions: { value: PrimaryGoal; label: string }[] = [
    { value: 'self-hosting', label: t('goal.self-hosting') },
    { value: 'storage-nas', label: t('goal.storage-nas') },
    { value: 'virtualization', label: t('goal.virtualization') },
    { value: 'networking', label: t('goal.networking') },
    { value: 'media-server', label: t('goal.media-server') },
    { value: 'cybersecurity-lab', label: t('goal.cybersecurity-lab') },
    { value: 'development', label: t('goal.development') },
    { value: 'learning', label: t('goal.learning') },
    { value: 'other', label: t('goal.other') },
  ];

  const levelOptions: { value: ExperienceLevel; label: string }[] = [
    { value: 'beginner', label: t('level.beginner') },
    { value: 'intermediate', label: t('level.intermediate') },
    { value: 'advanced', label: t('level.advanced') },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = t('newProject.projectName') + ' is required';
    if (!goal) newErrors.goal = t('newProject.selectGoal');
    if (!level) newErrors.level = t('newProject.selectLevel');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const id = `proj-${Date.now()}`;
    navigate(`/app/project/${id}`, {
      state: {
        name: name.trim(),
        goal,
        experienceLevel: level,
        budget: budget ? parseFloat(budget) : undefined,
        currency,
      } as CreateProjectInput,
    });
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <SectionHeader
          eyebrow={t('navigation.newProject')}
          title={t('newProject.title')}
          description={t('newProject.description')}
        />

        <Card className="mt-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label={t('newProject.projectName')}
              placeholder={t('newProject.projectNamePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
            />

            <Select
              label={t('newProject.primaryGoal')}
              placeholder={t('newProject.selectGoal')}
              options={goalOptions}
              value={goal}
              onChange={(e) => setGoal(e.target.value as PrimaryGoal)}
              error={errors.goal}
            />

            <Select
              label={t('newProject.experienceLevel')}
              placeholder={t('newProject.selectLevel')}
              options={levelOptions}
              value={level}
              onChange={(e) => setLevel(e.target.value as ExperienceLevel)}
              error={errors.level}
            />

            <div className="grid sm:grid-cols-2 gap-5">
              <Input
                label={t('newProject.estimatedBudget')}
                type="number"
                min="0"
                placeholder="1500"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                leftIcon={<span className="text-sm font-medium">{getCurrencySymbol(currency)}</span>}
              />
              <CurrencySelect
                label={t('newProject.currency')}
                value={currency}
                onChange={setCurrency}
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-base-700">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/app')}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                size="lg"
                leftIcon={<Rocket className="w-4 h-4" />}
                rightIcon={<ArrowRight className="w-4 h-4 rtl:rotate-180" />}
              >
                {t('newProject.createProject')}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
