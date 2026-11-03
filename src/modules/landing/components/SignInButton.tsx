"use client";

// Botón "Iniciar sesión" del encabezado. En escritorio lleva a la tarjeta de acceso, pone el
// foco en el primer campo vacío y la resalta; en celular y tablet abre la
// tarjeta como modal.
import { Icon } from "../icons";
import { isLoginModalMode, openLoginModal } from "../login-modal";

export const SignInButton = ({ label }: { label: string }) => {
  const goToLogin = () => {
    if (isLoginModalMode()) {
      openLoginModal();
      return;
    }
    const card = document.getElementById("login");
    if (!card) return;
    const fields = Array.from(card.querySelectorAll<HTMLInputElement>("input:not([hidden])"));
    const target = fields.find((field) => !field.value) ?? fields[0];
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    target?.focus({ preventScroll: true });
    card.classList.add("ring");
    window.setTimeout(() => card.classList.remove("ring"), 1200);
  };

  return (
    <button className="btn btn-navy btn-login" type="button" onClick={goToLogin}>
      {label}
      <Icon name="arrow" size={15} strokeWidth={2.2} className="arrow" />
    </button>
  );
};
