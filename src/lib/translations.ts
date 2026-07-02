// Dicionário de traduções - Adicione aqui conforme necessário
export const translations = {
  "pt-BR": {
    // Header
    "platformName": "Plataforma do Sono",
    "accessLink": "Acessar →",
    
    // Badge
    "researchProgram": "Programa de Pesquisa — 7 dias",
    
    // Hero
    "heroTitle": "Higiene do Sono",
    "heroTitleHighlight": "para Atletas",
    "heroDescription": "Programa educacional digital aplicado ao desempenho esportivo.",
    "heroSubDescription": "Sete dias de conteúdo científico sobre recuperação e sono.",
    "ctaButton": "Acessar a plataforma",
    
    // Footer
    "developedBy": "Desenvolvido por",
    "visitLinkedin": "→ Clique para visitar o LinkedIn",
    "research": "Pesquisa em Ciências do Esporte",
    
    // Accessibility Tab
    "accessibility": "Acessibilidade",
    "language": "Idioma",
    "selectLanguage": "Selecionar idioma",
    "portuguese": "Português (Brasil)",
    "english": "English",
    
    // Common
    "close": "Fechar",
    "settings": "Configurações",
  },
  "en": {
    // Header
    "platformName": "Sleep Platform",
    "accessLink": "Access →",
    
    // Badge
    "researchProgram": "Research Program — 7 days",
    
    // Hero
    "heroTitle": "Sleep Hygiene",
    "heroTitleHighlight": "for Athletes",
    "heroDescription": "Digital educational program applied to sports performance.",
    "heroSubDescription": "Seven days of scientific content about recovery and sleep.",
    "ctaButton": "Access the platform",
    
    // Footer
    "developedBy": "Developed by",
    "visitLinkedin": "→ Click to visit LinkedIn",
    "research": "Research in Sports Science",
    
    // Accessibility Tab
    "accessibility": "Accessibility",
    "language": "Language",
    "selectLanguage": "Select language",
    "portuguese": "Português (Brasil)",
    "english": "English",
    
    // Common
    "close": "Close",
    "settings": "Settings",
  },
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof (typeof translations)["pt-BR"];

export function getTranslation(language: Language, key: TranslationKey): string {
  return translations[language]?.[key] ?? translations["pt-BR"][key] ?? key;
}
