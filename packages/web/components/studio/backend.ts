'use client';

import { createDesktopIpcHost, getDesktopStudioApi } from '@/components/studio/hosts/desktop-ipc-host';
import type { StudioHost } from '@/components/studio/hosts/host-types';
import { createWebLocalHost } from '@/components/studio/hosts/web-local-host';

export * from '@/components/studio/hosts/host-types';

export function createDefaultStudioHost(): StudioHost {
  const desktopApi = getDesktopStudioApi();
  if (desktopApi) {
    return createDesktopIpcHost(desktopApi);
  }

  return createWebLocalHost();
}
