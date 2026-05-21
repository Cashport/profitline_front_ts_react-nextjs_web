export const NEW_ADDRESS_OPTION = {
  value: "new_address",
  label: "+ Nueva dirección"
};

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const isValidEmail = (value: string) => EMAIL_REGEX.test(value.trim());
