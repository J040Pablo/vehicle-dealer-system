# Vehicle Dealer System

[![Backend CI](https://github.com/J040Pablo/vehicle-dealer-system/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/J040Pablo/vehicle-dealer-system/actions/workflows/backend-ci.yml)
[![Frontend CI](https://github.com/J040Pablo/vehicle-dealer-system/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/J040Pablo/vehicle-dealer-system/actions/workflows/frontend-ci.yml)

Sistema corporativo para gestão de concessionárias e catálogo de veículos, desenvolvido com arquitetura descentralizada Full Stack.

---

## Visão Geral

O Vehicle Dealer System é uma aplicação corporativa projetada para o gerenciamento centralizado de concessionárias e veículos. A solução utiliza uma interface SPA desenvolvida em React 18 e TypeScript, conectada a uma API RESTful em Java 21 com Spring Boot 3, com suporte a persistência relacional no PostgreSQL e serviços AWS nativos (S3 e DynamoDB).

---

## Funcionalidades

- **Gestão de Concessionárias**: Cadastro, edição, listagem paginada e exclusão. Integração com a API ViaCEP para preenchimento automático de endereço com suporte a fallback manual.
- **Gestão de Veículos**: Cadastro e edição de veículos com associação a concessionárias, tipos de combustível, cor, **Chassi (VIN)** com restrição de unicidade, **Valor (R$)** e modal interativo de detalhes.
- **Armazenamento de Imagens**: Upload e gerenciamento de imagens de veículos e concessionárias integrados ao AWS S3.
- **Busca e Filtros**: Busca textual parametrizada por Marca, Modelo, Placa e Chassi com paginação server-side (`page`, `size`, `sort`).
- **Autenticação e Autorização**: Autenticação stateless via JWT (HMAC-SHA256), controle de acesso por perfis (`ADMIN` / `USER`) e login social via Google OAuth2 com fluxo de One-Time Code temporário (TTL 30s) e prevenção contra account hijacking.
- **Auditoria de Operações**: Registro assíncrono de eventos de auditoria gravados no AWS DynamoDB (`VehicleDealerAuditLogs`) com retenção automatizada via TTL de 90 dias.
- **Observabilidade**: Coleta de métricas operacionais via Micrometer e Spring Boot Actuator (`/actuator/prometheus`), com dashboards provisionados no Grafana e suporte a Correlation ID (`X-Correlation-Id`) no SLF4J MDC.

---

## Arquitetura

A aplicação adota uma arquitetura em camadas no backend e orientada a módulos no frontend.

- **Frontend**: Single Page Application (SPA) em React 18, TypeScript, Vite, TanStack Query v5, React Hook Form, Zod e Tailwind CSS.
- **Backend**: API RESTful em Java 21 e Spring Boot 3.3, organizada em camadas (Controllers, Services, Repositories, DTOs imutáveis e Mappers via MapStruct).
- **Banco de Dados Relacional**: PostgreSQL 16 gerenciado por migrações automatizadas do Flyway (V1 a V8).
- **Serviços em Nuvem**: AWS S3 para armazenamento de objetos e AWS DynamoDB para persistência de logs de auditoria.

Documentação técnica detalhada:
- [Arquitetura da Solução](docs/architecture/architecture.md)
- [Modelo de Dados & ERD](docs/architecture/data-model.md)
- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)

---

## Tecnologias

### Backend
- Java 21
- Spring Boot 3.3.3 (Spring Security 6, Spring Data JPA, Spring Actuator)
- PostgreSQL 16 & Flyway Migrations (V1 a V8)
- AWS SDK v2 (S3 e DynamoDB)
- MapStruct 1.5 & Lombok
- Micrometer Prometheus & Logback (JSON Structured Logging)
- JUnit 5 & Mockito

### Frontend
- React 18 & TypeScript 5
- Vite 5
- TanStack Query v5
- React Hook Form & Zod
- Tailwind CSS & Radix UI
- Axios (com Request Interceptors para JWT e Correlation ID)
- Vitest & React Testing Library

---

## Estrutura do Projeto

```text
vehicle-dealer-system/
├── backend/                  # API RESTful Spring Boot (Java 21)
│   ├── src/main/java/        # Controllers, Services, AWS (S3, DynamoDB), Repositories, Security
│   ├── src/main/resources/   # Configurações (application.yml) e migrações Flyway (V1..V8)
│   └── src/test/java/        # Suíte de testes unitários e de integração
├── frontend/                 # Aplicação React SPA (TypeScript)
│   ├── src/modules/          # Módulos por domínio (dealers, vehicles, auth, dashboard)
│   └── src/shared/           # Componentes UI, hooks, cliente HTTP e utilitários
├── docs/                     # Documentação de Arquitetura e Modelo de Dados
│   └── architecture/         # architecture.md e data-model.md
├── docker/                   # Provisionamento Grafana e Prometheus
├── docker-compose.yml        # Orquestração local de contêineres
└── prometheus.yml            # Configuração do Scraper Prometheus
```

---

## Modelo de Dados

O banco relacional PostgreSQL é versionado via Flyway através dos scripts em `backend/src/main/resources/db/migration/`:

- **V1__initial_schema.sql**: Tabelas iniciais `dealers`, `vehicles`, `audit_log` e chaves estrangeiras.
- **V2__security_schema.sql**: Tabela de usuários (`users`).
- **V3__remove_default_admin_seed.sql**: Remoção do seed estático de administrador legado.
- **V4__vehicle_search_indexes.sql**: Criação de índices de busca combinada (`brand`, `model`, `year`).
- **V5__add_vehicle_and_dealer_image_url.sql**: Adição do campo `image_url` em `vehicles` e `dealers`.
- **V6__add_vehicle_chassis_and_value.sql**: Adição dos campos `chassis` e `value` em `vehicles`.
- **V7__clean_blank_image_urls.sql**: Sanitização de registros com URLs de imagens em branco.
- **V8__add_unique_constraint_to_vehicle_chassis.sql**: Limpeza de duplicados e adição de restrição `UNIQUE` na coluna `chassis`.

Para detalhes completos sobre esquemas, chaves e atributos NoSQL do DynamoDB, consulte [data-model.md](docs/architecture/data-model.md).

---

## Segurança

- **Autenticação Stateless**: Geração de tokens JWT assinados via HMAC-SHA256 com validação em cada requisição pelo `JwtAuthenticationFilter`.
- **Inicialização Dinâmica de Administrador**: O serviço `AdminBootstrapService` (`CommandLineRunner`) verifica na inicialização da aplicação a presença das variáveis de ambiente `ADMIN_USERNAME`, `ADMIN_PASSWORD` e `ADMIN_EMAIL`. Se informadas e o usuário não existir, cria a conta com perfil `ADMIN` e senha criptografada via BCrypt. Não existem credenciais estatórias hardcoded no banco.
- **Google OAuth2**: Suporte a autenticação social com emissão de token via One-Time Code temporário (TTL 30s) e bloqueio contra account-hijacking via endpoint de vinculação `/auth/oauth2/link`.

---

## Deploy AWS

A infraestrutura de produção utiliza os serviços de nuvem da AWS:

- **AWS ECR (Elastic Container Registry)**: Armazenamento da imagem Docker do backend.
- **AWS ECS Fargate**: Execução do contêiner da aplicação backend em modelo serverless de contêineres.
- **Endereçamento**: A Task do ECS Fargate opera com IP público direto atribuído à interface de rede.
- **Serviços Gerenciados AWS**: Integrado ao AWS S3 (armazenamento de mídias de veículos) e AWS DynamoDB (tabela `VehicleDealerAuditLogs` para logs de auditoria).

---

## Como Executar

### Pré-requisitos
- Docker Engine 20.10+ e Docker Compose 2.0+
- Java 21 JDK e Node.js 18+ (opcional para execução nativa fora do Docker)

### Execução via Docker Compose (Recomendado)

1. **Configurar o Arquivo de Ambiente**:
   Crie o arquivo `.env` na raiz do repositório a partir de um modelo:
   ```bash
   cp .env.example .env
   ```
   Defina as variáveis obrigatórias no `.env`:
   ```env
   JWT_SECRET=sua_chave_secreta_com_no_minimo_32_bytes_aqui
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=SenhaSegura123!
   ADMIN_EMAIL=admin@dealership.com
   ```

2. **Iniciar os Contêineres**:
   ```bash
   docker compose up -d --build
   ```

3. **Acompanhar os Logs**:
   ```bash
   docker compose logs -f backend
   ```

### URLs de Acesso

| Serviço | URL | Descrição |
|---|---|---|
| Frontend Web | http://localhost:3000 | Interface de usuário da aplicação |
| Backend REST API | http://localhost:8080/api | Endpoint base da API RESTful |
| Swagger UI | http://localhost:8080/api/swagger-ui.html | Documentação OpenAPI 3.0 |
| Actuator Health | http://localhost:8080/api/actuator/health | Status de saúde da aplicação |
| Prometheus Metrics | http://localhost:8080/api/actuator/prometheus | Métricas exportadas para o Prometheus |
| Prometheus UI | http://localhost:9090 | Painel de controle do Prometheus |
| Grafana Dashboard | http://localhost:3001 | Dashboards de métricas (admin/admin) |

---

## Testes

### Execução dos Testes Backend
```bash
cd backend
mvn test
```
A cobertura de testes inclui testes unitários de regras de negócio, repositórios, serviços e controllers de integração.

### Execução dos Testes Frontend
```bash
cd frontend
npm test
```
A suíte de testes do frontend valida renderização de componentes, formulários com Zod e chamadas de API mockadas via Vitest.

---

## Observabilidade

- **Logs Estruturados em JSON**: No perfil `prod`, os logs são formatados em JSON de linha única via Logback (`logstash-logback-encoder`), incluindo `correlationId`, `environment`, `logger` e detalhes de exceções.
- **Rastreabilidade com Correlation ID**: O filtro `CorrelationIdFilter` extrai ou gera um identificador único para o cabeçalho `X-Correlation-Id`, propagando-o no MDC do SLF4J em todas as camadas.
- **Métricas Prometheus e Grafana**: O Micrometer coleta métricas de execução da JVM, tempos de resposta HTTP, pool de conexões HikariCP e caches, expostas em `/actuator/prometheus` e visualizadas no Grafana.

---

## Roadmap

- Implementação de Application Load Balancer (ALB) na AWS para encerramento TLS/HTTPS.
- Integração de distribuição CDN via Amazon CloudFront para a aplicação frontend.
- Configuração de nome de domínio customizado via AWS Route 53.
