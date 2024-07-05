import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { STORAGE_TOKEN } from "@/utils/constants/globalConstants";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const getAuth = async (
  email: string,
  password: string,
  router: any,
  isSignUp: any,
  openNotification: () => void
) => {
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
          console.log({ response });
          localStorage.setItem(STORAGE_TOKEN, token);
          if (response.status === 200) {
            router.push("/");
          }
        });
      })
      .catch((error) => {
        console.log({ error });
        alert(`Sign up failed: ${error.message} - ${error.code}`);
      });
  } else {
    signInWithEmailAndPassword(auth, email.trim(), password)
      .then(async (userCred) => {
        const token = await userCred.user.getIdToken();
        fetch("/api/auth", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            tokenExm: `${JSON.stringify(userCred)}`
          }
        }).then((response) => {
          localStorage.setItem(STORAGE_TOKEN, token);
          if (response.status === 200) {
            router.push("/");
          }
        });
      })
      .catch((error) => {
        console.log({ error });
        openNotification();
      });
  }
};
const logOut = (router: AppRouterInstance) => {
  signOut(auth);
  localStorage.removeItem(STORAGE_TOKEN);
  router.replace("auth/login");
};
export { getAuth, logOut };
