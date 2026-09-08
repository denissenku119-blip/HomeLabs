import { useCallback, useEffect, useRef, useState } from 'react';
import type { Project, ProjectComponent, ConnectionType, HardwareDefinition } from '@/types';
import {
  loadProject,
  saveProject,
  createProject,
  createProjectComponentFromHardware,
  createCustomHardwareComponent,
  createConnection,
  getSmartPlacement,
} from '@/utils/projectStore';
import { getHardwareById } from '@/data/hardware';
import type { CreateProjectInput, CustomHardwareInput } from '@/types';

export interface ProjectState {
  project: Project;
  selectedId: string | null;
  connectingFromId: string | null;
  pendingConnectionType: ConnectionType;
  saved: boolean;
}

export interface ProjectActions {
  addHardware: (hw: HardwareDefinition, x?: number, y?: number) => void;
  addCustomHardware: (input: CustomHardwareInput, x?: number, y?: number) => void;
  updateComponent: (instanceId: string, updates: Partial<ProjectComponent>) => void;
  resetToCatalog: (instanceId: string) => void;
  deleteComponent: (instanceId: string) => void;
  duplicateComponent: (instanceId: string) => void;
  selectComponent: (instanceId: string | null) => void;
  moveComponent: (instanceId: string, x: number, y: number) => void;
  addConnection: (fromId: string, toId: string, type: ConnectionType, label?: string) => void;
  deleteConnection: (connectionId: string) => void;
  startConnecting: (instanceId: string) => void;
  cancelConnecting: () => void;
  setPendingConnectionType: (type: ConnectionType) => void;
  updateProjectMeta: (updates: Partial<Pick<Project, 'name' | 'budget' | 'currency'>>) => void;
  selectedComponent: ProjectComponent | null;
}

export function useProjectState(
  projectId: string,
  initialData?: CreateProjectInput | null
): { state: ProjectState; actions: ProjectActions } {
  const [project, setProject] = useState<Project>(() => {
    if (initialData) {
      return createProject(initialData);
    }
    return loadProject(projectId) ?? createProject({
      name: 'Untitled Project',
      goal: 'other',
      experienceLevel: 'beginner',
      currency: 'USD',
    });
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [connectingFromId, setConnectingFromId] = useState<string | null>(null);
  const [pendingConnectionType, setPendingConnectionType] = useState<ConnectionType>('ethernet');
  const [saved, setSaved] = useState(true);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    setSaved(false);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveProject(project);
      setSaved(true);
    }, 600);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [project]);

  const addHardware = useCallback(
    (hw: HardwareDefinition, x?: number, y?: number) => {
      const pos = x !== undefined && y !== undefined
        ? { x, y }
        : getSmartPlacement(project.components.length);
      const newComp = createProjectComponentFromHardware(hw, pos.x, pos.y);
      setProject((prev) => ({
        ...prev,
        components: [...prev.components, newComp],
        updatedAt: new Date().toISOString(),
      }));
      setSelectedId(newComp.instanceId);
    },
    [project.components.length]
  );

  const addCustomHardware = useCallback(
    (input: CustomHardwareInput, x?: number, y?: number) => {
      const pos = x !== undefined && y !== undefined
        ? { x, y }
        : getSmartPlacement(project.components.length);
      const newComp = createCustomHardwareComponent(input, pos.x, pos.y);
      setProject((prev) => ({
        ...prev,
        components: [...prev.components, newComp],
        updatedAt: new Date().toISOString(),
      }));
      setSelectedId(newComp.instanceId);
    },
    [project.components.length]
  );

  const updateComponent = useCallback(
    (instanceId: string, updates: Partial<ProjectComponent>) => {
      setProject((prev) => ({
        ...prev,
        components: prev.components.map((c) =>
          c.instanceId === instanceId
            ? { ...c, ...updates, hasOverrides: true }
            : c
        ),
        updatedAt: new Date().toISOString(),
      }));
    },
    []
  );

  const resetToCatalog = useCallback((instanceId: string) => {
    setProject((prev) => ({
      ...prev,
      components: prev.components.map((c) => {
        if (c.instanceId !== instanceId) return c;
        const hw = getHardwareById(c.hardwareDefinitionId);
        if (!hw) return c;
        return {
          ...c,
          name: hw.name,
          manufacturer: hw.manufacturer,
          model: hw.model,
          description: hw.description,
          price: hw.typicalPrice,
          powerWatts: hw.powerWatts,
          idlePowerWatts: hw.idlePowerWatts,
          maxPowerWatts: hw.maxPowerWatts,
          storageTB: hw.storageTB,
          driveBays: hw.driveBays,
          networkPorts: hw.networkPorts,
          networkSpeedGbps: hw.networkSpeedGbps,
          cpuCores: hw.cpuCores,
          ramGB: hw.ramGB,
          expandableRam: hw.expandableRam,
          formFactor: hw.formFactor,
          virtualizationSupport: hw.virtualizationSupport,
          useCases: hw.useCases,
          notes: hw.notes,
          specSourceType: hw.specSourceType,
          hasOverrides: false,
        };
      }),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const deleteComponent = useCallback((instanceId: string) => {
    setProject((prev) => ({
      ...prev,
      components: prev.components.filter((c) => c.instanceId !== instanceId),
      connections: prev.connections.filter(
        (conn) => conn.fromId !== instanceId && conn.toId !== instanceId
      ),
      updatedAt: new Date().toISOString(),
    }));
    setSelectedId((prev) => (prev === instanceId ? null : prev));
  }, []);

  const duplicateComponent = useCallback((instanceId: string) => {
    setProject((prev) => {
      const orig = prev.components.find((c) => c.instanceId === instanceId);
      if (!orig) return prev;
      const dup = createProjectComponentFromHardware(
        {
          id: orig.hardwareDefinitionId,
          name: orig.name,
          manufacturer: orig.manufacturer,
          model: orig.model,
          category: orig.category,
          subcategory: orig.subcategory,
          description: orig.description,
          typicalPrice: orig.price,
          currency: orig.currency,
          powerWatts: orig.powerWatts,
          idlePowerWatts: orig.idlePowerWatts,
          maxPowerWatts: orig.maxPowerWatts,
          storageTB: orig.storageTB,
          driveBays: orig.driveBays,
          networkPorts: orig.networkPorts,
          networkSpeedGbps: orig.networkSpeedGbps,
          cpuCores: orig.cpuCores,
          ramGB: orig.ramGB,
          expandableRam: orig.expandableRam,
          formFactor: orig.formFactor,
          virtualizationSupport: orig.virtualizationSupport,
          useCases: orig.useCases,
          notes: orig.notes,
          specSourceType: orig.specSourceType,
        },
        orig.x + 40,
        orig.y + 40
      );
      dup.hasOverrides = orig.hasOverrides;
      return {
        ...prev,
        components: [...prev.components, dup],
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const selectComponent = useCallback((instanceId: string | null) => {
    setSelectedId(instanceId);
  }, []);

  const moveComponent = useCallback((instanceId: string, x: number, y: number) => {
    setProject((prev) => ({
      ...prev,
      components: prev.components.map((c) =>
        c.instanceId === instanceId ? { ...c, x, y } : c
      ),
    }));
  }, []);

  const addConnection = useCallback(
    (fromId: string, toId: string, type: ConnectionType, label?: string) => {
      if (fromId === toId) return;
      setProject((prev) => {
        const exists = prev.connections.some(
          (c) =>
            (c.fromId === fromId && c.toId === toId) ||
            (c.fromId === toId && c.toId === fromId)
        );
        if (exists) return prev;
        const conn = createConnection(fromId, toId, type, label);
        return {
          ...prev,
          connections: [...prev.connections, conn],
          updatedAt: new Date().toISOString(),
        };
      });
    },
    []
  );

  const deleteConnection = useCallback((connectionId: string) => {
    setProject((prev) => ({
      ...prev,
      connections: prev.connections.filter((c) => c.id !== connectionId),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const startConnecting = useCallback((instanceId: string) => {
    setConnectingFromId(instanceId);
  }, []);

  const cancelConnecting = useCallback(() => {
    setConnectingFromId(null);
  }, []);

  const updateProjectMeta = useCallback(
    (updates: Partial<Pick<Project, 'name' | 'budget' | 'currency'>>) => {
      setProject((prev) => ({
        ...prev,
        ...updates,
        updatedAt: new Date().toISOString(),
      }));
    },
    []
  );

  const selectedComponent = project.components.find(
    (c) => c.instanceId === selectedId
  ) ?? null;

  return {
    state: { project, selectedId, connectingFromId, pendingConnectionType, saved },
    actions: {
      addHardware,
      addCustomHardware,
      updateComponent,
      resetToCatalog,
      deleteComponent,
      duplicateComponent,
      selectComponent,
      moveComponent,
      addConnection,
      deleteConnection,
      startConnecting,
      cancelConnecting,
      setPendingConnectionType,
      updateProjectMeta,
      selectedComponent,
    },
  };
}
