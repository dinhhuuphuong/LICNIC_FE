import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';

export type Language = 'vi' | 'en';

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const STORAGE_KEY = 'site_language';

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'vi';
  }

  const storedLanguage = window.localStorage.getItem(STORAGE_KEY);
  return storedLanguage === 'en' ? 'en' : 'vi';
}

export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, nextLanguage);
    }
  };

  const value = useMemo(() => ({ language, setLanguage }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }

  return context;
}
