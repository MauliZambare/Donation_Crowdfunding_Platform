import { useMemo } from "react";
import { translations } from "../i18n/translations";
import { usePlatform } from "../context/PlatformContext";

export default function useI18n() {
  const { language } = usePlatform();

  return useMemo(() => {
    const dictionary = translations[language] || translations.en;
    return {
      language,
      t: (key) => dictionary[key] || translations.en[key] || key,
    };
  }, [language]);
}
