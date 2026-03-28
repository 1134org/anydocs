'use client';

import type { ApiSourceDoc } from '@anydocs/core';

import type { DocsLang, NavigationDoc, PageDoc } from '@/lib/docs/types';

import type {
  DeletePageResponse,
  StudioApiSourcesResponse,
  StudioBuildResponse,
  StudioHost,
  StudioPreviewResponse,
  StudioProjectResponse,
  StudioProjectSettingsPatch,
} from './host-types';

type IpcResponse<T> = {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
};

type DesktopStudioApi = {
  getProject: (projectId: string, projectPath?: string) => Promise<IpcResponse<StudioProjectResponse>>;
  updateProject: (
    patch: StudioProjectSettingsPatch,
    projectId: string,
    projectPath?: string,
  ) => Promise<IpcResponse<StudioProjectResponse>>;
  getPages: (lang: string, projectId: string, projectPath?: string) => Promise<IpcResponse<{ pages: PageDoc[] }>>;
  getPage: (lang: string, pageId: string, projectId: string, projectPath?: string) => Promise<IpcResponse<PageDoc>>;
  savePage: (lang: string, page: PageDoc, projectId: string, projectPath?: string) => Promise<IpcResponse<PageDoc>>;
  createPage: (
    lang: string,
    input: { slug: string; title: string },
    projectId: string,
    projectPath?: string,
  ) => Promise<IpcResponse<PageDoc>>;
  deletePage: (
    lang: string,
    pageId: string,
    projectId: string,
    projectPath?: string,
  ) => Promise<IpcResponse<DeletePageResponse>>;
  getNavigation: (
    lang: string,
    projectId: string,
    projectPath?: string,
  ) => Promise<IpcResponse<NavigationDoc>>;
  saveNavigation: (
    lang: string,
    navigation: NavigationDoc,
    projectId: string,
    projectPath?: string,
  ) => Promise<IpcResponse<NavigationDoc>>;
  getApiSources: (projectId: string, projectPath?: string) => Promise<IpcResponse<StudioApiSourcesResponse>>;
  replaceApiSources: (
    sources: ApiSourceDoc[],
    projectId: string,
    projectPath?: string,
  ) => Promise<IpcResponse<StudioApiSourcesResponse>>;
  runBuild: (projectId: string, projectPath?: string) => Promise<IpcResponse<StudioBuildResponse>>;
  runPreview: (projectId: string, projectPath?: string) => Promise<IpcResponse<StudioPreviewResponse>>;
};

type DesktopWindow = Window & {
  api?: {
    studio?: DesktopStudioApi;
  };
};

async function fromIpc<T>(promise: Promise<IpcResponse<T>>) {
  const response = await promise;
  if (!response.success) {
    throw new Error(response.error?.message ?? 'Desktop IPC request failed');
  }

  return response.data as T;
}

export function getDesktopStudioApi(): DesktopStudioApi | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return ((window as DesktopWindow).api?.studio as DesktopStudioApi | undefined) ?? null;
}

export function createDesktopIpcHost(api: DesktopStudioApi): StudioHost {
  return {
    getProject: (projectId, projectPath) => fromIpc(api.getProject(projectId, projectPath)),
    updateProject: (patch, projectId, projectPath) => fromIpc(api.updateProject(patch, projectId, projectPath)),
    getPages: (lang, projectId, projectPath) => fromIpc(api.getPages(lang, projectId, projectPath)),
    getPage: (lang, pageId, projectId, projectPath) => fromIpc(api.getPage(lang, pageId, projectId, projectPath)),
    savePage: (lang, page, projectId, projectPath) => fromIpc(api.savePage(lang, page, projectId, projectPath)),
    createPage: (lang, input, projectId, projectPath) => fromIpc(api.createPage(lang, input, projectId, projectPath)),
    deletePage: (lang, pageId, projectId, projectPath) => fromIpc(api.deletePage(lang, pageId, projectId, projectPath)),
    getNavigation: (lang, projectId, projectPath) => fromIpc(api.getNavigation(lang, projectId, projectPath)),
    saveNavigation: (lang, navigation, projectId, projectPath) =>
      fromIpc(api.saveNavigation(lang, navigation, projectId, projectPath)),
    getApiSources: (projectId, projectPath) => fromIpc(api.getApiSources(projectId, projectPath)),
    replaceApiSources: (sources, projectId, projectPath) =>
      fromIpc(api.replaceApiSources(sources, projectId, projectPath)),
    runBuild: (projectId, projectPath) => fromIpc(api.runBuild(projectId, projectPath)),
    runPreview: (projectId, projectPath) => fromIpc(api.runPreview(projectId, projectPath)),
  };
}
