"use client";
import React, { createContext, useCallback, useContext, useRef } from "react";

type Guard = {
  isDirty: boolean;
  onAttempt: (url: string) => void;
};

type UnsavedChangesContextValue = {
  registerGuard: (guard: Guard) => () => void;
  attemptNavigation: (url: string) => boolean;
};

const UnsavedChangesContext = createContext<UnsavedChangesContextValue | null>(null);

export function UnsavedChangesProvider({ children }: { children: React.ReactNode }) {
  const guardRef = useRef<Guard | null>(null);

  const registerGuard = useCallback((guard: Guard) => {
    guardRef.current = guard;
    return () => {
      if (guardRef.current === guard) {
        guardRef.current = null;
      }
    };
  }, []);

  const attemptNavigation = useCallback((url: string) => {
    const guard = guardRef.current;
    if (guard && guard.isDirty) {
      guard.onAttempt(url);
      return true;
    }
    return false;
  }, []);

  return (
    <UnsavedChangesContext.Provider value={{ registerGuard, attemptNavigation }}>
      {children}
    </UnsavedChangesContext.Provider>
  );
}

export function useUnsavedChanges() {
  const ctx = useContext(UnsavedChangesContext);
  if (!ctx) {
    console.warn("useUnsavedChanges must be used within an UnsavedChangesProvider");
    return {
      registerGuard: () => () => {},
      attemptNavigation: () => false
    } as UnsavedChangesContextValue;
  }
  return ctx;
}
