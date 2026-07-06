export const NEW_ADDRESS_OPTION = {
  value: "new_address",
  label: "+ Nueva dirección"
};

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const isValidEmail = (value: string) => EMAIL_REGEX.test(value.trim());

export const isValidPhone = (telefono: string, _indicativo: string) => {
  const digits = telefono.trim();
  if (!/^\d+$/.test(digits)) return false;

  // if (indicativo === "+57") return digits.length === 10;
  // return digits.length >= 10 && digits.length <= 12;
  return true;
};

export const phoneErrorMessage = (indicativo: string) =>
  indicativo === "+57"
    ? "Teléfono debe tener 10 dígitos"
    : "Teléfono debe tener entre 10 y 12 dígitos";
