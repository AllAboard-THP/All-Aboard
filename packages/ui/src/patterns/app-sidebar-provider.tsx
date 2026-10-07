"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  APP_SIDEBAR_WIDTH_COLLAPSED,
  APP_SIDEBAR_WIDTH_EXPANDED,
} from "./landing-layout";

const STORAGE_KEY = "allaboard.sidebar.expanded";

type AppSidebarProviderValue = {
  expanded: boolean;
  toggle: () => void;
  setExpanded: (value: boolean) => void;
  prefersReducedMotion: boolean;
  sidebarWidth: string;
  mobileOpen: boolean;
  setMobileOpen: (value: boolean) => void;
};

const AppSidebarContext = createContext<AppSidebarProviderValue | null>(null);

function readStoredExpanded(): boolean {
  if (typeof window === "undefined") {
    return true;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "false") {
      return false;
    }
    if (stored === "true") {
      return true;
    }
  } catch {
    // ignore storage errors
  }

  return true;
}

export function AppSidebarProvider({ children }: { children: ReactNode }) {
  const [expanded, setExpandedState] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setExpandedState(readStoredExpanded());

    if (typeof window.matchMedia !== "function") {
      return;
    }

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setPrefersReducedMotion(media.matches);
    updateMotion();
    media.addEventListener("change", updateMotion);
    return () => media.removeEventListener("change", updateMotion);
  }, []);

  const setExpanded = useCallback((value: boolean) => {
    setExpandedState(value);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggle = useCallback(() => {
    setExpanded(!expanded);
  }, [expanded, setExpanded]);

  const sidebarWidth = expanded ? APP_SIDEBAR_WIDTH_EXPANDED : APP_SIDEBAR_WIDTH_COLLAPSED;

  const value = useMemo(
    () => ({
      expanded,
      toggle,
      setExpanded,
      prefersReducedMotion,
      sidebarWidth,
      mobileOpen,
      setMobileOpen,
    }),
    [expanded, toggle, setExpanded, prefersReducedMotion, sidebarWidth, mobileOpen],
  );

  return (
    <AppSidebarContext.Provider value={value}>
      <div
        className="contents"
        style={{ ["--app-sidebar-width" as string]: sidebarWidth }}
      >
        {children}
      </div>
    </AppSidebarContext.Provider>
  );
}

export function useAppSidebar() {
  const context = useContext(AppSidebarContext);
  if (!context) {
    throw new Error("useAppSidebar must be used within AppSidebarProvider");
  }
  return context;
}

export function useAppSidebarOptional() {
  return useContext(AppSidebarContext);
}
