import { useState } from 'react';
import { Wrench, X } from 'lucide-react';
import type { ComponentCategory, CustomHardwareInput } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/data/constants';

interface CustomHardwareModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (input: CustomHardwareInput) => void;
}

const categoryOptions = CATEGORY_ORDER.filter((c) => c !== 'other').map((c) => ({
  value: c,
  label: CATEGORY_LABELS[c],
}));

export function CustomHardwareModal({ open, onClose, onAdd }: CustomHardwareModalProps) {
  const [name, setName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState<ComponentCategory | ''>('');
  const [price, setPrice] = useState('');
  const [power, setPower] = useState('');
  const [storage, setStorage] = useState('');
  const [network, setNetwork] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ name?: string; category?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!category) newErrors.category = 'Category is required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onAdd({
      name: name.trim(),
      manufacturer: manufacturer.trim() || 'Custom',
      model: model.trim() || 'Custom',
      category: category as ComponentCategory,
      price: parseFloat(price) || 0,
      powerWatts: parseFloat(power) || 0,
      storageTB: parseFloat(storage) || 0,
      networkSpeedGbps: parseFloat(network) || 0,
      notes: notes.trim() || undefined,
    });

    handleReset();
    onClose();
  };

  const handleReset = () => {
    setName('');
    setManufacturer('');
    setModel('');
    setCategory('');
    setPrice('');
    setPower('');
    setStorage('');
    setNetwork('');
    setNotes('');
    setErrors({});
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} size="md">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-9 h-9 rounded-md bg-accent/15 text-accent">
              <Wrench className="w-4.5 h-4.5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-base-50">Add Custom Hardware</h2>
              <p className="text-2xs text-base-400">Define your own equipment for the architecture</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-md text-base-400 hover:text-base-100 hover:bg-base-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <Input
            label="Name"
            placeholder="e.g. Old Desktop PC"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            helperText="Give your custom hardware a recognizable name."
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Manufacturer"
              placeholder="e.g. Custom"
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
            />
            <Input
              label="Model"
              placeholder="e.g. OptiPlex 3020"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          </div>

          <Select
            label="Category"
            placeholder="Select a category..."
            options={categoryOptions}
            value={category}
            onChange={(e) => setCategory(e.target.value as ComponentCategory)}
            error={errors.category}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (USD)"
              type="number"
              min="0"
              placeholder="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <Input
              label="Power (W)"
              type="number"
              min="0"
              placeholder="0"
              value={power}
              onChange={(e) => setPower(e.target.value)}
            />
            <Input
              label="Storage (TB)"
              type="number"
              min="0"
              step="0.1"
              placeholder="0"
              value={storage}
              onChange={(e) => setStorage(e.target.value)}
            />
            <Input
              label="Network (Gbps)"
              type="number"
              min="0"
              step="0.5"
              placeholder="0"
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-2xs font-medium text-base-300 uppercase tracking-wide mb-1.5">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this hardware..."
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-md bg-base-850 border border-base-600 text-base-100 placeholder:text-base-400 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-base-700">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" leftIcon={<Wrench className="w-4 h-4" />}>
            Add to Architecture
          </Button>
        </div>
      </form>
    </Modal>
  );
}
