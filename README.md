# Vehicle Dealer System

[![Backend CI](https://github.com/J040Pablo/vehicle-dealer-system/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/J040Pablo/vehicle-dealer-system/actions/workflows/backend-ci.yml)

[![Frontend CI](https://github.com/J040Pablo/vehicle-dealer-system/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/J040Pablo/vehicle-dealer-system/actions/workflows/frontend-ci.yml)

Sistema corporativo para gestão de concessionárias e catálogo de veículos, desenvolvido como solução para Desafio Técnico Full Stack.

---

## 📌 Visão Geral do Projeto

O **Vehicle Dealer System** é uma aplicação Full Stack projetada para centralizar o gerenciamento de concessionárias e o catálogo de veículos associados. O sistema oferece uma interface web intuitiva desenvolvida em **React 18** e **TypeScript**, suportada por uma API RESTful robusta desenvolvida em **Java 21** e **Spring Boot 3**.

---

## 🚀 Diferenciais Implementados

* 🌐 **Integração Automática ViaCEP**: Busca e auto-preenchimento automatizado de logradouro, bairro, cidade e UF a partir do CEP informado, com mecanismo resiliente de fallback manual.
* 📊 **Observabilidade Corporativa & Structured JSON Logging**: Emissão de logs JSON padronizados (com `timestamp`, `level`, `application`, `environment`, `logger`, `correlationId`, `message`, `exception`) compatíveis com **ELK**, **OpenSearch**, **Datadog** e **Loki**, além de rastreabilidade HTTP e eventos de negócio.
* 🐳 **Conteinerização Total (Docker & Docker Compose)**: Orquestração completa de banco de dados PostgreSQL, API Backend e Frontend web com healthchecks automatizados.
* 📚 **Documentação OpenAPI 3.0 (Swagger UI)**: Interface interativa para exploração e testes de todos os endpoints REST.
* 🔐 **Segurança & Autenticação JWT**: Autenticação stateless via JSON Web Token assinado com HMAC-SHA256 e suporte a perfis de acesso (`ADMIN` e `USER`).
* 🧪 **Suíte de Testes Unitários e de Integração**: Cobertura de testes automatizados no backend cobrindo serviços, segurança, controladores e utilitários.

---

## 🛠️ Tecnologias Utilizadas

### Backend
* **Linguagem & Framework**: Java 21, Spring Boot 3.3.3
* **Observabilidade & Logging**: Logback, `logstash-logback-encoder`, Spring Boot Actuator, MDC Correlation ID
* **Segurança**: Spring Security 6, JWT (jjwt 0.12.6), BCrypt
* **Persistência & Migrações**: Spring Data JPA, Hibernate, PostgreSQL 16, Flyway Migrations
* **Ferramentas**: Maven, Lombok, MapStruct, OpenAPI/Swagger UI

### Frontend
* **Core**: React 18, TypeScript, Vite
* **Roteamento & Estado**: React Router DOM, TanStack Query (React Query)
* **Formulários & Validação**: React Hook Form, Zod
* **Estilização**: Tailwind CSS, Lucide React

---

## 📁 Estrutura do Projeto

```text
vehicle-dealer-system/
├── backend/                  # API RESTful Spring Boot
│   ├── src/main/java/        # Código-fonte Java (Controllers, Services, Repositories)
│   ├── src/main/resources/   # Configurações (application.yml) e migrações Flyway
│   └── src/test/java/        # Testes unitários e de integração
├── frontend/                 # Aplicação React SPA
│   ├── src/modules/          # Módulos (dealers, vehicles, auth, dashboard)
│   └── src/shared/           # Componentes UI, hooks, cliente HTTP e utilitários
├── docs/                     # Documentação do projeto
│   └── architecture/         # Documentos de Arquitetura e Modelo de Dados
│       ├── architecture.md   # Visão Geral da Arquitetura, Componentes e Fluxos
│       └── data-model.md     # Modelo ERD, Tabelas, Índices e Migrações Flyway
├── docker-compose.yml        # Orquestração de contêineres (PostgreSQL, Backend, Frontend)
└── README.md                 # Documento principal do repositório
```

---

## 🌐 Documentação de Arquitetura

A documentação detalhada da solução está disponível em:
* 📐 [**Arquitetura da Solução**](docs/architecture/architecture.md): Visão de componentes, arquitetura frontend/backend, fluxo de autenticação JWT, integração ViaCEP e decisões de design.
* 🛢️ [**Modelo de Dados & ERD**](docs/architecture/data-model.md): Diagrama Entidade-Relacionamento, restrições relacionais, índices de alta performance e migrações Flyway.

---

## 🔗 Documentações Específicas

Para obter detalhes aprofundados sobre a implementação técnica de cada camada da aplicação, consulte:

- 📘 [**Backend README**](backend/README.md) – Arquitetura Java 21, Spring Boot, Spring Security, Flyway, DTOs, Mappers, auditoria, integração ViaCEP e suíte de testes.

- 📙 [**Frontend README**](frontend/README.md) – React 18, TypeScript, TanStack Query, React Hook Form, Zod, arquitetura modular, gerenciamento de estado e componentes reutilizáveis.

---

## ⚡ Como Executar

### Pré-requisitos
* **Docker Engine** (v20.10+) e **Docker Compose** (v2.0+)
* *(Opcional para execução nativa)*: **Java 21 JDK** e **Node.js 18+**

---

### 1. Execução via Docker Compose (Recomendado)

1. **Configurar as Variáveis de Ambiente**:
   Na raiz do projeto, crie o arquivo `.env` a partir do modelo `.env.example`:
   ```bash
   cp .env.example .env
   ```

2. **Iniciar os Contêineres**:
   ```bash
   docker compose up -d --build
   ```

3. **Verificar os Logs**:
   ```bash
   docker compose logs -f backend
   ```

---

### 2. Execução Manual para Desenvolvimento

1. **Subir o banco PostgreSQL**:
   ```bash
   docker compose up -d postgres
   ```

2. **Iniciar o Backend (Spring Boot)**:
   ```bash
   cd backend
   cp ../.env.example .env  # ou defina JWT_SECRET no ambiente
   mvn spring-boot:run
   ```

3. **Iniciar o Frontend (React)**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🔗 URLs de Acesso & Swagger

Após iniciar a aplicação, utilize as URLs abaixo:

| Serviço | URL | Descrição |
|----------|-----|------------|
| **Frontend Web** | http://localhost:3000 | Interface gráfica principal da aplicação |
| **Backend REST API** | http://localhost:8080/api | Base URL da API RESTful |
| **Swagger UI** | http://localhost:8080/api/swagger-ui.html | Documentação interativa dos endpoints |
| **Health Check** | http://localhost:8080/api/actuator/health | Endpoint de observabilidade do Spring Actuator |

---

## 🔑 Credenciais de Desenvolvimento

A aplicação inicializa o banco com a migração Flyway inserindo um usuário administrador padrão:

* **Usuário**: `admin`
* **Senha**: `admin123`
* **Perfil**: `ADMIN`

> ⚠️ **Aviso de Segurança (Produção):** A senha padrão do usuário `admin` (`admin123`) é estática e destinada **exclusivamente para ambientes locais de desenvolvimento e testes**. Em implantações de produção, altere a senha do usuário `admin` imediatamente.

---

## ✨ Funcionalidades Implementadas

- [x] **CRUD de Concessionárias**: Cadastro com auto-preenchimento via CEP, edição, listagem paginada e exclusão.
- [x] **CRUD de Veículos**: Cadastro completo com associação de concessionária, tipo de combustível, cor e validação de placa única.
- [x] **Paginação de Dados**: Suporte a parâmetros `page`, `size` e `sort` no servidor.
- [x] **Autenticação & Autorização JWT**: Login com geração de JWT (HMAC-SHA256) e controle de acesso baseado em roles (`ADMIN` / `USER`).
- [x] **Autenticação Híbrida Google OAuth2**: Login social via Google Authorization Code Flow com emissão de JWT próprio, proteção contra account-hijacking (vinculação explícita), e troca de token por One-Time Code temporário (TTL 30s).
- [x] **Integração ViaCEP**: Consumo de serviço externo com fallback manual.
- [x] **Auditoria & Rastreabilidade**: Auditoria baseada em eventos via ApplicationEventPublisher e AuditEventListener, persistida na tabela audit_log, com rastreabilidade por X-Correlation-Id.

---

## 🔐 Configuração do Google OAuth2

Para habilitar a autenticação com Google na aplicação:

### 1. Criar Credenciais no Google Cloud Console
1. Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2. Crie ou selecione um projeto existente.
3. Vá em **APIs & Services > Credentials** (APIs e Serviços > Credenciais).
4. Clique em **Create Credentials > OAuth client ID**.
5. Selecione **Web Application** (Aplicação Web).
6. Configure as URIs:
   * **Authorized JavaScript Origins**: `http://localhost:5173` (ou porta do frontend)
   * **Authorized Redirect URIs**: `http://localhost:8080/api/login/oauth2/code/google`
7. Obtenha o **Client ID** e o **Client Secret**.

### 2. Configurar Variáveis de Ambiente
Adicione ao seu `.env` ou exporte no ambiente:

```env
GOOGLE_CLIENT_ID=seu_client_id_do_google.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu_client_secret
OAUTH2_REDIRECT_URI=http://localhost:5173/oauth2/redirect
```

### 3. Arquitetura do Fluxo de Autenticação OAuth2
1. O usuário clica em **"Entrar com Google"** no frontend e é redirecionado para `http://localhost:8080/oauth2/authorization/google`.
2. O Spring Security processa a autorização com a API do Google e carrega o perfil verificado do usuário (`CustomOAuth2UserService`).
3. O `OAuth2AuthenticationSuccessHandler` gera um **One-Time Exchange Code** temporário (salvo em memória ou Redis com TTL de 30s) e redireciona para o frontend: `/oauth2/redirect?code=XYZ`.
4. O frontend consome o endpoint `/auth/oauth2/exchange` via POST enviando `{ "code": "XYZ" }` e recebe o JWT assinado final da aplicação.
5. **Política de Segurança de Vinculação (Zero Auto-Linking Cego)**: Se uma conta local (usuário/senha) já existir com o mesmo e-mail, a vinculação automática é bloqueada para evitar *Account Hijacking*. O usuário deve realizar a vinculação autenticada via endpoint `/auth/oauth2/link`.
