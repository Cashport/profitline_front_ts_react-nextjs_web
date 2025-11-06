import { useState, useCallback } from "react";

export type LoginStep = "email" | "otp";

export const useLoginFlow = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [loginStep, setLoginStep] = useState<LoginStep>("email");
  const [loginEmail, setLoginEmail] = useState("");

  const handleLoginClose = useCallback((open: boolean) => {
    setShowLogin(open);
    if (!open) {
      setLoginStep("email");
      setLoginEmail("");
    }
  }, []);

  const handleSendOTP = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // Aquí se enviaría el código OTP al backend
    setLoginStep("otp");
  }, []);

  const handleVerifyOTP = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setShowLogin(false);
  }, []);

  const handleBackToEmail = useCallback(() => {
    setLoginStep("email");
  }, []);

  const openLoginWithEmail = useCallback((email: string) => {
    setLoginEmail(email);
    setShowLogin(true);
    setLoginStep("email");
  }, []);

  return {
    showLogin,
    loginStep,
    loginEmail,
    setLoginEmail,
    handleLoginClose,
    handleSendOTP,
    handleVerifyOTP,
    handleBackToEmail,
    openLoginWithEmail
  };
};
