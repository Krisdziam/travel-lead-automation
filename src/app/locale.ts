export const DEFAULT_LOCALE = "uk" as const;
export const LOCALE_COOKIE = "mandra_locale";

export type Locale = "uk" | "en";

export function isLocale(value: string | undefined): value is Locale {
  return value === "uk" || value === "en";
}

export function readStoredLocale(): Locale {
  if (typeof document === "undefined") return DEFAULT_LOCALE;

  const savedLocale = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${LOCALE_COOKIE}=`))
    ?.split("=")[1];

  return isLocale(savedLocale) ? savedLocale : DEFAULT_LOCALE;
}
