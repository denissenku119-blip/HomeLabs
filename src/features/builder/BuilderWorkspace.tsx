import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, PanelLeft, PanelRight, Plus, Gauge, Cpu } from 'lucide-react';
import type { HardwareDefinition } from '@/types';
import { useProjectState } from '@/hooks/useProjectState';
import { HardwareLibrary } from '@/features/builder/HardwareLibrary';
import { CustomHardwareModal } from '@/features/builder/CustomHardwareModal';
import { ArchitectureCanvas } from '@/features/builder/ArchitectureCanvas';
import { NodeDetailsPanel } from '@/features/builder/NodeDetailsPanel';
import { ProjectSummary } from '@/features/builder/ProjectSummary';
import { ArchitectureAnalysisPanel } from '@/features/builder/ArchitectureAnalysisPanel';
import { hardwareCatalog } from '@/data/hardware';
import { calculateProjectMetrics } from '@/features/calculations/calculationEngine';
import { analyzeArchitecture } from '@/features/analysis/analysisEngine';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import type { CreateProjectInput, CustomHardwareInput } from '@/types';

interface BuilderWorkspaceProps {
  projectId: string;
  initialData?: CreateProjectInput | null;
}

type RightPanelTab = 'component' | 'analysis';

export function BuilderWorkspace({ projectId, initialData }: BuilderWorkspaceProps) {
  const { state, actions } = useProjectState(projectId, initialData);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [draggedHw, setDraggedHw] = useState<HardwareDefinition | null>(null);
  const [mobilePanel, setMobilePanel] = useState<'library' | 'details' | null>(null);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [rightTab, setRightTab] = useState<RightPanelTab>('component');

  const { project, selectedId, connectingFromId, pendingConnectionType, saved } = state;
  const { selectedComponent } = actions;

  const metrics = useMemo(
    () => calculateProjectMetrics(project, { electricityCostPerKwh: project.electricityCostPerKwh }),
    [project]
  );

  const analysis = useMemo(
    () => analyzeArchitecture(project, metrics),
    [project, metrics]
  );

  const handleAddHardware = (hw: HardwareDefinition) => {
    actions.addHardware(hw);
    setMobilePanel(null);
  };

  const handleAddCustom = (input: CustomHardwareInput) => {
    actions.addCustomHardware(input);
    setMobilePanel(null);
  };

  const handleAddFirst = () => {
    const router = hardwareCatalog.find((hw) => hw.name === 'Basic Router');
    if (router) handleAddHardware(router);
  };

  const handleCompleteConnection = (targetId: string) => {
    if (connectingFromId) {
      actions.addConnection(connectingFromId, targetId, pendingConnectionType);
      actions.cancelConnecting();
    }
  };

  const handleDeleteSelected = (id: string) => {
    actions.deleteComponent(id);
    setMobilePanel(null);
  };

  const handleSelect = (id: string | null) => {
    actions.selectComponent(id);
    if (id) {
      setRightTab('component');
      setMobilePanel('details');
    }
  };

  const panelButton = (panel: 'library' | 'details', label: string, icon: React.ReactNode) => (
    <button
      type="button"
      onClick={() => setMobilePanel((current) => (current === panel ? null : panel))}
      className={cn(
        'flex items-center justify-center gap-2 min-h-10 px-3 text-xs font-medium rounded-lg border transition-colors',
        mobilePanel === panel
          ? 'bg-accent/10 text-accent border-accent/30'
          : 'bg-base-850 text-base-200 border-base-700 hover:text-base-50'
      )}
      aria-expanded={mobilePanel === panel}
    >
      {icon}
      {label}
      {mobilePanel === panel ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
    </button>
  );

  const tabBar = (
    <div className="flex items-center gap-1 px-2 py-1.5 border-b border-base-700 bg-base-900 flex-shrink-0">
      <button
        onClick={() => setRightTab('component')}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1.5 text-2xs font-medium rounded-md transition-colors',
          rightTab === 'component'
            ? 'bg-base-800 text-base-100'
            : 'text-base-400 hover:text-base-200'
        )}
      >
        <Cpu className="w-3 h-3" />
        {selectedComponent ? 'Component' : 'Overview'}
      </button>
      <button
        onClick={() => setRightTab('analysis')}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1.5 text-2xs font-medium rounded-md transition-colors',
          rightTab === 'analysis'
            ? 'bg-base-800 text-base-100'
            : 'text-base-400 hover:text-base-200'
        )}
      >
        <Gauge className="w-3 h-3" />
        Analysis
        {analysis.warnings.length > 0 && (
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-warning-500/20 text-warning-400 text-2xs font-bold">
            {analysis.warnings.length}
          </span>
        )}
      </button>
    </div>
  );

  const rightPanelContent = rightTab === 'analysis' ? (
    <ArchitectureAnalysisPanel analysis={analysis} />
  ) : (
    <NodeDetailsPanel
      component={selectedComponent}
      connections={project.connections}
      allComponents={project.components}
      connectingFromId={connectingFromId}
      pendingConnectionType={pendingConnectionType}
      onUpdate={actions.updateComponent}
      onResetToCatalog={actions.resetToCatalog}
      onDelete={handleDeleteSelected}
      onDuplicate={actions.duplicateComponent}
      onStartConnecting={actions.startConnecting}
      onCancelConnecting={actions.cancelConnecting}
      onSetConnectionType={actions.setPendingConnectionType}
      onSelectNode={handleSelect}
      onDeleteConnection={actions.deleteConnection}
      onClose={() => actions.selectComponent(null)}
    />
  );

  return (
    <div className="flex flex-col h-full min-h-[620px] bg-base-950">
      <CustomHardwareModal
        open={customModalOpen}
        onClose={() => setCustomModalOpen(false)}
        onAdd={handleAddCustom}
      />

      <div className="lg:hidden flex items-center gap-2 px-3 py-2 border-b border-base-700 bg-base-900">
        {panelButton('library', 'Hardware', <PanelLeft className="w-4 h-4" />)}
        {panelButton('details', rightTab === 'analysis' ? 'Analysis' : (selectedComponent ? 'Selected' : 'Overview'), <PanelRight className="w-4 h-4" />)}
        <Badge variant="default" className="ml-auto">{project.components.length} placed</Badge>
      </div>

      <div className="relative flex-1 flex min-h-0 flex-col lg:flex-row">
        <aside className="hidden lg:flex lg:w-64 xl:w-72 flex-shrink-0 border-r border-base-700 bg-base-900 min-h-0">
          <HardwareLibrary
            onAdd={handleAddHardware}
            onAddCustom={() => setCustomModalOpen(true)}
          />
        </aside>

        {mobilePanel === 'library' && (
          <div className="lg:hidden absolute inset-x-0 top-0 z-30 h-[min(70vh,520px)] bg-base-900 border-b border-base-700 shadow-elevated">
            <HardwareLibrary
              compact
              onAdd={handleAddHardware}
              onAddCustom={() => setCustomModalOpen(true)}
            />
          </div>
        )}

        <ArchitectureCanvas
          components={project.components}
          connections={project.connections}
          selectedId={selectedId}
          connectingFromId={connectingFromId}
          pendingConnectionType={pendingConnectionType}
          scale={scale}
          pan={pan}
          showGrid={showGrid}
          onScaleChange={setScale}
          onPanChange={setPan}
          onToggleGrid={() => setShowGrid((value) => !value)}
          onSelect={handleSelect}
          onMove={actions.moveComponent}
          onAdd={(def, x, y) => actions.addHardware(def, x, y)}
          onDelete={handleDeleteSelected}
          onDuplicate={actions.duplicateComponent}
          onStartConnecting={actions.startConnecting}
          onCompleteConnecting={handleCompleteConnection}
          onCancelConnecting={actions.cancelConnecting}
          onDeleteConnection={actions.deleteConnection}
          onAddFirst={handleAddFirst}
          draggedDef={draggedHw}
          onDropDef={(def, x, y) => {
            actions.addHardware(def, Math.max(12, x), Math.max(12, y));
            setDraggedHw(null);
          }}
        />

        <aside className="hidden lg:flex lg:w-72 xl:w-80 flex-shrink-0 border-l border-base-700 bg-base-900 min-h-0 flex-col">
          {tabBar}
          <div className="flex-1 min-h-0">
            {rightPanelContent}
          </div>
        </aside>

        {mobilePanel === 'details' && (
          <div className="lg:hidden absolute inset-x-0 bottom-0 z-30 max-h-[72vh] bg-base-900 border-t border-base-700 shadow-elevated flex flex-col">
            {tabBar}
            <div className="flex-1 min-h-0 overflow-hidden">
              {rightPanelContent}
            </div>
          </div>
        )}
      </div>

      <div className="lg:hidden flex items-center gap-2 px-3 py-2 border-t border-base-700 bg-base-900">
        <Button size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={() => setMobilePanel('library')}>
          Add hardware
        </Button>
        <span className="text-2xs text-base-400 ml-auto">Tap a node to edit</span>
      </div>

      <ProjectSummary
        components={project.components}
        connections={project.connections}
        currency={project.currency}
        electricityCostPerKwh={project.electricityCostPerKwh}
        budget={project.budget}
        saved={saved}
      />
    </div>
  );
}
