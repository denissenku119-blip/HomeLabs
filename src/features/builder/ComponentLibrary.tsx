import { useState, useMemo } from 'react';
import { Search, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import type { ComponentDefinition, ComponentCategory } from '@/types';
import { componentCatalog } from '@/data/componentCatalog';
import { CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_ORDER } from '@/data/constants';
import { cn } from '@/lib/utils';

interface ComponentLibraryProps {
  onAdd: (def: ComponentDefinition) => void;
  onDragStart: (def: ComponentDefinition) => void;
  onDragEnd: () => void;
  compact?: boolean;
}

export function ComponentLibrary({ onAdd, onDragStart, onDragEnd, compact }: ComponentLibraryProps) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<ComponentCategory>>(
    new Set(['compute', 'networking'])
  );

  const filteredCatalog = useMemo(() => {
    if (!search.trim()) return componentCatalog;
    const q = search.toLowerCase();
    return componentCatalog.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.manufacturer.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.includes(q)
    );
  }, [search]);

  const grouped = useMemo(() => {
    const map = new Map<ComponentCategory, ComponentDefinition[]>();
    for (const cat of CATEGORY_ORDER) {
      map.set(cat, filteredCatalog.filter((c) => c.category === cat));
    }
    return map;
  }, [filteredCatalog]);

  const toggleCategory = (cat: ComponentCategory) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-base-700 flex-shrink-0">
        <h2 className="text-sm font-semibold text-base-100">Components</h2>
        <p className="text-2xs text-base-400 mt-0.5">
          {compact ? 'Tap to add' : 'Drag or click to add'}
        </p>
      </div>

      <div className="p-2.5 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-base-400" />
          <input
            type="text"
            placeholder="Search hardware..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md bg-base-850 border border-base-600 text-base-100 placeholder:text-base-400 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
            aria-label="Search hardware components"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2.5 pb-3">
        {filteredCatalog.length === 0 && (
          <p className="text-xs text-base-400 text-center py-4">No components found.</p>
        )}
        {CATEGORY_ORDER.map((cat) => {
          const items = grouped.get(cat) ?? [];
          if (items.length === 0 && search) return null;
          const isOpen = expanded.has(cat) || !!search;
          const Icon = CATEGORY_ICONS[cat];

          return (
            <div key={cat} className="mb-1.5">
              <button
                onClick={() => toggleCategory(cat)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-base-200 hover:text-base-100 hover:bg-base-800 rounded-md transition-colors"
                aria-expanded={isOpen}
              >
                {isOpen ? (
                  <ChevronDown className="w-3 h-3 text-base-400" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-base-400" />
                )}
                <Icon className="w-3.5 h-3.5 text-base-300" />
                {CATEGORY_LABELS[cat]}
                <span className="ml-auto text-2xs text-base-400 font-normal">
                  {items.length}
                </span>
              </button>

              {isOpen && (
                <div className="flex flex-col gap-1 mt-0.5 mb-1">
                  {items.map((def) => (
                    <button
                      key={def.id}
                      draggable
                      onDragStart={() => onDragStart(def)}
                      onDragEnd={onDragEnd}
                      onClick={() => onAdd(def)}
                      className={cn(
                        'group flex items-center gap-2 px-2 py-1.5 rounded-md text-left',
                        'bg-base-850 border border-base-700 hover:border-accent/40 hover:bg-base-800',
                        'cursor-grab active:cursor-grabbing transition-colors'
                      )}
                    >
                      <span className="flex items-center justify-center w-6 h-6 rounded bg-base-800 text-base-300 flex-shrink-0">
                        <Icon className="w-3 h-3" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-base-100 truncate leading-tight">
                          {def.name}
                        </p>
                        <p className="text-2xs text-base-400 truncate leading-tight">
                          {def.manufacturer !== 'Generic' ? def.manufacturer : def.description}
                        </p>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-base-400 group-hover:text-accent flex-shrink-0 transition-colors" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
