# Frontend - Vehicle Dealer UI

[![Frontend CI](https://github.com/J040Pablo/vehicle-dealer-system/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/J040Pablo/vehicle-dealer-system/actions/workflows/frontend-ci.yml)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-FF4154?style=flat-square&logo=reactquery&logoColor=white)](https://tanstack.com/query/latest)
[![React Hook Form](https://img.shields.io/badge/React_Hook_Form-7-EC5990?style=flat-square&logo=reacthookform&logoColor=white)](https://react-hook-form.com/)
[![Zod](https://img.shields.io/badge/Zod-3-3E67B1?style=flat-square&logo=zod&logoColor=white)](https://zod.dev/)
[![Axios](https://img.shields.io/badge/Axios-1.7-5A29E4?style=flat-square&logo=axios&logoColor=white)](https://axios-http.com/)
[![Vitest](https://img.shields.io/badge/Vitest-2.1-6E9F18?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)


Interface web responsiva para a gestão de veículos e concessionárias, construída com React 18, TypeScript, Vite, TanStack Query e Tailwind CSS.

---

## Tecnologias Utilizadas

- **React 18**: Biblioteca para construção da interface baseada em componentes reutilizáveis.
- **TypeScript 5**: Tipagem estática end-to-end.
- **Vite 5**: Ferramenta de build e servidor de desenvolvimento de alta velocidade.
- **TanStack Query v5 (React Query)**: Gerenciamento de estado assíncrono, cache automatizado e paginação server-side com a estratégia `keepPreviousData`.
- **React Hook Form & Zod**: Gerenciamento de formulários e validação de schemas (validação de formato de placa, chassi VIN de 17 caracteres e valores monetários).
- **Axios**: Cliente HTTP para comunicação com a API RESTful, configurado com interceptores para injeção automática dos cabeçalhos `Authorization: Bearer` e `X-Correlation-Id`.
- **Tailwind CSS & Radix UI**: Estilização utilitária aliada a componentes acessíveis (diálogos, menus dropdown, seletores e notificações toast).
- **Lucide React**: Biblioteca de ícones utilitários.
- **React Router DOM v6**: Roteamento Single Page Application (SPA) declarativo com proteção de rotas privadas.

---

## Arquitetura do Frontend

O projeto adota uma estrutura orientada a módulos por domínio de negócio:

```text
frontend/src/
├── app/               # Provedores globais (QueryClientProvider, ThemeProvider, ToastProvider)
├── modules/           # Módulos por domínio de negócio
│   ├── auth/          # Telas e fluxos de autenticação (Login, OAuth2 Redirect, AuthContext)
│   ├── dashboard/     # Visão geral e métricas estatísticas
│   ├── dealers/       # Páginas, formulários, tabelas e hooks de Concessionárias
│   └── vehicles/      # Páginas, formulários, tabelas, modal de detalhes e hooks de Veículos
├── router/            # Configuração de rotas e rotas protegidas (ProtectedRoute)
└── shared/            # Recursos compartilhados entre múltiplos módulos
    ├── api/           # Cliente Axios e interceptores HTTP (http.ts)
    ├── components/    # Componentes UI reutilizáveis (Tabelas, Modais, Paginação, Badges)
    ├── hooks/         # Hooks customizados reutilizáveis
    ├── layouts/       # AppLayout (Sidebar, Header, Container)
    ├── types/         # Interfaces TypeScript (dealer.ts, vehicle.ts, api.ts)
    └── utils/         # Utilitários de formatação (CNPJ, CEP, Moeda, Placa)
```

---

## Configuração e Variáveis de Ambiente

As variáveis de ambiente são configuradas no arquivo `.env` na raiz do módulo frontend:

```env
# URL base para a API Backend (Em desenvolvimento via Vite Proxy)
VITE_API_BASE_URL=/api
```

### Configuração do Proxy no Vite (`vite.config.ts`)
Em ambiente de desenvolvimento local, o Vite redireciona as requisições direcionadas para `/api` diretamente para a API Spring Boot em `http://localhost:8080`:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
```

---

## Execução do Projeto

### 1. Instalação das Dependências
```bash
npm install
```

### 2. Executar em Modo de Desenvolvimento
```bash
npm run dev
```
A aplicação estará disponível em http://localhost:5173.

### 3. Verificar Tipagem e Linting
```bash
npm run lint
```

### 4. Build de Produção
```bash
npm run build
```
Os arquivos estáticos otimizados serão gerados no diretório `dist/`.

---

## Autenticação e Integração com a API Backend

### Gerenciamento de Sessão e Interceptores Axios
A comunicação com o backend é centralizada no cliente Axios em `src/shared/api/http.ts`:

1. **Injeção de Token JWT**: O token retornado no login é mantido no armazenamento local e adicionado a todas as requisições autenticadas no cabeçalho `Authorization: Bearer <token>`.
2. **Injeção de Correlation ID**: O request interceptor injeta dinamicamente o cabeçalho `X-Correlation-Id` utilizando `crypto.randomUUID()` caso não esteja presente, garantindo rastreabilidade fim a fim.

### Fluxo de Autenticação Híbrida (Local + Google OAuth2)
- **Login Local**: Envio de credenciais para POST `/api/auth/login`, retornando o token JWT.
- **Google OAuth2**: Redirecionamento do usuário para a autorização do Google via backend. Na conclusão, o backend emite um One-Time Code temporário (TTL 30s) e redireciona para `/oauth2/redirect?code=XYZ`. O frontend consome o endpoint POST `/api/auth/oauth2/exchange` trocando o código pelo token JWT assinado final.

---

## Módulos e Componentes CRUD

### 1. Módulo de Concessionárias (Dealers)
- **Tabela de Concessionárias**: Exibe Nome, CNPJ (formatado com máscara `XX.XXX.XXX/XXXX-XX`), CEP, Cidade/UF e número de veículos vinculados.
- **Formulário de Cadastro/Edição**: Validação de CNPJ e CEP com Zod. Ao informar um CEP de 8 dígitos, o formulário aciona a busca automática via API ViaCEP preenchendo os campos de endereço com suporte a alteração manual.

### 2. Módulo de Veículos (Vehicles)
- **Tabela de Veículos**: Exibe Imagem/Thumbnail, Marca, Modelo, Ano, Placa, Tipo de Combustível (com badges visualmente diferenciadas), Valor (formatado em R$) e Concessionária vinculada. A coluna de Chassi foi intencionalmente removida da tabela principal para evitar poluição visual.
- **Formulário de Cadastro/Edição**: Seleção de Concessionária, Tipo de Combustível, validação de Placa (padrão antigo ou Mercosul), validação de Chassi VIN de 17 caracteres e inserção de valor monetário em R$.
- **Modal de Detalhes do Veículo (`VehicleDetailsModal`)**: Exibe as informações completas do veículo selecionado em um modal dedicado de leitura, apresentando foto em alta resolução, Chassi completo (VIN), valor formatado, datas de cadastro/atualização e dados da concessionária associada.
- **Gerenciamento de Imagens**: Permite a seleção e upload de foto do veículo via requisição multipart enviada para o backend com armazenamento integrado no AWS S3.

---

## Paginação Server-Side

A listagem de dados utiliza paginação 100% orientada ao servidor via parâmetros `page` (0-indexed), `size` e `sort`. Os hooks `useDealers` e `useVehicles` utilizam TanStack Query para gerenciar a reatividade das consultas e garantir transição sem flicker através do componente `PaginationControls`.
