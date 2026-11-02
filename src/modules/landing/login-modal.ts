// En pantallas angostas la tarjeta de acceso no ocupa espacio en la página:
// se abre como modal desde los botones "Iniciar sesión". Mismo corte que
// landing.css (y que el zoom de escritorio).
export const LOGIN_MODAL_QUERY = "(max-width: 1023px)";
export const OPEN_LOGIN_EVENT = "cashport:open-login";

export const isLoginModalMode = () =>
  typeof window !== "undefined" && window.matchMedia(LOGIN_MODAL_QUERY).matches;

export const openLoginModal = () => window.dispatchEvent(new Event(OPEN_LOGIN_EVENT));
