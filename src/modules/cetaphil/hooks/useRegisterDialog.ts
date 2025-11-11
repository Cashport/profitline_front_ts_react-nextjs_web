import { useState, useEffect, useRef } from "react";

export const useRegisterDialog = (token: string | null, decodedToken: any) => {
  const [showRegister, setShowRegister] = useState(false);
  const hasAutoOpened = useRef(false);

  useEffect(() => {
    // Solo abrir automáticamente una vez cuando hay token y email
    if (token && decodedToken?.claims?.guestEmail && !hasAutoOpened.current) {
      setShowRegister(true);
      hasAutoOpened.current = true;
    }
  }, [token, decodedToken?.claims?.guestEmail]);

  return { showRegister, setShowRegister };
};
