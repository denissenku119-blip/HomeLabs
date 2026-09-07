import { Plus, MousePointerClick, Link2, BarChart3 } from 'lucide-react';

interface EmptyCanvasStateProps {
  onAddFirst: () => void;
}

export function EmptyCanvasState({ onAddFirst }: EmptyCanvasStateProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
      <div className="mb-5 p-4 rounded-2xl bg-base-850/60 border border-base-700 text-base-300 pointer-events-auto">
        <Plus className="w-10 h-10" />
      </div>
      <h3 className="text-lg font-bold text-base-50 pointer-events-auto">
        Your architecture is empty
      </h3>
      <p className="mt-2 text-sm text-base-300 max-w-sm pointer-events-auto">
        Start by adding your router, server, NAS, or other equipment.
      </p>
      <button
        onClick={onAddFirst}
        className="pointer-events-auto mt-5 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-accent text-base-950 hover:bg-accent-400 transition-colors shadow-subtle"
      >
        <Plus className="w-4 h-4" />
        Add your first component
      </button>

      {/* Guidance steps */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3 pointer-events-auto">
        <GuidanceStep icon={<Plus className="w-3.5 h-3.5" />} text="Add equipment" />
        <GuidanceStep icon={<MousePointerClick className="w-3.5 h-3.5" />} text="Arrange your architecture" />
        <GuidanceStep icon={<Link2 className="w-3.5 h-3.5" />} text="Connect components" />
        <GuidanceStep icon={<BarChart3 className="w-3.5 h-3.5" />} text="Review your summary" />
      </div>
    </div>
  );
}

function GuidanceStep({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-base-850/50 border border-base-700 text-2xs font-medium text-base-300">
      <span className="text-accent">{icon}</span>
      {text}
    </div>
  );
}
