# Vehicle Dealer System

![Java 21](https://img.shields.io/badge/Java-21-007396?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring_Security-JWT-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

Sistema corporativo para gestão de concessionárias e catálogo de veículos, desenvolvido como solução para Desafio Técnico Full Stack.

---

## 📌 Visão Geral do Projeto

O **Vehicle Dealer System** é uma aplicação Full Stack projetada para centralizar o gerenciamento de concessionárias e o catálogo de veículos associados. O sistema oferece uma interface web intuitiva desenvolvida em **React 18** e **TypeScript**, suportada por uma API RESTful robusta desenvolvida em **Java 21** e **Spring Boot 3**.

---

## 🚀 Diferenciais Implementados

* 🌐 **Integração Automática ViaCEP**: Busca e auto-preenchimento automatizado de logradouro, bairro, cidade e UF a partir do CEP informado, com mecanismo resiliente de fallback manual.
* 🐳 **Conteinerização Total (Docker & Docker Compose)**: Orquestração completa de banco de dados PostgreSQL, API Backend e Frontend web com healthchecks automatizados.
* 📚 **Documentação OpenAPI 3.0 (Swagger UI)**: Interface interativa para exploração e testes de todos os endpoints REST.
* 🔐 **Segurança & Autenticação JWT**: Autenticação stateless via JSON Web Token assinado com HMAC-SHA256 e suporte a perfis de acesso (`ADMIN` e `USER`).
* 🧪 **Suíte de Testes Unitários e de Integração**: Cobertura de testes automatizados no backend cobrindo serviços, segurança, controladores e utilitários.

---

## 🛠️ Tecnologias Utilizadas

### Backend
* **Linguagem & Framework**: Java 21, Spring Boot 3.3.3
* **Segurança**: Spring Security 6, JWT (jjwt 0.12.6), BCrypt
* **Persistência & Migrações**: Spring Data JPA, Hibernate, PostgreSQL 16, Flyway Migrations
* **Ferramentas**: Maven, Lombok, MapStruct, OpenAPI/Swagger UI, Actuator

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

---

## ✨ Funcionalidades Implementadas

- [x] **CRUD de Concessionárias**: Cadastro com auto-preenchimento via CEP, edição, listagem paginada e exclusão.
- [x] **CRUD de Veículos**: Cadastro completo com associação de concessionária, tipo de combustível, cor e validação de placa única.
- [x] **Paginação de Dados**: Suporte a parâmetros `page`, `size` e `sort` no servidor.
- [x] **Autenticação & Autorização JWT**: Login com geração de JWT (HMAC-SHA256) e controle de acesso baseado em roles (`ADMIN` / `USER`).
- [x] **Integração ViaCEP**: Consumo de serviço externo com fallback manual.
- [x] **Auditoria & Rastreabilidade**: Auditoria baseada em eventos via ApplicationEventPublisher e AuditEventListener, persistida na tabela audit_log, com rastreabilidade por X-Correlation-Id.
