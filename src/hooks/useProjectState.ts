import { useCallback, useEffect, useRef, useState } from 'react';
import type { Project, ProjectComponent, ConnectionType } from '@/types';
import {
  loadProject,
  saveProject,
  createProject,
  createProjectComponent,
  createConnection,
} from '@/utils/projectStore';
import type { CreateProjectInput } from '@/types';
import type { ComponentDefinition } from '@/types';

export interface ProjectState {
  project: Project;
  selectedId: string | null;
  connectingFromId: string | null;
  pendingConnectionType: ConnectionType;
  saved: boolean;
}

export interface ProjectActions {
  addComponent: (def: ComponentDefinition, x?: number, y?: number) => void;
  updateComponent: (instanceId: string, updates: Partial<ProjectComponent>) => void;
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

  // Auto-save with debounce
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

  const addComponent = useCallback(
    (def: ComponentDefinition, x: number = 250, y: number = 200) => {
      const newComp = createProjectComponent(def, x, y);
      setProject((prev) => ({
        ...prev,
        components: [...prev.components, newComp],
        updatedAt: new Date().toISOString(),
      }));
      setSelectedId(newComp.instanceId);
    },
    []
  );

  const updateComponent = useCallback(
    (instanceId: string, updates: Partial<ProjectComponent>) => {
      setProject((prev) => ({
        ...prev,
        components: prev.components.map((c) =>
          c.instanceId === instanceId ? { ...c, ...updates } : c
        ),
        updatedAt: new Date().toISOString(),
      }));
    },
    []
  );

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
      const dup = createProjectComponent(orig, orig.x + 40, orig.y + 40);
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
      addComponent,
      updateComponent,
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
