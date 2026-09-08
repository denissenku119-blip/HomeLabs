import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Check, ChevronDown } from 'lucide-react';
import { CURRENCIES, formatCurrency } from '@/data/currencies';
import { cn } from '@/lib/utils';

interface CurrencySelectProps {
  value: string;
  onChange: (code: string) => void;
  label?: string;
  helperText?: string;
  testAmount?: number;
}

export function CurrencySelect({
  value, onChange, label, helperText, testAmount = 1000,
}: CurrencySelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const selected = CURRENCIES.find((c) => c.code === value);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return CURRENCIES;
    return CURRENCIES.filter((c) =>
      c.enabled && (
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q)
      )
    );
  }, [search]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="flex flex-col gap-1.5" ref={ref}>
      {label && (
        <label className="text-xs font-medium text-base-200">{label}</label>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center justify-between px-3 py-2.5 text-sm rounded-lg bg-base-900 border text-base-100 transition-colors text-left',
          open ? 'border-accent ring-1 ring-accent' : 'border-base-700 hover:border-base-600'
        )}
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-xs text-base-400 flex-shrink-0">{value}</span>
          <span className="text-sm text-base-100 truncate">{selected?.name ?? value}</span>
        </span>
        <ChevronDown className={cn('w-4 h-4 text-base-400 flex-shrink-0 transition-transform', open && 'rotate-180')} />
      </button>
      {helperText && <p className="text-2xs text-base-400">{helperText}</p>}

      {open && (
        <div className="absolute z-50 mt-[68px] w-full max-w-full rounded-lg border border-base-700 bg-base-900 shadow-elevated overflow-hidden">
          <div className="relative p-2 border-b border-base-700">
            <Search className="absolute inset-inline-start-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-base-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search currencies..."
              className="w-full ps-8 pe-2 py-1.5 text-xs rounded-md bg-base-850 border border-base-700 text-base-100 placeholder:text-base-500 focus:outline-none focus:border-accent transition-colors"
              autoFocus
            />
          </div>
          <div className="max-h-[240px] overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-xs text-base-400 text-center">—</p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    onChange(c.code);
                    setOpen(false);
                    setSearch('');
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors border-b border-base-800 last:border-0',
                    value === c.code ? 'bg-accent/10' : 'hover:bg-base-850'
                  )}
                >
                  <span className={cn(
                    'font-mono text-xs flex-shrink-0 w-12',
                    value === c.code ? 'text-accent' : 'text-base-400'
                  )}>{c.code}</span>
                  <span className={cn(
                    'text-xs flex-1 min-w-0 truncate',
                    value === c.code ? 'text-accent' : 'text-base-100'
                  )}>{c.name}</span>
                  <span className="text-xs font-mono text-base-400 flex-shrink-0">{c.symbol}</span>
                  <span className="text-2xs font-mono text-base-500 flex-shrink-0 w-16 text-right">
                    {formatCurrency(testAmount, c.code)}
                  </span>
                  {value === c.code && <Check className="w-3.5 h-3.5 text-accent flex-shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
