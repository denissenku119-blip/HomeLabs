import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Rocket } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { SectionHeader } from '@/components/ui/SectionHeader';
import type { PrimaryGoal, ExperienceLevel, Currency, CreateProjectInput } from '@/types';

const goalOptions: { value: PrimaryGoal; label: string }[] = [
  { value: 'self-hosting', label: 'Self-hosting' },
  { value: 'storage-nas', label: 'Storage / NAS' },
  { value: 'virtualization', label: 'Virtualization' },
  { value: 'networking', label: 'Networking' },
  { value: 'media-server', label: 'Media server' },
  { value: 'cybersecurity-lab', label: 'Cybersecurity lab' },
  { value: 'development', label: 'Development' },
  { value: 'learning', label: 'Learning' },
  { value: 'other', label: 'Other' },
];

const levelOptions: { value: ExperienceLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const currencyOptions: { value: Currency; label: string }[] = [
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
];

export function NewProjectPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [goal, setGoal] = useState<PrimaryGoal | ''>('');
  const [level, setLevel] = useState<ExperienceLevel | ''>('');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [errors, setErrors] = useState<{ name?: string; goal?: string; level?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = 'Project name is required';
    if (!goal) newErrors.goal = 'Please select a primary goal';
    if (!level) newErrors.level = 'Please select your experience level';

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
          eyebrow="New Project"
          title="Create your HomeLab"
          description="Define your project parameters. You can adjust everything later."
        />

        <Card className="mt-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Project name"
              placeholder="My First HomeLab"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              helperText="Give your project a recognizable name."
            />

            <Select
              label="Primary goal"
              placeholder="Select a goal..."
              options={goalOptions}
              value={goal}
              onChange={(e) => setGoal(e.target.value as PrimaryGoal)}
              error={errors.goal}
              helperText="What is the main purpose of this HomeLab?"
            />

            <Select
              label="Experience level"
              placeholder="Select your level..."
              options={levelOptions}
              value={level}
              onChange={(e) => setLevel(e.target.value as ExperienceLevel)}
              error={errors.level}
              helperText="This adjusts the complexity of recommendations."
            />

            <div className="grid sm:grid-cols-2 gap-5">
              <Input
                label="Budget"
                type="number"
                min="0"
                placeholder="1500"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                helperText="Optional — helps guide recommendations."
                leftIcon={<span className="text-sm font-medium">$</span>}
              />
              <Select
                label="Currency"
                options={currencyOptions}
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                helperText="More currencies coming soon."
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-base-700">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/app')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="lg"
                leftIcon={<Rocket className="w-4 h-4" />}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Start Designing
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
