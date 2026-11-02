// Textos del formulario de acceso de la landing. Viven aparte de content.ts
// porque los usa un componente de cliente: así el navegador solo descarga
// estas cadenas y no todo el contenido de la página.
import type { Lang } from "./content";

export interface LoginCopy {
  title: string;
  subtitle: string;
  email: string;
  emailPlaceholder: string;
  password: string;
  forgot: string;
  showPassword: string;
  hidePassword: string;
  submit: string;
  submitting: string;
  noAccount: string;
  talk: string;
  errors: {
    invalid: string;
    tooMany: string;
    network: string;
    generic: string;
    otpInvalid: string;
    otpSend: string;
  };
  otp: {
    title: string;
    subtitle: (email: string) => string;
    label: string;
    submit: string;
    resend: string;
    resendIn: (seconds: number) => string;
    back: string;
    paste: string;
    pasteEmpty: string;
  };
  reset: {
    title: string;
    subtitle: string;
    submit: string;
    sent: (email: string) => string;
    back: string;
    error: string;
  };
  expired: {
    title: string;
    subtitle: string;
    newPassword: string;
    confirm: string;
    submit: string;
    rules: { id: "length" | "lower" | "upper" | "digit" | "special"; label: string }[];
    mismatch: string;
    error: string;
  };
  redirecting: string;
  close: string;
  language: string;
}

const PASSWORD_RULES_ES: LoginCopy["expired"]["rules"] = [
  { id: "length", label: "Entre 8 y 32 caracteres" },
  { id: "lower", label: "Una minúscula" },
  { id: "upper", label: "Una mayúscula" },
  { id: "digit", label: "Un número" },
  { id: "special", label: "Un carácter especial" }
];

const PASSWORD_RULES_EN: LoginCopy["expired"]["rules"] = [
  { id: "length", label: "8 to 32 characters" },
  { id: "lower", label: "One lowercase letter" },
  { id: "upper", label: "One uppercase letter" },
  { id: "digit", label: "One number" },
  { id: "special", label: "One special character" }
];

const es: LoginCopy = {
  title: "Inicia sesión",
  subtitle: "Entra a Cashport con tu cuenta.",
  email: "Correo",
  emailPlaceholder: "nombre@empresa.com",
  password: "Contraseña",
  forgot: "¿La olvidaste?",
  showPassword: "Mostrar contraseña",
  hidePassword: "Ocultar contraseña",
  submit: "Entrar",
  submitting: "Entrando…",
  noAccount: "¿Aún no operamos tu proceso?",
  talk: "Hablemos",
  errors: {
    invalid: "Correo o contraseña incorrectos.",
    tooMany: "Demasiados intentos. Espera unos minutos o restablece tu contraseña.",
    network: "No pudimos conectarnos. Revisa tu conexión e inténtalo de nuevo.",
    generic: "No pudimos iniciar sesión. Inténtalo de nuevo.",
    otpInvalid: "El código no es válido o ya venció. Verifícalo e inténtalo de nuevo.",
    otpSend: "No pudimos enviar el código. Inténtalo de nuevo en un momento."
  },
  otp: {
    title: "Revisa tu correo",
    subtitle: (email) => `Enviamos un código de 6 dígitos a ${email}.`,
    label: "Código de acceso",
    submit: "Verificar y entrar",
    resend: "Reenviar código",
    resendIn: (s) => `Reenviar en ${s} s`,
    back: "Usar otra cuenta",
    paste: "Pegar",
    pasteEmpty: "No encontramos un código de 6 dígitos en lo que copiaste."
  },
  reset: {
    title: "Restablece tu contraseña",
    subtitle: "Te enviaremos un enlace para crear una nueva.",
    submit: "Enviar enlace",
    sent: (email) =>
      `Si ${email} tiene cuenta en Cashport, te llegará un correo con las instrucciones.`,
    back: "Volver a iniciar sesión",
    error: "No pudimos enviar el correo. Inténtalo de nuevo."
  },
  expired: {
    title: "Tu contraseña venció",
    subtitle: "Crea una nueva para continuar.",
    newPassword: "Nueva contraseña",
    confirm: "Confirma la contraseña",
    submit: "Guardar y entrar",
    rules: PASSWORD_RULES_ES,
    mismatch: "Las contraseñas no coinciden.",
    error: "No pudimos actualizar la contraseña. Inténtalo de nuevo."
  },
  redirecting: "Abriendo Cashport…",
  close: "Cerrar",
  language: "Idioma de la página"
};

const en: LoginCopy = {
  title: "Sign in",
  subtitle: "Access Cashport with your account.",
  email: "Email",
  emailPlaceholder: "name@company.com",
  password: "Password",
  forgot: "Forgot it?",
  showPassword: "Show password",
  hidePassword: "Hide password",
  submit: "Sign in",
  submitting: "Signing in…",
  noAccount: "Not working with us yet?",
  talk: "Let’s talk",
  errors: {
    invalid: "Incorrect email or password.",
    tooMany: "Too many attempts. Wait a few minutes or reset your password.",
    network: "We couldn’t connect. Check your connection and try again.",
    generic: "We couldn’t sign you in. Please try again.",
    otpInvalid: "The code is invalid or has expired. Check it and try again.",
    otpSend: "We couldn’t send the code. Please try again in a moment."
  },
  otp: {
    title: "Check your email",
    subtitle: (email) => `We sent a 6-digit code to ${email}.`,
    label: "Access code",
    submit: "Verify and sign in",
    resend: "Resend code",
    resendIn: (s) => `Resend in ${s}s`,
    back: "Use another account",
    paste: "Paste",
    pasteEmpty: "We couldn’t find a 6-digit code in what you copied."
  },
  reset: {
    title: "Reset your password",
    subtitle: "We’ll email you a link to create a new one.",
    submit: "Send link",
    sent: (email) =>
      `If ${email} has a Cashport account, you’ll receive an email with instructions.`,
    back: "Back to sign in",
    error: "We couldn’t send the email. Please try again."
  },
  expired: {
    title: "Your password has expired",
    subtitle: "Create a new one to continue.",
    newPassword: "New password",
    confirm: "Confirm password",
    submit: "Save and sign in",
    rules: PASSWORD_RULES_EN,
    mismatch: "Passwords don’t match.",
    error: "We couldn’t update your password. Please try again."
  },
  redirecting: "Opening Cashport…",
  close: "Close",
  language: "Page language"
};

export const LOGIN_COPY: Record<Lang, LoginCopy> = { es, en };
