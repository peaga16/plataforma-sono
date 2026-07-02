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

// Valor padrão para usar quando o contexto não está disponível
const DEFAULT_LANGUAGE: Language = "pt-BR";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Carrega idioma do localStorage na montagem
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

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  
  // Se o contexto não existir, retorna um objeto funcional
  // com fallback que funciona para SSR
  if (context === undefined) {
    // Nota: Em um contexto de SSR, setLanguage não vai funcionar
    // mas pelo menos não vai quebrar o código
    return {
      language: DEFAULT_LANGUAGE,
      setLanguage: (lang: Language) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("platform-language", lang);
        }
      },
      t: (key: TranslationKey) => key,
    };
  }
  
  return context;
}
