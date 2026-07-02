"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { Language } from "@/lib/translations";
import { getTranslation, type TranslationKey } from "@/lib/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("pt-BR");
  const [mounted, setMounted] = useState(false);

  // Carrega idioma do localStorage na montagem
  useEffect(() => {
    const savedLanguage = localStorage.getItem("platform-language") as Language | null;
    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("platform-language", lang);
    document.documentElement.lang = lang === "en" ? "en" : "pt-BR";
  };

  const t = (key: TranslationKey): string => {
    return getTranslation(language, key);
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Retorna valor padrão em vez de lançar erro
    return {
      language: "pt-BR" as Language,
      setLanguage: () => {},
      t: (key: TranslationKey) => key,
    };
  }
  return context;
}
