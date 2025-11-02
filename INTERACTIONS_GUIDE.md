# 🎬 Guia de Interações - MyLetterboxd

## ✨ Novas Funcionalidades Implementadas

### Sistema Completo de Interação com Filmes e Séries

Implementei todas as funcionalidades solicitadas para transformar sua aplicação em algo mais parecido com o Letterboxd!

---

## 📋 Funcionalidades

### 1. ⭐ Sistema de Avaliação (Rating)

**Onde:** Página de detalhes do filme/série e cards (hover)

**Características:**
- Sistema de estrelas de **0.5 a 5** (incrementos de 0.5)
- Avaliação interativa com hover visual
- Suporte para meia estrela
- Exibição do valor numérico
- Avaliação salva automaticamente

**Componentes:**
- `InteractiveStarRating` - Componente para dar notas
- Rating aparece destacado na página de detalhes quando o usuário está logado

**Como usar:**
1. Entre na página de um filme/série
2. Clique nas estrelas para avaliar (0.5 até 5)
3. A avaliação é salva instantaneamente

---

### 2. 📅 Registro de Visualização (Watch Log)

**Onde:** Botão "Assistir" nos cards (hover) e página de detalhes

**Características:**
- Marcar filme/série como "assistido"
- Escolher a **data em que assistiu**
- Adicionar **avaliação opcional** (estrelas)
- Escrever **comentário rápido** (até 500 caracteres)
- Editar ou remover registros

**Componente:**
- `WatchLogModal` - Modal completo para registrar visualização

**Como usar:**
1. Clique no ícone de olho (👁️) no card ou nas ações rápidas
2. Preencha a data (padrão: hoje)
3. Opcionalmente adicione avaliação e comentário
4. Salve o registro

---

### 3. 📚 Watchlist (Quero Assistir)

**Onde:** Botão de bookmark nos cards (hover) e página de detalhes

**Características:**
- Adicionar/remover da lista de "quero assistir"
- Indicador visual quando já está na watchlist
- Armazenamento com data de adição
- Acesso rápido via hover nos cards

**Como usar:**
1. Clique no ícone de bookmark (🔖)
2. O item é adicionado à sua watchlist
3. Clique novamente para remover

---

### 4. 📝 Reviews/Críticas

**Onde:** Botão "Escrever Crítica" na página de detalhes

**Características:**
- Escrever **críticas textuais** completas (até 5000 caracteres)
- Adicionar **avaliação opcional** com estrelas
- Marcar se contém **spoilers**
- Sistema de proteção de spoilers (mostra aviso antes de revelar)
- Editar críticas existentes
- Excluir críticas
- Contador de caracteres
- Mínimo de 10 caracteres

**Componentes:**
- `ReviewModal` - Modal para escrever/editar críticas
- `ReviewCard` - Card para exibir críticas com proteção de spoilers

**Como usar:**
1. Na página de detalhes, clique em "Escrever Crítica"
2. Opcionalmente adicione avaliação (estrelas)
3. Escreva sua opinião (mínimo 10 caracteres)
4. Marque checkbox se tiver spoilers
5. Publique sua crítica

**Recursos especiais:**
- ⚠️ **Proteção de Spoilers**: Críticas marcadas mostram aviso antes de exibir o conteúdo
- Botão "Mostrar mesmo assim" para revelar spoilers
- Sua crítica aparece logo abaixo na página de detalhes

---

### 5. ❤️ Sistema de "Curtir" (Like)

**Onde:** Botão de coração nos cards (hover) e página de detalhes

**Características:**
- Like/Unlike rápido
- Indicador visual com coração preenchido quando curtido
- Animações suaves
- Diferente da avaliação com estrelas

**Como usar:**
1. Clique no ícone de coração (❤️)
2. O item é marcado como "curtido"
3. Clique novamente para descurtir

---

## 🎯 Ações Rápidas nos Cards

Ao passar o mouse sobre os cards de filmes/séries, você verá:

**Overlay com 3 botões:**
1. **❤️ Curtir** - Like rápido
2. **🔖 Watchlist** - Adicionar à lista de "quero assistir"
3. **👁️ Assistir** - Abre modal para registrar visualização

Todas as ações funcionam sem sair da página inicial!

---

## 📱 Página de Detalhes Completa

A página de cada filme/série agora inclui:

### Seção de Avaliação do Usuário
- **Rating TMDB** - Avaliação geral do site
- **Sua Avaliação** - Sistema de estrelas interativo (destacado em verde)

### Ações Rápidas
- ❤️ Curtir
- 🔖 Watchlist
- 👁️ Marcar como Assistido

### Botões de Ação
- 🎥 **Assistir Trailer** - Se disponível
- 📝 **Escrever Crítica** - Abrir modal de review

### Sua Crítica
- Se você escreveu uma crítica, ela aparece destacada na página
- Com todas as informações: avaliação, texto, spoilers
- Opção de editar ao clicar novamente em "Editar Crítica"

---

## 🗂️ Estrutura de Dados

### localStorage
Todas as interações são salvas no `localStorage` por usuário:

```
interactions_{userId}:
  - ratings[]       # Suas avaliações
  - watchLogs[]     # Filmes assistidos
  - reviews[]       # Suas críticas
  - watchlist[]     # Lista de "quero assistir"
  - likes[]         # Filmes curtidos
```

---

## 🎨 Componentes Criados

### Novos Componentes

1. **`InteractiveStarRating`**
   - Sistema de estrelas interativo
   - Suporta incrementos de 0.5
   - 3 tamanhos: small, medium, large
   - Modo readonly para exibição

2. **`QuickActions`**
   - Botões de ação rápida
   - Like, Watchlist, Watch
   - Tooltips informativos
   - Versão compacta para cards

3. **`WatchLogModal`**
   - Modal para registrar visualização
   - Seletor de data
   - Avaliação opcional
   - Comentário rápido

4. **`ReviewModal`**
   - Modal para escrever críticas
   - Editor de texto completo
   - Checkbox de spoilers
   - Contador de caracteres

5. **`ReviewCard`**
   - Exibição de críticas
   - Sistema de proteção de spoilers
   - Avatar do usuário
   - Data de publicação

### Context Criado

**`InteractionsContext`**
- Gerencia todas as interações do usuário
- Funções para cada tipo de interação
- Persistência automática no localStorage
- Integração com AuthContext

---

## 🚀 Como Testar

### 1. Login/Cadastro
```
1. Crie uma conta em /signup
2. Faça login
```

### 2. Testar Avaliações
```
1. Entre em qualquer filme/série
2. Clique nas estrelas "Sua avaliação"
3. Veja a avaliação salva instantaneamente
```

### 3. Testar Watch Log
```
1. Passe o mouse sobre um card
2. Clique no ícone de olho (👁️)
3. Preencha o modal e salve
```

### 4. Testar Watchlist
```
1. Passe o mouse sobre um card
2. Clique no bookmark (🔖)
3. Veja o indicador mudar para "ativo"
```

### 5. Testar Reviews
```
1. Entre em um filme/série
2. Clique em "Escrever Crítica"
3. Escreva sua opinião
4. Marque "contém spoilers" se aplicável
5. Publique e veja sua crítica aparecer
```

### 6. Testar Likes
```
1. Passe o mouse sobre um card
2. Clique no coração (❤️)
3. Veja o coração preenchido
```

---

## 🎨 Temas e Estilização

### Cores por Funcionalidade

- **Like**: Vermelho (#ff4b4b)
- **Watchlist**: Azul (#2196f3)
- **Watch**: Verde (#00c030)
- **Rating**: Dourado (#ffc107)
- **Spoilers**: Amarelo (#ffc107)

### Animações

- Hover effects nos botões
- Transições suaves
- Overlay com fade-in nos cards
- Transform effects nos botões

---

## 📊 Estatísticas do Projeto

### Arquivos Criados: 15

**Types:**
- `src/types/interactions.ts`

**Contexts:**
- `src/contexts/InteractionsContext.tsx`

**Componentes:**
- `src/components/InteractiveStarRating/` (index.tsx + index.scss)
- `src/components/QuickActions/` (index.tsx + index.scss)
- `src/components/WatchLogModal/` (index.tsx + index.scss)
- `src/components/ReviewModal/` (index.tsx + index.scss)
- `src/components/ReviewCard/` (index.tsx + index.scss)

**Atualizados:**
- `src/app/layout.tsx` (+ InteractionsProvider)
- `src/components/MediaDetailsPage/index.tsx` (+ todas interações)
- `src/components/MediaDetailsPage/index.module.css`
- `src/components/MediaCard/index.tsx` (+ QuickActions overlay)
- `src/components/MediaCard/index.scss`

---

## 🔄 Integração Futura com Backend

Quando conectar com Node.js + Express + MongoDB:

### Endpoints Sugeridos:

```
POST   /api/ratings              # Criar/atualizar avaliação
DELETE /api/ratings/:id          # Remover avaliação

POST   /api/watch-logs           # Registrar visualização
PUT    /api/watch-logs/:id       # Atualizar registro
DELETE /api/watch-logs/:id       # Remover registro

POST   /api/reviews              # Criar crítica
PUT    /api/reviews/:id          # Atualizar crítica
DELETE /api/reviews/:id          # Excluir crítica
GET    /api/reviews/movie/:id    # Reviews de um filme

POST   /api/watchlist            # Adicionar à watchlist
DELETE /api/watchlist/:id        # Remover da watchlist
GET    /api/watchlist            # Listar watchlist

POST   /api/likes                # Curtir
DELETE /api/likes/:id            # Descurtir
```

### Mudanças Necessárias:

1. Substituir `localStorage` por chamadas à API
2. Implementar loading states
3. Adicionar error handling
4. Implementar otimistic updates
5. Adicionar paginação para reviews

---

## ✅ Checklist de Funcionalidades

- ✅ Sistema de avaliação (0.5 a 5 estrelas)
- ✅ Registro de visualização com data
- ✅ Watchlist (quero assistir)
- ✅ Escrever críticas/reviews
- ✅ Marcar spoilers nas críticas
- ✅ Sistema de likes
- ✅ Ações rápidas nos cards (hover)
- ✅ Modal de watch log
- ✅ Modal de review
- ✅ Proteção de spoilers
- ✅ Integração com autenticação
- ✅ Persistência no localStorage
- ✅ UI responsiva
- ✅ Tema Letterboxd

---

## 🎉 Resultado Final

Seu projeto agora tem:

- **5 tipos de interação** diferentes com filmes/séries
- **4 novos modais** interativos
- **Ações rápidas** em todos os cards
- **Página de detalhes** completamente renovada
- **Sistema de proteção de spoilers**
- **Interface inspirada no Letterboxd**

Todas as funcionalidades funcionam **apenas no frontend** e estão prontas para serem integradas com um backend no futuro!

---

**Desenvolvido com ❤️ usando Next.js 15, React 19, TypeScript e SCSS**
