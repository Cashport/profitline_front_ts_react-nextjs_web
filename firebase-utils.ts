import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  confirmPasswordReset,
  signInWithCustomToken
} from "firebase/auth";
import { IOpenNotificationProps } from "@/components/atoms/Notification/Notification";
import { auth } from "./firebase";
import { COOKIE_NAME, STORAGE_TOKEN } from "@/utils/constants/globalConstants";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useAppStore } from "@/lib/store/store";
import { NotificationInstance } from "antd/es/notification/interface";
import axios from "axios";

const getAuth = async (
  email: string,
  password: string,
  router: AppRouterInstance,
  isSignUp: any,
  // eslint-disable-next-line no-unused-vars
  openNotification: ({ api, title, message, placement }: IOpenNotificationProps) => void,
  api: NotificationInstance
) => {
  localStorage.removeItem(STORAGE_TOKEN);
  const { resetStore, setHydrated } = useAppStore.getState();
  resetStore();
  setHydrated();
  if (isSignUp) {
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCred) => {
        const token = await userCred.user.getIdToken();
        fetch("/api/auth", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${await userCred.user.getIdToken()}`
          }
        }).then((response) => {
          localStorage.setItem(STORAGE_TOKEN, token);
          if (response.status === 200) {
            router.push("/");
          }
        });
      })
      .catch((error) => {
        alert(`Sign up failed: ${error.message} - ${error.code}`);
      });
  } else {
    signInWithEmailAndPassword(auth, email.trim(), password)
      .then(async (userCred) => {
        // Check email verification
        //cuando se active la verificación de correo, descomentar
        // if (!userCred.user.emailVerified) {
        //   // Sign out the user
        //   await signOut(auth);
        //   openNotification({
        //     api: api,
        //     type: "warning",
        //     title: "Email no verificado",
        //     message:
        //       "Por favor verifica tu correo electrónico antes de iniciar sesión. Se ha enviado un nuevo correo de verificación."
        //   });
        //   return;
        // }

        const token = await userCred.user.getIdToken();
        fetch("/api/auth", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            tokenExm: `${JSON.stringify(userCred)}`
          }
        }).then(async (response) => {
          const data = await response.json();
          if (response.status === 200) {
            localStorage.setItem(STORAGE_TOKEN, data.data.token);
            router.push("/land");
          }
        });
      })
      .catch((error) => {
        console.error({ error });
        openNotification({
          api: api,
          type: "error",
          title: "Error",
          message: "Usuario o contraseña incorrectos"
        });
      });
  }
};

export const getIdTokenWithToken = async (token: string) => {
  try {
    const idToken = await signInWithCustomToken(auth, token);
    return idToken;
  } catch (error) {
    handleError(error);
  }
};

const logOut = async (router?: AppRouterInstance) => {
  try {
    localStorage.removeItem(STORAGE_TOKEN);

    // Enviar el pathname actual al endpoint de logout para que maneje el redireccionamiento
    const response = await axios.post("/api/auth/logout", {
      currentPath: window.location.pathname
    });

    signOut(auth);
    const { resetStore } = useAppStore.getState();
    resetStore();

    // El servidor responde con la URL de redirección
    if (response.data?.redirectUrl) {
      window.location.href = response.data.redirectUrl;
    }
  } catch (error) {
    console.error("Error during logout:", error);
    // Fallback en caso de error
    window.location.href = "/auth/login";
  }
};

const sendEmailResetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    handleError(error);
  }
};

const resetPassword = async (oobCode: string, newPassword: string) => {
  try {
    await confirmPasswordReset(auth, oobCode, newPassword);
  } catch (error) {
    handleError(error);
  }
};

// New helper function to check email verification
const checkEmailVerification = async (): Promise<boolean> => {
  if (!auth.currentUser) return false;
  await auth.currentUser.reload();
  return auth.currentUser.emailVerified;
};

// New function to resend verification email
const resendVerificationEmail = async (
  openNotification: ({ api, title, message, placement }: IOpenNotificationProps) => void,
  api: NotificationInstance
) => {
  try {
    if (auth.currentUser) {
      openNotification({
        api: api,
        type: "success",
        title: "Correo enviado",
        message: "Se ha enviado un nuevo correo de verificación"
      });
    }
  } catch (error) {
    handleError(error);
  }
};

function handleError(error: unknown): void {
  if (error instanceof Error) {
    console.error(`Error: ${error.message}`);
  } else {
    console.error("An unknown error occurred:", error);
  }
  throw error;
}

export {
  getAuth,
  logOut,
  sendEmailResetPassword,
  resetPassword,
  checkEmailVerification,
  resendVerificationEmail
};
