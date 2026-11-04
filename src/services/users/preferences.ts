import type { Locale } from "@/i18n/config";
import { API } from "@/utils/api/api";

type ThemeValue = "light" | "dark" | "system";

export interface IUserPreferences {
  language: Locale | null;
  theme: ThemeValue | null;
}

/** Guarda en el usuario (no en el navegador) las preferencias que cambian. */
export const updateUserPreferences = async (changes: {
  language?: Locale;
  theme?: ThemeValue;
}): Promise<IUserPreferences> => {
  const response: { data: IUserPreferences } = await API.put("/user/preferences", changes);
  return response.data;
};
