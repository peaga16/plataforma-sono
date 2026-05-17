# 🌙 Plataforma do Sono

Plataforma educacional digital de higiene do sono aplicada ao desempenho esportivo. Desenvolvida para pesquisa científica, permite que pesquisadores acompanhem o progresso de atletas em um programa de 7 dias com conteúdo sobre qualidade do sono.

---

## Funcionalidades

- **Painel do pesquisador** — cadastro de atletas, acompanhamento de progresso e geração de QR Codes
- **Jornada do atleta** — 7 dias de conteúdo educacional com vídeos e recomendações
- **QR Codes por dia** — um QR Code único por dia para fixar na sala, sem necessidade de login individual
- **Confirmação por código** — atletas inserem seu código (ex: `ATL001`) para registrar presença
- **Progresso sequencial** — cada dia só é desbloqueado após completar o anterior

---

## Stack

- **Framework:** Next.js 15 (App Router)
- **Banco de dados:** PostgreSQL via Prisma ORM
- **Autenticação:** NextAuth.js (sessão JWT)
- **Deploy:** Vercel

---

## Estrutura do projeto

```
src/
├── app/
│   ├── api/                  # Rotas de API
│   │   ├── auth/             # NextAuth
│   │   ├── dashboard/        # Listagem de atletas
│   │   ├── batch-register/   # Cadastro em lote
│   │   ├── progress/         # Progresso (usuário autenticado)
│   │   └── progress-by-code/ # Progresso por código (público)
│   ├── atleta/               # Área do atleta (requer login)
│   ├── dashboard/            # Painel do pesquisador
│   │   └── qrcodes/          # Página de impressão dos QR Codes
│   ├── dia/[day]/            # Página pública de cada dia
│   ├── login/
│   └── register/
├── content/
│   └── days.ts               # Conteúdo dos 7 dias
├── components/
├── lib/
│   ├── auth.ts               # Configuração de autenticação
│   ├── prisma.ts
│   └── progress.ts
└── middleware.ts
```

---

## Configuração local

### Pré-requisitos

- Node.js 18+
- PostgreSQL

### Instalação

```bash
git clone https://github.com/peaga16/plataforma-sono
cd plataforma-sono
npm install
```

### Variáveis de ambiente

Crie um arquivo `.env` na raiz:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/plataforma_sono"
NEXTAUTH_SECRET="sua-chave-secreta-longa"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="admin@sono.com"
ADMIN_PASSWORD="sua-senha-admin"
```

### Banco de dados

```bash
npx prisma migrate dev
npx prisma generate
```

### Rodar em desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## Deploy no Vercel

1. Conecte o repositório no [vercel.com](https://vercel.com)
2. Configure as variáveis de ambiente em **Settings → Environment Variables**:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (URL do projeto no Vercel)
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
3. O build já inclui `prisma generate` automaticamente

---

## Como usar

### Pesquisador

1. Acesse `/login` e entre com as credenciais de admin
2. No painel, cadastre atletas (um por linha) — os códigos `ATL001`, `ATL002`... são gerados automaticamente
3. Vá em **QR Codes**, imprima e cole na sala o QR do dia correspondente

### Atleta

1. Escaneie o QR Code do dia com o celular
2. Assista ao vídeo educativo completo
3. Digite seu código de atleta e confirme a presença

---

## Licença

Projeto de pesquisa — uso acadêmico.