"use client";

// Tarjeta de acceso de la landing. Usa el mismo flujo que /auth/login
// (Firebase → política de OTP periódico / contraseña vencida → cookie de
// sesión), pero con el diseño de la landing y en español o inglés.
// Firebase y los servicios de autenticación se cargan bajo demanda (al tocar
// el formulario): así no pesan en la carga inicial de la página pública.
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { Lang } from "../content";
import { LOGIN_COPY, type LoginCopy } from "../login-copy";
import { Icon } from "../icons";
import { LOGIN_MODAL_QUERY, OPEN_LOGIN_EVENT } from "../login-modal";

type Step = "credentials" | "otp" | "reset" | "resetSent" | "expired" | "redirecting";
type Outcome =
  | { step: "success" }
  | { step: "otp"; email: string }
  | { step: "expiredPassword"; email: string };

const LAST_EMAIL_KEY = "cp_last_email";
const OTP_RESEND_SECONDS = 60;
// Si /api/auth no responde 200, mintSessionCookie no redirige ni lanza error:
// pasado este tiempo se devuelve al usuario al formulario con un mensaje.
const REDIRECT_TIMEOUT_MS = 15000;

const loadAuth = () => import("../../../../firebase-utils");
const loadPolicy = () => import("@/services/auth/authPolicy");
const loadUsers = () => import("@/services/users/users");

const PASSWORD_CHECKS: Record<
  LoginCopy["expired"]["rules"][number]["id"],
  (pw: string) => boolean
> = {
  length: (pw) => pw.length >= 8 && pw.length <= 32,
  lower: (pw) => /[a-z]/.test(pw),
  upper: (pw) => /[A-Z]/.test(pw),
  digit: (pw) => /\d/.test(pw),
  special: (pw) => /[!@#$%^&*(),.?":{}|<>]/.test(pw)
};

const firebaseErrorMessage = (error: unknown, copy: LoginCopy) => {
  const code = (error as { code?: string })?.code ?? "";
  if (
    [
      "auth/invalid-credential",
      "auth/invalid-login-credentials",
      "auth/wrong-password",
      "auth/user-not-found",
      "auth/invalid-email",
      "auth/user-disabled"
    ].includes(code)
  ) {
    return copy.errors.invalid;
  }
  if (code === "auth/too-many-requests") return copy.errors.tooMany;
  if (code === "auth/network-request-failed") return copy.errors.network;
  return copy.errors.generic;
};

// El backend responde en español; en inglés se muestra el texto propio.
const backendMessage = (lang: Lang, message: string | undefined, fallback: string) =>
  lang === "es" && message ? message : fallback;

// Toma el código aunque venga dentro de un texto ("Tu código es 123456").
const extractOtp = (text: string) => {
  const inText = text.match(/(?:^|\D)(\d{6})(?!\d)/);
  if (inText) return inText[1];
  const digits = text.replace(/\D/g, "");
  return digits.length === 6 ? digits : null;
};

const readLastEmail = () => {
  try {
    return localStorage.getItem(LAST_EMAIL_KEY) ?? "";
  } catch {
    return "";
  }
};

const saveLastEmail = (email: string) => {
  try {
    localStorage.setItem(LAST_EMAIL_KEY, email);
  } catch {
    // Almacenamiento bloqueado (modo privado): recordar el correo es opcional.
  }
};

export const LandingLogin = ({ lang, contactHref }: { lang: Lang; contactHref: string }) => {
  const copy = LOGIN_COPY[lang];
  const router = useRouter();
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [isModal, setIsModal] = useState(false);
  const [open, setOpen] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);
  const firstRender = useRef(true);
  const [canPaste, setCanPaste] = useState(false);

  useEffect(() => {
    setCanPaste(typeof navigator !== "undefined" && !!navigator.clipboard?.readText);
  }, []);

  useEffect(() => {
    const last = readLastEmail();
    if (last) setEmail((current) => current || last);
  }, []);

  // Al cambiar de paso, el foco va al título para que lectores de pantalla
  // anuncien el nuevo estado (no en la primera carga).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  useEffect(() => {
    if (step !== "redirecting") return;
    const timer = setTimeout(() => {
      setStep("credentials");
      setError(copy.errors.generic);
    }, REDIRECT_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [step, copy]);

  const prefetchAuth = useCallback(() => {
    void loadAuth();
    void loadPolicy();
  }, []);

  // Modo modal (celular y tablet): la tarjeta se abre desde "Iniciar sesión".
  useEffect(() => {
    const media = window.matchMedia(LOGIN_MODAL_QUERY);
    const sync = () => {
      setIsModal(media.matches);
      if (!media.matches) setOpen(false);
    };
    sync();
    media.addEventListener("change", sync);
    const onOpen = () => {
      triggerRef.current = document.activeElement as HTMLElement | null;
      setOpen(true);
      prefetchAuth();
    };
    window.addEventListener(OPEN_LOGIN_EVENT, onOpen);
    return () => {
      media.removeEventListener("change", sync);
      window.removeEventListener(OPEN_LOGIN_EVENT, onOpen);
    };
  }, [prefetchAuth]);

  const modalOpen = isModal && open;

  const closeModal = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    const card = cardRef.current;
    const fields = Array.from(
      card?.querySelectorAll<HTMLInputElement>("input:not([hidden])") ?? []
    );
    // Se enfoca un instante después: mientras la hoja aparece (visibility en
    // transición) el navegador ignora el foco.
    const focusTimer = window.setTimeout(
      () => (fields.find((field) => !field.value) ?? fields[0])?.focus({ preventScroll: true }),
      60
    );

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
        return;
      }
      if (event.key !== "Tab" || !card) return;
      const focusable = Array.from(
        card.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input:not([hidden])")
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(focusTimer);
      root.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [modalOpen, closeModal]);

  const goTo = (next: Step) => {
    setError("");
    setLoading(false);
    setStep(next);
  };

  const sendOtp = async () => {
    const { sendLoginOtp } = await loadPolicy();
    const result = await sendLoginOtp();
    if (result.status !== 200) {
      setError(backendMessage(lang, result.message, copy.errors.otpSend));
      return false;
    }
    setResendIn(OTP_RESEND_SECONDS);
    return true;
  };

  const handleOutcome = async (outcome: Outcome | { step: "error" }) => {
    if (outcome.step === "success") {
      goTo("redirecting");
      return;
    }
    if (outcome.step === "expiredPassword") {
      setNewPassword("");
      setConfirmPassword("");
      goTo("expired");
      return;
    }
    if (outcome.step === "otp") {
      setOtp("");
      const sent = await sendOtp();
      setLoading(false);
      if (sent) goTo("otp");
      return;
    }
    setLoading(false);
    setError(copy.errors.generic);
  };

  const onCredentials = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const cleanEmail = email.trim();
    saveLastEmail(cleanEmail);
    try {
      const { signInAndCheckPolicy } = await loadAuth();
      const outcome = await signInAndCheckPolicy(cleanEmail, password, router);
      setPassword("");
      await handleOutcome(outcome);
    } catch (err) {
      setLoading(false);
      setError(firebaseErrorMessage(err, copy));
    }
  };

  const verifyOtp = async (code: string) => {
    if (code.length !== 6 || loading) return;
    setError("");
    setLoading(true);
    const { verifyLoginOtp } = await loadPolicy();
    const result = await verifyLoginOtp(code);
    if (result.status !== 200) {
      setLoading(false);
      setOtp("");
      setError(backendMessage(lang, result.message, copy.errors.otpInvalid));
      return;
    }
    try {
      const { continueLoginAfterAuth } = await loadAuth();
      await handleOutcome(await continueLoginAfterAuth(router));
    } catch {
      setLoading(false);
      setError(copy.errors.generic);
    }
  };

  const onOtp = (event: FormEvent) => {
    event.preventDefault();
    void verifyOtp(otp);
  };

  // Pegar el código: desde el botón (lee el portapapeles) o con Ctrl+V / el
  // menú del celular. En ambos casos se completa y se verifica de una vez.
  const applyPastedOtp = (text: string) => {
    const code = extractOtp(text);
    if (!code) return false;
    setOtp(code);
    void verifyOtp(code);
    return true;
  };

  const onPasteButton = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!applyPastedOtp(text)) setError(copy.otp.pasteEmpty);
    } catch {
      // Permiso denegado: el usuario puede pegar a mano en la caja.
      otpInputRef.current?.focus();
    }
  };

  const onResend = async () => {
    setError("");
    await sendOtp();
  };

  const onReset = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { sendEmailResetPassword } = await loadUsers();
      await sendEmailResetPassword(email.trim());
      goTo("resetSent");
    } catch {
      setLoading(false);
      setError(copy.reset.error);
    }
  };

  const passwordRulesOk = copy.expired.rules.every((rule) => PASSWORD_CHECKS[rule.id](newPassword));
  const passwordsMatch = newPassword === confirmPassword;

  const onExpired = async (event: FormEvent) => {
    event.preventDefault();
    if (!passwordRulesOk) return;
    if (!passwordsMatch) {
      setError(copy.expired.mismatch);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const [{ changePassword }, { completeLoginAfterPasswordChange }] = await Promise.all([
        loadPolicy(),
        loadAuth()
      ]);
      await changePassword(newPassword);
      await handleOutcome(
        await completeLoginAfterPasswordChange(email.trim(), newPassword, router)
      );
    } catch (err) {
      setLoading(false);
      const message = (err as { message?: string })?.message;
      setError(backendMessage(lang, message, copy.expired.error));
    }
  };

  const errorBox = error ? (
    <p className="login-error" role="alert" id="login-error">
      <Icon name="alert" size={16} strokeWidth={2} />
      <span>{error}</span>
    </p>
  ) : null;

  const submitButton = (label: string, disabled = false) => (
    <button
      className="btn btn-orange"
      type="submit"
      disabled={loading || disabled}
      aria-busy={loading}
    >
      {loading ? <span className="spinner" aria-hidden="true" /> : null}
      {loading ? copy.submitting : label}
    </button>
  );

  const backButton = (label: string, to: Step) => (
    <button type="button" className="link-btn back" onClick={() => goTo(to)}>
      <Icon name="back" size={15} strokeWidth={2} />
      {label}
    </button>
  );

  return (
    <div
      className={modalOpen ? "login-shell open" : "login-shell"}
      onClick={(event) => {
        if (modalOpen && event.target === event.currentTarget) closeModal();
      }}
    >
      <div
        id="login"
        ref={cardRef}
        className="login"
        onFocusCapture={prefetchAuth}
        onPointerEnter={prefetchAuth}
        data-step={step}
        role={modalOpen ? "dialog" : undefined}
        aria-modal={modalOpen || undefined}
        aria-labelledby={modalOpen ? "login-title" : undefined}
      >
        <div className="login-bar">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/cashport-logo.webp" alt="Cashport" width={108} height={20} />
          <nav className="lang" aria-label={copy.language}>
            <a
              href="/?lang=es"
              hrefLang="es"
              lang="es"
              aria-current={lang === "es" ? "true" : undefined}
            >
              ES
            </a>
            <a
              href="/en?lang=en"
              hrefLang="en"
              lang="en"
              aria-current={lang === "en" ? "true" : undefined}
            >
              EN
            </a>
          </nav>
          <button
            type="button"
            className="login-close"
            onClick={closeModal}
            aria-label={copy.close}
          >
            <Icon name="close" size={20} strokeWidth={2} />
          </button>
        </div>
        {step === "credentials" && (
          <form className="login-form" onSubmit={onCredentials} aria-labelledby="login-title">
            <div>
              <h2 id="login-title" ref={headingRef} tabIndex={-1}>
                {copy.title}
              </h2>
              <p className="sub">{copy.subtitle}</p>
            </div>
            <label>
              {copy.email}
              <input
                id="login-email"
                type="email"
                name="username"
                autoComplete="username"
                placeholder={copy.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!error}
                aria-describedby={error ? "login-error" : undefined}
                required
              />
            </label>
            <div className="field">
              <span className="row">
                <label htmlFor="login-password">{copy.password}</label>
                <button type="button" className="link-btn" onClick={() => goTo("reset")}>
                  {copy.forgot}
                </button>
              </span>
              <span className="pw">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!error}
                  aria-describedby={error ? "login-error" : undefined}
                  required
                />
                <button
                  type="button"
                  className="pw-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? copy.hidePassword : copy.showPassword}
                  aria-pressed={showPassword}
                >
                  <Icon name={showPassword ? "eyeOff" : "eye"} size={18} />
                </button>
              </span>
            </div>
            {errorBox}
            {submitButton(copy.submit)}
            <p className="foot">
              {copy.noAccount}{" "}
              <a
                href={contactHref}
                hrefLang={lang === "es" ? undefined : "es"}
                target="_blank"
                rel="noopener"
              >
                {copy.talk}
              </a>
            </p>
          </form>
        )}

        {step === "otp" && (
          <form className="login-form" onSubmit={onOtp} aria-labelledby="login-title">
            <div>
              <span className="login-badge" aria-hidden="true">
                <Icon name="lock" size={18} />
              </span>
              <h2 id="login-title" ref={headingRef} tabIndex={-1}>
                {copy.otp.title}
              </h2>
              <p className="sub">{copy.otp.subtitle(email.trim())}</p>
            </div>
            <div className="field">
              <span className="row">
                <label htmlFor="login-otp">{copy.otp.label}</label>
                {canPaste && (
                  <button
                    type="button"
                    className="link-btn paste-btn"
                    onClick={onPasteButton}
                    disabled={loading}
                  >
                    <Icon name="clipboard" size={14} strokeWidth={2} />
                    {copy.otp.paste}
                  </button>
                )}
              </span>
              <input
                id="login-otp"
                ref={otpInputRef}
                className="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d{6}"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onPaste={(e) => {
                  if (applyPastedOtp(e.clipboardData.getData("text"))) e.preventDefault();
                }}
                aria-invalid={!!error}
                aria-describedby={error ? "login-error" : undefined}
                autoFocus
                required
              />
            </div>
            {errorBox}
            {submitButton(copy.otp.submit, otp.length !== 6)}
            <div className="login-links">
              {backButton(copy.otp.back, "credentials")}
              <button type="button" className="link-btn" onClick={onResend} disabled={resendIn > 0}>
                {resendIn > 0 ? copy.otp.resendIn(resendIn) : copy.otp.resend}
              </button>
            </div>
          </form>
        )}

        {step === "reset" && (
          <form className="login-form" onSubmit={onReset} aria-labelledby="login-title">
            <div>
              <h2 id="login-title" ref={headingRef} tabIndex={-1}>
                {copy.reset.title}
              </h2>
              <p className="sub">{copy.reset.subtitle}</p>
            </div>
            <label>
              {copy.email}
              <input
                type="email"
                name="username"
                autoComplete="username"
                placeholder={copy.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
              />
            </label>
            {errorBox}
            {submitButton(copy.reset.submit)}
            <div className="login-links">{backButton(copy.reset.back, "credentials")}</div>
          </form>
        )}

        {step === "resetSent" && (
          <div className="login-form">
            <div>
              <span className="login-badge ok" aria-hidden="true">
                <Icon name="check" size={18} />
              </span>
              <h2 id="login-title" ref={headingRef} tabIndex={-1}>
                {copy.reset.title}
              </h2>
              <p className="sub" role="status">
                {copy.reset.sent(email.trim())}
              </p>
            </div>
            <button type="button" className="btn btn-navy" onClick={() => goTo("credentials")}>
              {copy.reset.back}
            </button>
          </div>
        )}

        {step === "expired" && (
          <form className="login-form" onSubmit={onExpired} aria-labelledby="login-title">
            <div>
              <h2 id="login-title" ref={headingRef} tabIndex={-1}>
                {copy.expired.title}
              </h2>
              <p className="sub">{copy.expired.subtitle}</p>
            </div>
            <input
              type="email"
              name="username"
              autoComplete="username"
              value={email}
              readOnly
              hidden
            />
            <label>
              {copy.expired.newPassword}
              <input
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                aria-describedby="pw-rules"
                autoFocus
                required
              />
            </label>
            <ul className="pw-rules" id="pw-rules">
              {copy.expired.rules.map((rule) => {
                const ok = PASSWORD_CHECKS[rule.id](newPassword);
                return (
                  <li key={rule.id} className={ok ? "ok" : undefined}>
                    <Icon name={ok ? "check" : "plus"} size={14} strokeWidth={2} />
                    {rule.label}
                  </li>
                );
              })}
            </ul>
            <label>
              {copy.expired.confirm}
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                aria-invalid={!!confirmPassword && !passwordsMatch}
                required
              />
            </label>
            {errorBox}
            {submitButton(copy.expired.submit, !passwordRulesOk || !confirmPassword)}
          </form>
        )}

        {step === "redirecting" && (
          <div className="login-form login-redirecting" role="status">
            <span className="spinner big" aria-hidden="true" />
            <h2 ref={headingRef} tabIndex={-1}>
              {copy.redirecting}
            </h2>
          </div>
        )}
      </div>
    </div>
  );
};
