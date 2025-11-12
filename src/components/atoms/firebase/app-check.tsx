"use client";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import app from "../../../../firebase";
import { useEffect } from "react";
import { CAPTCHA_SITE_KEY } from "@/utils/constants/globalConstants";

export default function FirebaseInit() {
  useEffect(() => {
    const appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(CAPTCHA_SITE_KEY),
      isTokenAutoRefreshEnabled: true
    });
    window.firebaseAppCheck = appCheck;
  }, []);

  return null; // no renderiza nada
}
