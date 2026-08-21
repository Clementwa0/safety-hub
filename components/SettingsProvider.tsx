"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import {
  DEFAULT_PORTAL_SETTINGS,
  type PortalSettings,
} from "@/services/sentinel/settings.service";

interface SettingsContextValue {
  settings: PortalSettings;
  /** Lets the Sentinel settings page push a freshly-saved value in immediately. */
  setSettings: (settings: PortalSettings) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

interface SettingsProviderProps {
  /** Fetched server-side (see lib/settings/get-settings.server.ts) so there's no client loading flash. */
  initialSettings: PortalSettings;
  children: ReactNode;
}

export function SettingsProvider({ initialSettings, children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<PortalSettings>(initialSettings);

  const value = useMemo(() => ({ settings, setSettings }), [settings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

/**
 * Company/contact/social settings, loaded server-side and available
 * anywhere in the tree. Falls back to defaults (rather than throwing) for
 * any component rendered outside the provider, e.g. isolated tests.
 */
export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    return { settings: DEFAULT_PORTAL_SETTINGS, setSettings: () => {} };
  }
  return ctx;
}
