import { languages } from "../../i18n/translations";
import { usePlatform } from "../../context/PlatformContext";

const LanguageSwitcher = () => {
  const { language, changeLanguage } = usePlatform();

  return (
    <label className="inline-flex items-center gap-2 text-sm text-slate-300">
      <span className="hidden sm:block">Lang</span>
      <select
        className="rounded-xl border border-white/20 bg-black/20 px-3 py-2 text-sm text-slate-100 outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-400"
        value={language}
        aria-label="Language switcher"
        onChange={(event) => changeLanguage(event.target.value)}
      >
        {languages.map((item) => (
          <option key={item.code} value={item.code}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
};

export default LanguageSwitcher;
