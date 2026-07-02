# Sistema de Acessibilidade e Internacionalização

## 📋 Visão Geral

Este documento descreve o sistema de **Acessibilidade** e **Internacionalização (i18n)** implementado na Plataforma do Sono.

### ✨ Recursos Principais

- ✅ **Suporte a múltiplos idiomas** (Português Brasil, Inglês)
- ✅ **Menu de Acessibilidade** (♿ ícone no header)
- ✅ **Seletor de Idioma** com armazenamento em localStorage
- ✅ **Fácil de expandir** para novos idiomas
- ✅ **TypeScript** com tipos completos

---

## 🏗️ Arquivos Criados

### 1. **`src/lib/translations.ts`**
Central de traduções do projeto. Contém:
- Dicionário de todas as strings em múltiplos idiomas
- Função `getTranslation()` para recuperar strings
- Tipos TypeScript para segurança

### 2. **`src/components/providers/language-provider.tsx`**
Context React que gerencia o estado do idioma globalmente:
- Hook `useLanguage()` para acessar o idioma em qualquer componente
- Persistência em localStorage
- Função `t()` para traduzir strings

### 3. **`src/components/accessibility-menu.tsx`**
Componente visual do menu de acessibilidade:
- Botão com ícone ♿ no header
- Menu dropdown com seletor de idioma
- Espaço reservado para futuras opções de acessibilidade visual

---

## 🚀 Como Usar

### Em Componentes Client-Side

```tsx
"use client";

import { useLanguage } from "@/components/providers/language-provider";

export function MyComponent() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div>
      {/* Usar tradução */}
      <h1>{t("heroTitle")}</h1>
      
      {/* Mudar idioma programaticamente */}
      <button onClick={() => setLanguage("en")}>
        Mudar para Inglês
      </button>

      {/* Ver idioma atual */}
      <p>Idioma: {language}</p>
    </div>
  );
}
```

---

## ➕ Como Adicionar Novas Traduções

### 1. Adicionar Chave em `src/lib/translations.ts`

```typescript
export const translations = {
  "pt-BR": {
    // ... outras chaves
    "myNewFeature": "Minha Nova Funcionalidade",
  },
  "en": {
    // ... outras chaves
    "myNewFeature": "My New Feature",
  },
} as const;
```

### 2. Usar em Componente

```tsx
const { t } = useLanguage();

<h2>{t("myNewFeature")}</h2>
```

---

## 🌐 Como Adicionar Novo Idioma

### 1. Adicionar Idioma ao Dicionário

```typescript
// src/lib/translations.ts
export const translations = {
  "pt-BR": { /* ... */ },
  "en": { /* ... */ },
  "es": {  // Novo idioma
    "platformName": "Plataforma del Sueño",
    "heroTitle": "Higiene del Sueño",
    // ... todas as chaves
  },
} as const;
```

### 2. Adicionar Botão no Menu de Acessibilidade

```tsx
// src/components/accessibility-menu.tsx
<LanguageButton
  isActive={language === "es"}
  onClick={() => {
    setLanguage("es");
    setIsOpen(false);
  }}
  label="Español"
/>
```

### 3. Atualizar Type (Automático)

TypeScript atualizará automaticamente o tipo `Language` para incluir `"es"`.

---

## 📋 Checklist para Expansão

- [ ] Adicionar nova chave em ambos os idiomas (pt-BR e en)
- [ ] Usar `t("chaveNova")` nos componentes
- [ ] Testar em ambos os idiomas
- [ ] Se for novo idioma: adicionar entrada no dicionário
- [ ] Se for novo idioma: adicionar botão no `AccessibilityMenu`

---

## 🎨 Estrutura do Menu de Acessibilidade

```
┌─────────────────────────┐
│  ♿ Acessibilidade   ✕  │
├─────────────────────────┤
│ Idioma                  │
│ ☐ Português (Brasil) ✓ │
│ ☐ English              │
├─────────────────────────┤
│ Visual                  │
│ Opções adicionais...    │
└─────────────────────────┘
```

---

## 🔒 Segurança (Environment Variables)

⚠️ **IMPORTANTE**: Este sistema não interfere com `.env`:
- Configurações de idioma são armazenadas APENAS em localStorage
- Nenhuma chamada à API é feita para mudar idioma
- O `env` do seu projeto permanece intacto

---

## 📱 Responsividade

O menu de acessibilidade é totalmente responsivo:
- Funciona em desktop e mobile
- Posicionamento ajusta automaticamente
- Toque fora do menu fecha (também em mobile)

---

## 🧪 Testando

1. **Abra a página inicial**
2. **Clique no botão ♿ (canto superior direito)**
3. **Selecione "English"**
4. **Veja o site em inglês**
5. **Recarregue a página** → O idioma persiste

---

## 🐛 Troubleshooting

### "useLanguage deve ser usado dentro de LanguageProvider"
- Certifique-se de que o componente está envolvido pelo `LanguageProvider`
- Verificar que `layout.tsx` tem `<LanguageProvider>`

### Componente não atualiza ao mudar idioma
- Use `"use client"` no topo do arquivo
- Certifique-se de estar usando `useLanguage()` hook

### localStorage não está funcionando
- Verificar se o navegador permite localStorage
- Verificar console para erros

---

## 📚 Próximos Passos Sugeridos

1. **Acessibilidade Visual**: Adicionar tema escuro/claro, maior tamanho de fonte
2. **Mais idiomas**: Espanhol, Francês, etc.
3. **i18n avançado**: Integrar com bibliotecas como `next-intl`
4. **Tradução de conteúdo dinâmico**: Integrar com CMS ou API

---

**Desenvolvido com ❤️ para a Plataforma do Sono**
