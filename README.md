# CineSync 🎬

Uma plataforma de descoberta e acompanhamento de filmes e séries com sistema de lembretes via **WhatsApp e E-mail**.

> **Live Demo:** [tmdb-cine-sync.vercel.app](https://tmdb-cine-sync.vercel.app)

---

## ✨ Funcionalidades

### 🎥 Conteúdo & Descoberta
- Listagem de filmes e séries populares via TMDB API
- Navegação por gêneros (Ação, Comédia, Drama, etc.)
- Busca por título com resultados em tempo real
- Infinite scroll para carregamento contínuo
- Páginas de detalhes com sinopse, avaliação, trailer e **onde assistir** (streaming providers para o Brasil)

### 👤 Perfil & Social
- Autenticação completa (cadastro/login) com Supabase Auth
- Avaliação de filmes e séries com sistema de estrelas
- Escritura e edição de críticas
- Organização de conteúdo em listas personalizadas
- Log de visualizações com data e notas
- Seguir outros usuários e feed de atividade

### 🔔 Sistema de Lembretes
- Agendar lembrete para assistir um filme ou série em data e hora futura
- Receber notificação via **WhatsApp** ou **E-mail** no horário agendado
- A mensagem inclui o nome do conteúdo e os serviços de streaming disponíveis
- Arquitetura extensível para adicionar novos canais (SMS, Push, etc.)

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                   Usuário (Browser)                  │
└──────────────────┬──────────────────────────────────┘
                   │
          ┌────────▼────────┐
          │  Next.js (Vercel) │  ← CineSync Frontend
          │  /src             │
          └────────┬─────────┘
                   │  INSERT → notifications table
          ┌────────▼─────────────┐
          │    Supabase (DB)     │  ← Banco compartilhado
          │  - profiles           │
          │  - notifications      │  ← Fila de lembretes
          │  - whatsapp_sessions  │  ← Sessão Baileys persistida
          └────────┬─────────────┘
                   │  SELECT pending (a cada 1 min)
          ┌────────▼─────────────┐
          │  Notifier (Render)   │  ← Microserviço de envio
          │  Node.js + Express   │
          │  Baileys (WhatsApp)  │
          │  Resend (Email)      │
          └──────────────────────┘
```

---

## 🛠️ Stack Técnica

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript, SCSS |
| Auth & DB | Supabase (PostgreSQL + Auth) |
| Estado global | Zustand |
| Dados de filmes | TMDB API |
| Notificações (WhatsApp) | Baileys (WebSocket) |
| Notificações (Email) | Resend |
| Deploy Frontend | Vercel |
| Deploy Microserviço | Render |

---

## 📁 Estrutura do Projeto

```
cinesync/
├── src/
│   ├── app/                    # Páginas (Next.js App Router)
│   │   ├── api/reminders/      # Endpoint para salvar lembretes
│   │   ├── movie/[id]/         # Detalhes de filme
│   │   ├── tv/[id]/            # Detalhes de série
│   │   ├── search/             # Resultados de busca
│   │   ├── profile/[username]/ # Perfil público
│   │   ├── feed/               # Feed social
│   │   └── settings/           # Configurações do usuário
│   ├── components/             # Componentes React
│   │   ├── MediaDetailsPage/   # Página de detalhes (filmes e séries)
│   │   ├── ReminderModal/      # Modal de agendamento de lembrete
│   │   ├── StreamingProviders/ # Onde assistir (JustWatch via TMDB)
│   │   ├── Navbar/             # Barra de navegação
│   │   ├── MovieList/          # Lista com infinite scroll
│   │   └── ...
│   ├── stores/                 # Zustand stores
│   ├── contexts/               # Auth e Interactions contexts
│   ├── hooks/                  # Custom hooks
│   ├── lib/                    # Supabase client
│   └── utils/                  # Funções utilitárias (TMDB helpers)
│
├── notifier/                   # 🤖 Microserviço de Notificações
│   ├── src/
│   │   ├── index.ts            # Express + bootstrap
│   │   ├── config/supabase.ts  # Client Supabase (service role)
│   │   ├── services/
│   │   │   ├── whatsapp.ts     # Baileys + session persistence
│   │   │   └── email.ts        # Resend email sender
│   │   └── workers/
│   │       └── cronJob.ts      # Polling a cada 1 minuto
│   ├── .env.example
│   └── package.json
│
├── supabase/migrations/        # Migrations do banco de dados
│   ├── 01_apply_rls.sql
│   ├── ...
│   └── 06_notifications_and_wa_sessions.sql
│
└── render.yaml                 # IaC para deploy no Render
```

---

## ⚙️ Configuração Local

### Pré-requisitos
- Node.js 20+
- Conta no [Supabase](https://supabase.com) (gratuito)
- Chave da [TMDB API](https://www.themoviedb.org/settings/api) (gratuito)

### 1. Clone e instale dependências

```bash
git clone https://github.com/hugorsgarcia/tmdb-movies-api.git
cd tmdb-movies-api
npm install
```

### 2. Configure o `.env` raiz

```env
TMDB_API_KEY=sua_chave_tmdb

NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_xxx
```

### 3. Rode as migrations do banco

Execute os arquivos em `supabase/migrations/` no **SQL Editor** do Supabase (em ordem numérica).

### 4. Inicie o frontend

```bash
npm run dev
# http://localhost:3000
```

---

## 🤖 Microserviço Notifier

O microserviço roda **separado** do Next.js. Ele é responsável por:
1. Conectar ao WhatsApp via Baileys (persiste sessão no Supabase)
2. Fazer polling na tabela `notifications` a cada 1 minuto
3. Enviar mensagens pelos canais configurados

> ⚠️ **Atenção:** Nunca rode o notifier local e o Render ao mesmo tempo com a mesma sessão — isso causará conflito de sessão WhatsApp (erro 440).

### Verificar se está rodando local

```powershell
netstat -ano | findstr :3001
# Sem output = nada rodando local (seguro usar o Render)
```

### Rodando o notifier local (desenvolvimento)

```bash
cd notifier
# Crie um .env baseado no .env.example
npm install
npm run dev
# O QR Code estará em http://localhost:3001/api/qrcode
```

### Deploy no Render

O arquivo `render.yaml` na raiz já define o serviço. Configure as variáveis de ambiente no painel do Render:

| Variável | Descrição |
|---|---|
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave `service_role` (jamais expor no frontend) |
| `RESEND_API_KEY` | Chave da API do Resend (para emails) |

Após o deploy, autentique o WhatsApp acessando:
```
https://seu-servico.onrender.com/api/qrcode
```

---

## 🗃️ Banco de Dados (Supabase)

Tabelas principais:

| Tabela | Descrição |
|---|---|
| `profiles` | Perfis de usuário |
| `list_items` | Filmes/séries nas listas |
| `reviews` | Críticas escritas |
| `review_likes` | Curtidas em críticas |
| `follows` | Relacionamento seguir/seguidor |
| `notifications` | Fila de lembretes agendados |
| `whatsapp_sessions` | Chaves de sessão do Baileys (uso interno) |

---

## 📝 Scripts

### Frontend (raiz)
```bash
npm run dev      # Desenvolvimento
npm run build    # Build de produção
npm run start    # Servidor de produção
npm run lint     # Linter
```

### Notifier (`/notifier`)
```bash
npm run dev      # Desenvolvimento com hot-reload
npm run build    # Compila TypeScript
npm start        # Produção
```

---

## 📄 Licença

MIT
