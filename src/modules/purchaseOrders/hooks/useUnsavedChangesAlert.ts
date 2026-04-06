import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

const POPSTATE_SENTINEL = "__popstate__";

export function useUnsavedChangesAlert(isDirty: boolean) {
  const router = useRouter();
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const isDirtyRef = useRef(isDirty);

  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  // beforeunload — native browser dialog for refresh/close
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // popstate — intercept browser back/forward
  useEffect(() => {
    if (!isDirty) return;
    history.pushState(null, "", window.location.href);
    const handler = () => {
      if (isDirtyRef.current) {
        history.pushState(null, "", window.location.href);
        setPendingUrl(POPSTATE_SENTINEL);
      }
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [isDirty]);

  const attemptNavigation = useCallback(
    (url: string) => {
      if (isDirtyRef.current) {
        setPendingUrl(url);
      } else {
        router.push(url);
      }
    },
    [router]
  );

  const confirmNavigation = useCallback(() => {
    isDirtyRef.current = false;
    if (pendingUrl === POPSTATE_SENTINEL) {
      history.back();
    } else if (pendingUrl) {
      router.push(pendingUrl);
    }
    setPendingUrl(null);
  }, [pendingUrl, router]);

  const cancelNavigation = useCallback(() => {
    setPendingUrl(null);
  }, []);

  return {
    showUnsavedModal: pendingUrl !== null,
    attemptNavigation,
    confirmNavigation,
    cancelNavigation
  };
}
