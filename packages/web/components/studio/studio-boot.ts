import type { StudioProject } from '@/components/studio/project-registry';
import { generateProjectId } from '@/components/studio/project-registry';

export type StudioMode = 'web-dev' | 'cli-single-project' | 'desktop-multi-project';

export type StudioBootContext = {
  mode: StudioMode;
  lockedProjectRoot?: string;
  lockedProjectId?: string;
  canSwitchProjects: boolean;
  canOpenExternalProject: boolean;
  canManageRecentProjects: boolean;
};

export const DEFAULT_STUDIO_BOOT_CONTEXT: StudioBootContext = {
  mode: 'web-dev',
  canSwitchProjects: true,
  canOpenExternalProject: true,
  canManageRecentProjects: true,
};

function normalizeOptionalString(value?: string | null): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function getProjectNameFromPath(projectPath: string): string {
  return projectPath.split(/[\\/]+/).filter(Boolean).at(-1) ?? projectPath;
}

export function readStudioBootContext(): StudioBootContext {
  const lockedProjectRoot = normalizeOptionalString(process.env.ANYDOCS_STUDIO_PROJECT_ROOT);
  const lockedProjectId = normalizeOptionalString(process.env.ANYDOCS_STUDIO_PROJECT_ID);

  if (process.env.ANYDOCS_STUDIO_MODE === 'cli-single-project') {
    return {
      mode: 'cli-single-project',
      lockedProjectRoot,
      lockedProjectId,
      canSwitchProjects: false,
      canOpenExternalProject: false,
      canManageRecentProjects: false,
    };
  }

  if (process.env.ANYDOCS_DESKTOP_RUNTIME === '1') {
    return {
      mode: 'desktop-multi-project',
      canSwitchProjects: true,
      canOpenExternalProject: true,
      canManageRecentProjects: true,
    };
  }

  return DEFAULT_STUDIO_BOOT_CONTEXT;
}

export function createLockedStudioProject(bootContext: StudioBootContext): StudioProject | null {
  if (!bootContext.lockedProjectRoot) {
    return null;
  }

  return {
    id: bootContext.lockedProjectId ?? generateProjectId(bootContext.lockedProjectRoot),
    name: getProjectNameFromPath(bootContext.lockedProjectRoot),
    path: bootContext.lockedProjectRoot,
    lastOpened: Date.now(),
  };
}
