import en from "./i18n/en_us.json";
import de from "./i18n/de_de.json";
import {get, writable} from "svelte/store";

const languages: Record<"en" | "de", typeof en> = {en, de};
export const locale = writable<keyof typeof languages>("en");

type TranslationKey = keyof typeof en;

export function t(key: TranslationKey): string {
    const currentLang = get(locale);
    return languages[currentLang][key] ?? key;
}
