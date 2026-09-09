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
* 📊 **Observabilidade Corporativa, Prometheus & Grafana**: Coleta de métricas Micrometer Prometheus (`/actuator/prometheus`) e dashboards Grafana pré-provisionados para JVM, HTTP, HikariCP e Cache. Structured JSON Logging padronizado com MDC Correlation ID (`X-Correlation-Id`).
* ☁️ **Integração Cloud AWS (DynamoDB & S3)**: Audit Logs assíncronos gravados no AWS DynamoDB (`VehicleDealerAuditLogs`) com TTL de 90 dias e suporte a fallback gracioso. Upload e remoção de imagens de veículos no AWS S3 (`POST/DELETE /vehicles/{id}/image`).
* 🐳 **Conteinerização Total (Docker & Docker Compose)**: Orquestração completa de banco de dados PostgreSQL, API Backend, Frontend Web, Prometheus e Grafana com healthchecks automatizados e Liveness/Readiness probes.
* 📚 **Documentação OpenAPI 3.0 (Swagger UI)**: Interface interativa para exploração e testes de todos os endpoints REST.
* 🔐 **Segurança & Autenticação JWT & OAuth2**: Autenticação stateless via JWT HMAC-SHA256, RBAC (`ADMIN` / `USER`) e login social via Google OAuth2 com fluxo seguro por One-Time Code temporário (TTL 30s).
* 🧪 **Suíte de Testes 100% Passando**: 188 testes backend (Spring Boot / JUnit / Mockito) e 215 testes frontend (React / Vitest / React Testing Library) passando com sucesso.

---

## 🛠️ Tecnologias Utilizadas

### Backend
* **Linguagem & Framework**: Java 21, Spring Boot 3.3.3
* **AWS SDK v2**: `software.amazon.awssdk` (`dynamodb`, `dynamodb-enhanced`, `s3`)
* **Observabilidade & Logging**: Micrometer Prometheus, Logback, `logstash-logback-encoder`, Spring Boot Actuator Probes (Liveness/Readiness), MDC Correlation ID
* **Segurança**: Spring Security 6, JWT (jjwt 0.12.6), BCrypt, OAuth2 Client
* **Persistência & Migrações**: Spring Data JPA, Hibernate, PostgreSQL 16, Flyway Migrations (V1 a V6)
* **Ferramentas**: Maven, Lombok, MapStruct, OpenAPI/Swagger UI

### Frontend
* **Core**: React 18, TypeScript, Vite
* **Roteamento & Estado**: React Router DOM, TanStack Query (React Query)
* **Formulários & Validação**: React Hook Form, Zod (incluindo validação de Chassi e Valor BRL)
* **Estilização**: Tailwind CSS, Lucide React

---

## 📁 Estrutura do Projeto

```text
vehicle-dealer-system/
├── backend/                  # API RESTful Spring Boot (Java 21)
│   ├── src/main/java/        # Controllers, Services, AWS (S3, DynamoDB), Repositories
│   ├── src/main/resources/   # Configurações (application.yml) e migrações Flyway (V1..V6)
│   └── src/test/java/        # Suíte de testes unitários e de integração
├── frontend/                 # Aplicação React SPA (TypeScript)
│   ├── src/modules/          # Módulos (dealers, vehicles, auth, dashboard)
│   └── src/shared/           # Componentes UI, hooks, cliente HTTP e utilitários
├── docker/                   # Provisionamento Grafana (datasources e dashboards)
├── docker-compose.yml        # Orquestração de contêineres (PostgreSQL, Backend, Frontend, Prometheus, Grafana)
├── prometheus.yml            # Configuração do Scraper Prometheus
└── README.md                 # Documento principal do repositório
```

---

## 🌐 Documentação de Arquitetura

A documentação detalhada da solução está disponível em:
* 📐 [**Arquitetura da Solução**](docs/architecture/architecture.md): Visão de componentes, arquitetura frontend/backend, fluxo de autenticação JWT, integração ViaCEP, AWS DynamoDB/S3 e decisões de design.
* 🛢️ [**Modelo de Dados & ERD**](docs/architecture/data-model.md): Diagrama Entidade-Relacionamento, restrições relacionais, novos campos de Chassi e Valor, índices de alta performance e migrações Flyway.

---

## 🔗 Documentações Específicas

Para obter detalhes aprofundados sobre a implementação técnica de cada camada da aplicação, consulte:

- 📘 [**Backend README**](backend/README.md) – Arquitetura Java 21, Spring Boot, Spring Security, Flyway, DTOs, Mappers, auditoria DynamoDB, integração S3, ViaCEP e suíte de testes.

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

1. **Subir os serviços de apoio (PostgreSQL, Redis, Prometheus, Grafana)**:
   ```bash
   docker compose up -d postgres redis prometheus grafana
   ```

2. **Iniciar o Backend (Spring Boot)**:
   ```bash
   cd backend
   mvn spring-boot:run
   ```

3. **Iniciar o Frontend (React)**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🔗 URLs de Acesso & Observabilidade

Após iniciar a aplicação, utilize as URLs abaixo:

| Serviço | URL | Descrição |
|----------|-----|------------|
| **Frontend Web** | http://localhost:3000 | Interface gráfica principal da aplicação |
| **Backend REST API** | http://localhost:8080/api | Base URL da API RESTful |
| **Swagger UI** | http://localhost:8080/api/swagger-ui.html | Documentação interativa dos endpoints |
| **Actuator Health Probes** | http://localhost:8080/api/actuator/health | Endpoints de liveness/readiness probes |
| **Prometheus Metrics** | http://localhost:8080/api/actuator/prometheus | Exportador de métricas para o Prometheus |
| **Prometheus Web Server** | http://localhost:9090 | Painel de monitoramento do Prometheus |
| **Grafana Dashboard** | http://localhost:3001 (admin/admin) | Dashboard visual pré-configurado de métricas JVM e HTTP |

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
- [x] **CRUD de Veículos**: Cadastro completo com associação de concessionária, combustível, cor, **Chassi**, **Valor (R$)**, foto no S3 e validação de placa única.
- [x] **Busca Textual Completa**: Suporte a filtro textual por Marca, Modelo, Placa e **Chassi**.
- [x] **Paginação de Dados**: Suporte a parâmetros `page`, `size` e `sort` no servidor.
- [x] **Autenticação & Autorização JWT**: Login com geração de JWT (HMAC-SHA256) e controle de acesso baseado em roles (`ADMIN` / `USER`).
- [x] **Autenticação Híbrida Google OAuth2**: Login social via Google Authorization Code Flow com emissão de JWT próprio, proteção contra account-hijacking e troca de token por One-Time Code temporário (TTL 30s).
- [x] **Integração ViaCEP**: Consumo de serviço externo com fallback manual.
- [x] **Auditoria DynamoDB & Rastreabilidade**: Audit log assíncrono gravado no AWS DynamoDB (`VehicleDealerAuditLogs`) com TTL de 90 dias e correlação via `X-Correlation-Id`.
- [x] **Gestão de Mídia AWS S3**: Upload e deleção de fotos de veículos no S3.
- [x] **Observabilidade Enterprise**: Exportador Prometheus e Dashboard Grafana provisionado.

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

