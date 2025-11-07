import { useMemo } from "react";

export function useDecodeToken() {
  const decoder = useMemo(() => {
    return (token: string | null) => {
      if (!token) return null;

      try {
        const payload = token.split(".")[1];
        const decodedPayload = atob(payload);
        return JSON.parse(decodedPayload);
      } catch (error) {
        console.error("Error decoding token:", error);
        return null;
      }
    };
  }, []);
  return decoder;
}
