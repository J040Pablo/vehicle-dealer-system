# Vehicle Dealer System

![Java 21](https://img.shields.io/badge/Java-21-007396?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

Sistema completo de Gestão de Veículos e Concessionárias, projetado com arquitertura moderna em camadas, conteinerização Docker, integração com serviços externos e práticas de observabilidade de nível corporativo.

---

## 📌 Visão Geral

### Objetivo do Projeto
O **Vehicle Dealer System** foi desenvolvido para centralizar a gestão operacional do catálogo de veículos e da rede de concessionárias parceiras de uma montadora automotiva. O sistema permite cadastrar, atualizar, listar, filtrar e auditar as operações comerciais de forma eficiente e segura.

### Problema que Resolve
* **Descentralização e Inconsistência de Dados**: Evita cadastros duplicados de concessionárias (validação única de CNPJ) e placas veiculares.
* **Agilidade no Cadastro de Endereços**: Elimina a digitação manual de logradouros via integração automatizada com a API **ViaCEP**.
* **Falta de Rastreabilidade Operacional**: Registra auditoria completa de criações, alterações e exclusões na tabela `audit_log`, aliada ao rastreio de requisições por `Correlation ID`.
* **Escalabilidade em Grandes Catalogos**: Implementa paginação e ordenação no servidor (Spring Data `Pageable`), garantindo alta performance no consumo de dados.

### Principais Funcionalidades
- **Gestão de Concessionárias (Dealers)**: CRUD completo com busca automática de endereço por CEP e validação estrita de CNPJ.
- **Gestão de Veículos (Vehicles)**: CRUD de veículos com especificação de combustível (`FLEX`, `GASOLINA`, `ETANOL`, `DIESEL`, `ELETRICO`, `HIBRIDO`) e vínculo relacional 1:N com concessionárias.
- **Paginação e Ordenação Servidor-Side**: Suporte completo a paginação customizável no backend e frontend.
- **Auditoria de Eventos**: Sistema orientado a eventos (`AuditEvent`) armazenando histórico em banco de dados.
- **Rastreabilidade Distribuída**: Header HTTP `X-Correlation-Id` propagado pelo Axios Interceptor ao Slf4j/MDC do backend.
- **Health Check & Observabilidade**: Endpoints do Spring Boot Actuator para verificação de disponibilidade da aplicação.

---

## 🏗️ Arquitetura Geral

### Diagrama da Solução

```text
+-----------------------------------------------------------------------+
|                            NAVEGADOR WEB                              |
|                   [ React 18 + TypeScript + Vite ]                    |
+-----------------------------------+-----------------------------------+
                                    |
                           HTTP / REST + JSON
                      Header: X-Correlation-Id
                                    |
                                    v
+-----------------------------------+-----------------------------------+
|                        BACKEND SPRING BOOT 3                          |
|                                                                       |
|  [ CorrelationIdFilter ] -> [ Controller ] -> [ Service ]             |
|                                                     |                 |
|                                   [ ViaCEP REST Client ] ------------> API ViaCEP
|                                                     |                 |
|                                           [ Spring Data JPA ]         |
+-----------------------------------+-----------------------------------+
                                    |
                               SQL Queries
                                    |
                                    v
+-----------------------------------+-----------------------------------+
|                       BANCO DE DADOS POSTGRESQL                       |
|                    [ Schemas & Flyway Migrations ]                    |
+-----------------------------------------------------------------------+
```

### Integrações Principais

1. **ViaCEP API**: Serviço externo HTTP consumido pelo backend para preenchimento automático de endereço (`rua`, `bairro`, `cidade`, `estado`) a partir do CEP.
2. **Spring Boot Actuator**: Monitoramento de saúde da aplicação via endpoint `/api/actuator/health`.
3. **OpenAPI / Swagger UI**: Documentação interativa e testador de endpoints REST disponível em `/api/swagger-ui.html`.

---

## 📂 Estrutura do Projeto

```text
vehicle-dealer-system/
├── backend/            # Aplicação Spring Boot 3 (Java 21, JPA, Flyway, Actuator)
├── frontend/           # Aplicação Web React (TypeScript, Vite, TanStack Query, Tailwind)
├── docker-compose.yml  # Orquestração dos containers (PostgreSQL, Backend, Frontend)
└── docs/               # Documentações arquiteturais e manuais complementares
```

* **`/backend`**: Contém o serviço RESTful Java 21 com Spring Boot, testes unitários e de integração, mapeamento JPA e scripts de migração de banco.
* **`/frontend`**: Contém a interface do usuário construída com React 18, Vite e TypeScript, organizada modularmente com componentes Shadcn/Radix UI.
* **`docker-compose.yml`**: Configuração multi-container responsável por inicializar PostgreSQL 16, Backend Spring Boot e Frontend Nginx em ambiente isolado.
* **`/docs`**: Reservado para guias adicionais de infraestrutura, manuais de implantação em nuvem e diagramas extensos.

---

## 🔗 Documentações Específicas

Para obter detalhes profundos sobre a implementação técnica de cada módulo, consulte as documentações dedicadas:

- 📘 [**Backend README**](backend/README.md) – Detalhes de arquitetura Java 21, Spring Boot, Flyway, DTOs, Mappers e suíte de testes.
- 📙 [**Frontend README**](frontend/README.md) – Detalhes do React 18, TanStack Query, React Hook Form, gerenciamento de estado e componentes UI.

---

## 🚀 Como Executar

### 1. Execução Simplificada via Docker Compose (Recomendado)

Certifique-se de possuir o **Docker** e o **Docker Compose** instalados na máquina. Na raiz do projeto, execute:

```bash
docker compose up -d --build
```

O comando irá compilar as imagens e disponibilizar os seguintes acessos:

| Serviço | URL de Acesso | Descrição |
| :--- | :--- | :--- |
| **Frontend Web** | [http://localhost:3000](http://localhost:3000) | Interface gráfica do sistema |
| **Backend REST API** | [http://localhost:8080/api](http://localhost:8080/api) | Contexto base da API Spring Boot |
| **Swagger UI** | [http://localhost:8080/api/swagger-ui.html](http://localhost:8080/api/swagger-ui.html) | Documentação interativa OpenAPI 3.0 |
| **Health Check** | [http://localhost:8080/api/actuator/health](http://localhost:8080/api/actuator/health) | Endpoint de verificação de status |

Para encerrar os containers:
```bash
docker compose down
```

---

### 2. Execução Manual para Desenvolvimento

#### Passo A: Banco de Dados PostgreSQL
Suba a instância do banco via Docker:
```bash
docker compose up -d postgres
```

#### Passo B: Backend Spring Boot
```bash
cd backend
./mvnw spring-boot:run
```
*A API iniciará na porta `8080`.*

#### Passo C: Frontend React
```bash
cd frontend
npm install
npm run dev
```
*A aplicação web estará disponível em `http://localhost:5173`.*

---

## 🛠️ Resumo de Funcionalidades

- [x] **CRUD de Concessionárias**: Cadastro com auto-preenchimento via CEP, edição, listagem paginada e exclusão.
- [x] **CRUD de Veículos**: Cadastro completo com associação de concessionária, tipo de combustível e placa única.
- [x] **Paginação de Dados**: Suporte a parâmetros `page`, `size` e `sort` em todas as consultas de listagem.
- [x] **Ordenação Dinâmica**: Suporte a ordenação alfabética, por data de criação ou por atributos específicos.
- [x] **Auditoria Automatizada**: Publicação de eventos de auditoria para persistência de histórico de operações.
- [x] **Rastreabilidade (Correlation ID)**: Injeção de UUID no header `X-Correlation-Id` vinculado ao MDC de logs.
- [x] **Integração ViaCEP**: Consumo de API externa com tratamento de timeouts e fallback de exceção.
- [x] **Observabilidade (Health Check)**: Endpoint Actuator exposto para monitoramento de disponibilidade.

---
*Desenvolvido seguindo os mais rigorosos padrões de arquitetura corporativa Full Stack.*
