"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { Language } from "@/lib/translations";
import { getTranslation, type TranslationKey } from "@/lib/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Valor padrão para usar quando o contexto não está disponível
const DEFAULT_LANGUAGE: Language = "pt-BR";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [mounted, setMounted] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    // Carrega idioma do localStorage na montagem
    const savedLanguage = localStorage.getItem("platform-language") as Language | null;
    const activeLanguage = savedLanguage ?? DEFAULT_LANGUAGE;
    setLanguageState(activeLanguage);
    document.documentElement.lang = activeLanguage === "en" ? "en" : "pt-BR";
    setMounted(true);

    // Listener para mudanças de storage (quando muda em outra aba)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "platform-language" && e.newValue) {
        const newLanguage = e.newValue as Language;
        setLanguageState(newLanguage);
        document.documentElement.lang = newLanguage === "en" ? "en" : "pt-BR";
        setRenderKey(prev => prev + 1);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("platform-language", lang);
    document.documentElement.lang = lang === "en" ? "en" : "pt-BR";
    setRenderKey(prev => prev + 1);
  };

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    return getTranslation(language, key, params);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }} key={renderKey}>
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
      t: (key: TranslationKey, params?: Record<string, string | number>) => {
        let value: string = key;
        if (params) {
          Object.entries(params).forEach(([param, paramValue]) => {
            value = value.replace(new RegExp(`\\{${param}\\}`, "g"), String(paramValue));
          });
        }
        return value;
      },
    };
  }

  return context;
}
