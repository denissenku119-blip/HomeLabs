import type { Project, CreateProjectInput } from '@/types';
import {
  saveProject as saveToStorage,
  loadProject as loadFromStorage,
  loadAllProjects as loadAllFromStorage,
  deleteProject as deleteFromStorage,
  createProject as createProjectEntity,
} from '@/utils/projectStore';

export interface ProjectRepository {
  create(input: CreateProjectInput): Project;
  getById(id: string): Project | null;
  getAll(): Project[];
  save(project: Project): void;
  remove(id: string): void;
}

class LocalProjectRepository implements ProjectRepository {
  create(input: CreateProjectInput): Project {
    return createProjectEntity(input);
  }

  getById(id: string): Project | null {
    return loadFromStorage(id);
  }

  getAll(): Project[] {
    return loadAllFromStorage();
  }

  save(project: Project): void {
    const updated = {
      ...project,
      version: project.version + 1,
      updatedAt: new Date().toISOString(),
    };
    saveToStorage(updated);
  }

  remove(id: string): void {
    deleteFromStorage(id);
  }
}

export const projectRepository: ProjectRepository = new LocalProjectRepository();

export function createProject(input: CreateProjectInput): Project {
  return projectRepository.create(input);
}

export function getProject(id: string): Project | null {
  return projectRepository.getById(id);
}

export function getProjects(): Project[] {
  return projectRepository.getAll();
}

export function saveProjectRepo(project: Project): void {
  projectRepository.save(project);
}

export function deleteProjectRepo(id: string): void {
  projectRepository.remove(id);
}
