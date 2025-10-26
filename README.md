# TMDB Movies API - Next.js e Axios

Este é um projeto desenvolvido com [Next.js](https://nextjs.org/) para exibir filmes e séries consumindo a [API do TMDB](https://www.themoviedb.org/documentation/api).

## 🚀 Funcionalidades

- ✅ Listagem de filmes e séries populares usando a API do TMDB
- ✅ Navegação entre diferentes gêneros (Ação, Comédia, Drama, etc.)
- ✅ Alternância entre visualização de filmes e séries
- ✅ Páginas de detalhes com informações completas (sinopse, avaliação, trailer)
- ✅ Funcionalidade de busca por título
- ✅ Infinite scroll para carregamento de mais conteúdo
- ✅ Imagens otimizadas com o componente `next/image`
- ✅ Layout responsivo e estilização com SCSS
- ✅ Tratamento de erros com feedback visual

## 🛠️ Melhorias Implementadas

### 1. **Segurança e Boas Práticas**
- Chave da API TMDB movida para variáveis de ambiente (`.env.local`)
- Arquivo `.env.example` criado como referência
- Configuração centralizada da API com Axios em `src/utils/tmdb.ts`

### 2. **Refatoração de Componentes**
- Unificação dos componentes `MovieCard` e `MediaCard`
- Componente `MediaDetailsPage` reutilizável para filmes e séries
- Hook customizado `useMediaDetails` para lógica compartilhada
- Componente `ErrorMessage` para tratamento visual de erros

### 3. **Novas Funcionalidades**
- Sistema de busca completo com página de resultados (`/search`)
- Melhor tratamento de erros com opção de retry
- Feedback de loading aprimorado

### 4. **Limpeza de Código**
- Remoção de arquivos SVG não utilizados
- Eliminação de código duplicado
- Melhor organização da estrutura de arquivos

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Uma chave de API do TMDB ([obtenha aqui](https://www.themoviedb.org/settings/api))

## 🔧 Como rodar o projeto

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/tmdb-movies-api.git
   cd tmdb-movies-api
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Configure as variáveis de ambiente:**
   - Copie o arquivo `.env.example` para `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Edite `.env.local` e adicione sua chave da API TMDB:
     ```
     NEXT_PUBLIC_TMDB_API_KEY=sua_chave_aqui
     ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

5. **Acesse no navegador:**
   ```
   http://localhost:3000
   ```

## 📁 Estrutura do Projeto

```
tmdb-movies-api/
├── src/
│   ├── app/                    # Páginas do Next.js (App Router)
│   │   ├── movie/[id]/        # Página de detalhes do filme
│   │   ├── tv/[id]/           # Página de detalhes da série
│   │   ├── search/            # Página de resultados de busca
│   │   └── page.tsx           # Página inicial
│   ├── components/            # Componentes reutilizáveis
│   │   ├── ErrorMessage/      # Componente de erro
│   │   ├── Header/            # Navegação de gêneros
│   │   ├── MediaCard/         # Card unificado de mídia
│   │   ├── MediaDetailsPage/  # Página de detalhes reutilizável
│   │   ├── MovieList/         # Lista com infinite scroll
│   │   ├── Navbar/            # Barra de navegação e busca
│   │   └── StarRating/        # Exibição de avaliação
│   ├── hooks/                 # Custom hooks
│   │   └── useMediaDetails.ts # Hook para detalhes de mídia
│   ├── types/                 # TypeScript types
│   │   ├── media.ts
│   │   └── movie.ts
│   └── utils/                 # Funções utilitárias
│       └── tmdb.ts            # Configuração da API TMDB
├── public/                    # Arquivos estáticos
├── .env.local                 # Variáveis de ambiente (não versionado)
├── .env.example               # Exemplo de variáveis de ambiente
└── package.json
```

## 🎨 Tecnologias Utilizadas

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Axios** - Cliente HTTP
- **SCSS** - Estilização
- **TMDB API** - Fonte de dados de filmes e séries

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run start` - Inicia servidor de produção
- `npm run lint` - Executa linter

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.
