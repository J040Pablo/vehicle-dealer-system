# Frontend – Vehicle Dealer UI

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Radix UI](https://img.shields.io/badge/Radix_UI-Components-161616?style=for-the-badge&logo=radix-ui&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Nginx_Alpine-2496ED?style=for-the-badge&logo=docker&logoColor=white)

Interface Web moderna, reativa e acessível para gestão de veículos e concessionárias. Construída com React 18, TypeScript, Vite, TanStack Query e Tailwind CSS.

---

## 🛠️ Tecnologias Utilizadas

* **React 18**: Biblioteca principal para construção da interface baseada em componentes reutilizáveis.
* **TypeScript 5**: Tipagem estática end-to-end, garantindo segurança em tempo de desenvolvimento.
* **Vite**: Bundler de altíssima velocidade para desenvolvimento e build otimizado.
* **TanStack Query v5 (React Query)**: Gerenciamento de estado assíncrono, cache automático, invalidação de queries e paginação server-side.
* **React Hook Form & Zod**: Formatação, gerenciamento de formulários performático e validação de esquemas de dados.
* **Axios**: Cliente HTTP para consumo da API RESTful com suporte a interceptores.
* **Tailwind CSS & Radix UI**: Estilização utilitária aliada a componentes acessíveis (Dialogs, Dropdowns, Selects, Toasts).
* **Lucide React**: Biblioteca de ícones modernos e leves.
* **React Router DOM v6**: Roteamento SPA (Single Page Application) declarativo.

---

## 🏛️ Arquitetura do Módulo Web

O projeto adota a arquitetura baseada em **Módulos por Domínio de Negócio (Feature-First Architecture)**, separando responsabilidades de forma clara e escalável:

```text
frontend/src/
├── app/               # Provedores globais (QueryClientProvider, ThemeProvider, ToastProvider)
├── modules/           # Módulos por Domínio de Negócio
│   ├── dashboard/     # Métricas, estatísticas e visão geral do sistema
│   ├── dealers/       # Páginas, formulários e modais do domínio de Concessionárias
│   └── vehicles/      # Páginas, formulários e modais do domínio de Veículos
├── router/            # Configuração de rotas da aplicação (React Router DOM)
└── shared/            # Recursos compartilhados entre múltiplos módulos
    ├── api/           # Cliente Axios e interceptores HTTP
    ├── components/    # Componentes UI reutilizáveis (Tabelas, Modais, Banners, Paginação)
    ├── hooks/         # Hooks customizados reutilizáveis
    ├── layouts/       # Layout principal (Sidebar, Header, Container)
    ├── types/         # Interfaces e Types TypeScript compartilhados
    └── utils/         # Utilitários de formatação (CNPJ, CEP, Moeda, Placa)
```

---

## 📂 Estrutura de Pastas Detalhada

```text
src/
├── modules/
│   ├── dealers/
│   │   ├── components/      # DealerFormModal, DealerTable, DealerActions
│   │   ├── hooks/           # useDealers, useCreateDealer, useUpdateDealer, useDeleteDealer
│   │   └── pages/           # DealersPage.tsx
│   ├── vehicles/
│   │   ├── components/      # VehicleFormModal, VehicleTable, VehicleFilterBar
│   │   ├── hooks/           # useVehicles, useCreateVehicle, useUpdateVehicle, useDeleteVehicle
│   │   └── pages/           # VehiclesPage.tsx
│   └── dashboard/
│       └── pages/           # DashboardPage.tsx
├── shared/
│   ├── api/                 # http.ts (Axios instance + Interceptor X-Correlation-Id)
│   ├── components/ui/       # button, dialog, input, select, table, badge, pagination-controls
│   ├── layouts/             # AppLayout.tsx
│   └── types/               # dealer.ts, vehicle.ts, api.ts (PageResponse)
```

---

## ⚙️ Configuração e Variáveis de Ambiente

As variáveis de ambiente são configuradas no arquivo `.env` na raiz do módulo frontend:

```env
# URL base para a API Backend (Em desenvolvimento via Vite Proxy ou Produção)
VITE_API_BASE_URL=/api
```

### Configuração do Vite Proxy (`vite.config.ts`)
Durante o desenvolvimento local, o Vite redireciona automaticamente requisições chamadas em `/api` para a API Spring Boot em `http://localhost:8080`:

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

## 🚀 Execução do Projeto

### 1. Instalação das Dependências
```bash
npm install
```

### 2. Executar em Modo de Desenvolvimento
```bash
npm run dev
```
A aplicação abrirá no navegador em [http://localhost:5173](http://localhost:5173).

### 3. Verificar Tipagem e Linting
```bash
npm run lint
```

### 4. Build de Produção
```bash
npm run build
```
Os arquivos otimizados e minificados serão gerados no diretório `dist/`.

---

## 🔗 Integração com a API Backend

A comunicação HTTP é centralizada no módulo `src/shared/api/http.ts`:

1. **Cliente Axios Pré-configurado**:
   - `baseURL` configurado para `/api`.
   - Headers padrão de conteúdo `Content-Type: application/json`.

2. **Injeção Automática de Correlation ID**:
   - Um **Request Interceptor** verifica se a requisição contém o cabeçalho `X-Correlation-Id`.
   - Se ausente, gera dinamicamente um UUID com `crypto.randomUUID()` e o injeta na requisição.
   - Isso garante rastreabilidade total desde a ação do usuário no navegador até os logs do backend.

```typescript
http.interceptors.request.use((config) => {
  if (!config.headers["X-Correlation-Id"]) {
    config.headers["X-Correlation-Id"] = crypto.randomUUID();
  }
  return config;
});
```

---

## 📑 Implementação da Paginação Server-Side

O frontend utiliza paginação 100% orientada ao servidor para garantir performance em grandes conjuntos de dados:

1. **Parâmetros da API**: As requisições de listagem enviam `page` (base 0), `size` (quantidade por página) e `sort` (ex: `name,asc`).
2. **Tipagem Genérica (`PageResponse<T>`)**:
   ```typescript
   export interface PageResponse<T> {
     content: T[];
     totalPages: number;
     totalElements: number;
     size: number;
     number: number; // Página atual (0-indexed)
   }
   ```
3. **Gerenciamento de Estado com TanStack Query**:
   - Os hooks `useDealers({ page, size })` e `useVehicles({ page, size })` mantêm a query key reativa `['dealers', page, size]`.
   - O recurso `placeholderData: keepPreviousData` garante transição suave sem telas de carregamento bruscas ao mudar de página.
4. **Componente `PaginationControls`**:
   - Exibe informações de contagem de registros, botões de navegação (*Primeira*, *Anterior*, *Próxima*, *Última*) e seletor de quantidade de itens por página (5, 10, 20, 50).

---

## 📋 Tabelas e Módulos CRUD

### 1. Módulo de Concessionárias (`Dealers`)
- **Tabela de Concessionárias**: Exibe Nome, CNPJ (formatado com máscara `XX.XXX.XXX/XXXX-XX`), CEP, Cidade/UF e número de veículos vinculados.
- **Formulário de Cadastro/Edição**:
  - Ao digitar o CEP de 8 dígitos, aciona automaticamente a busca do endereço para preencher Rua, Bairro, Cidade e Estado.
  - Validação de formato de CNPJ e CEP via Zod Schema.

### 2. Módulo de Veículos (`Vehicles`)
- **Tabela de Veículos**: Exibe Marca, Modelo, Ano, Placa (formatada), Tipo de Combustível (com Badges coloridas indicando `FLEX`, `ELETRICO`, etc.) e Nome da Concessionária associada.
- **Formulário de Cadastro/Edição**:
  - Seletor dropdown dinâmico das concessionárias cadastradas.
  - Seletor de Tipo de Combustível.
  - Validação de formato de Placa (Mercosul ou padrão antigo).

---
