import { usePathname, useRouter } from "next/navigation";
import { useDecodeToken } from "./useDecodeToken";
import { useEffect, useState } from "react";
import { loginCetaphil } from "@/services/cetaphil/authService";
import { STORAGE_TOKEN } from "@/utils/constants/globalConstants";
import { useMessageApi } from "@/context/MessageContext";
import { getTranslator } from "@/i18n/translator";

export function useLoginCetaphil(urlToken: string | null) {
  const [isLoading, setIsLoading] = useState(true);
  const [registerMode, setRegisterMode] = useState<"complete-invitation" | "autoinvite">(
    "autoinvite"
  );
  const { showMessage } = useMessageApi();
  const localStorageToken =
    typeof window !== "undefined" ? localStorage.getItem(STORAGE_TOKEN) : null;
  const router = useRouter();
  const pathname = usePathname();
  const decoder = useDecodeToken();
  useEffect(() => {
    if (!urlToken) {
      setRegisterMode("autoinvite");
    } else {
      setRegisterMode("complete-invitation");
    }
    if (!urlToken && !localStorageToken && pathname !== "/cetaphil") {
      router.push("/cetaphil");
    }
    if (urlToken && pathname === "/cetaphil") {
      const urlDecoded = decoder(urlToken);
      if (urlDecoded?.claims?.mode === "login") {
        if (urlDecoded?.exp && Date.now() >= urlDecoded.exp * 1000) {
          // Token expirado, redirigir a la página de inicio de sesión
          setIsLoading(false);
          showMessage("error", getTranslator("shared")("session.expiredRequestAccess"));
          router.push("/cetaphil");
          return;
        }
        loginCetaphil(urlToken)
          .then((response) => {
            setIsLoading(false);
            console.log("Cetaphil login response:", response);
            localStorage.setItem(STORAGE_TOKEN, response.data.data.token);
            router.push("/commerce/cetaphil");
          })
          .catch((error) => {
            setIsLoading(false);
            console.error("Cetaphil login error:", error);
          });
      } else {
        if (urlDecoded?.exp && Date.now() >= urlDecoded.exp * 1000) {
          // Token expirado, redirigir a la página de inicio de sesión
          setIsLoading(false);
          showMessage("error", getTranslator("shared")("session.expiredRequestAccess"));
          router.push("/cetaphil");
        }
        setIsLoading(false);
      }
    }
    if (!urlToken && !localStorageToken && pathname === "/cetaphil") {
      setIsLoading(false);
    }

    if (localStorageToken) {
      const localDecoded = decoder(localStorageToken);
      if (pathname === "/cetaphil") {
        if (localDecoded?.exp && Date.now() >= localDecoded.exp * 1000) {
          // Token expirado, redirigir a la página de inicio de sesión
          localStorage.removeItem(STORAGE_TOKEN);
          setIsLoading(false);
          showMessage("error", getTranslator("shared")("session.expiredSignIn"));
          router.push("/cetaphil");
        } else {
          // Token válido, redirigir al dashboard
          setIsLoading(false);
          router.push("/commerce/cetaphil");
        }
      }
    }
  }, []);

  return { isLoading, registerMode };
}
