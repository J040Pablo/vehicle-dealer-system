# Backend - Vehicle Dealer API

[![Backend CI](https://github.com/J040Pablo/vehicle-dealer-system/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/J040Pablo/vehicle-dealer-system/actions/workflows/backend-ci.yml)

API RESTful corporativa para gestão de concessionárias e catálogo de veículos, desenvolvida em Java 21 com Spring Boot 3, arquitetura em camadas, persistência relacional e suporte a serviços de nuvem da AWS.

---

## Tecnologias Utilizadas

- **Java 21**: Linguagem de programação base.
- **Spring Boot 3.3.3**: Framework para injeção de dependências, controle web, segurança e gerenciamento da aplicação.
- **Spring Security 6 & JWT**: Autenticação stateless baseada em tokens JSON Web Token (HMAC-SHA256), controle de acesso (RBAC) e suporte a OAuth2 Social Login.
- **Spring Data JPA & Hibernate**: Camada de persistência relacional com abstração de consultas e paginação (`Pageable`).
- **PostgreSQL 16**: Banco de dados relacional para persistência de dados do domínio.
- **Flyway**: Gerenciamento e versionamento de migrações de banco de dados (V1 a V8).
- **AWS SDK v2**: Integração com AWS S3 (`s3`) para armazenamento de mídia e AWS DynamoDB (`dynamodb`, `dynamodb-enhanced`) para auditoria operacional.
- **MapStruct 1.5.5**: Mapeamento em tempo de compilação entre Entidades JPA e DTOs imutáveis.
- **Springdoc OpenAPI 3.0**: Geração dinâmica de documentação Swagger UI.
- **Micrometer & Spring Boot Actuator**: Exportação de métricas operacionais para Prometheus.
- **JUnit 5 & Mockito**: Suíte de testes unitários e de integração.

---

## Arquitetura e Camadas

A API adota a Arquitetura em Camadas (Layered Architecture), garantindo desacoplamento e testabilidade:

```text
       [ Cliente HTTP / Frontend ]
                    │
                    ▼
           ┌───────────────────┐
           │ CorrelationFilter │  <-- Injeta X-Correlation-Id no MDC
           └─────────┬─────────┘
                    │
                    ▼
           ┌───────────────────┐
           │     JwtFilter     │  <-- Autenticação Stateless (Validação JWT)
           └─────────┬─────────┘
                    │
                    ▼
           ┌───────────────────┐
           │    Controller     │  <-- Validação DTO (@Valid), Endpoints REST, HTTP Status
           └─────────┬─────────┘
                    │
                    ▼
           ┌───────────────────┐
           │      Service      │  <-- Regras de Negócio, Transações (@Transactional), Eventos
           └─────────┬─────────┘
                    │
      ┌─────────────┼─────────────┐
      │             │             │
      ▼             ▼             ▼
┌───────────┐ ┌───────────┐ ┌───────────┐
│  Mapper   │ │Repository │ │  AWS S3 / │
└───────────┘ └─────┬─────┘ │ DynamoDB  │
                    │       └───────────┘
                    ▼
           ┌────────────────┐
           │ PostgreSQL DB  │
           └────────────────┘
```

### Explicação das Camadas

1. **Security & Filters (`com.dealership.api.security`, `com.dealership.api.config`)**:
   - `CorrelationIdFilter`: Propaga identificador único de requisição no MDC do SLF4J.
   - `JwtAuthenticationFilter`: Extrai o Bearer Token do cabeçalho `Authorization`, valida a assinatura HMAC-SHA256 e popula o contexto de segurança.
   - `SecurityConfig`: Configura a cadeia de filtros (`SecurityFilterChain`), autorizações de rotas, política stateless e suporte a OAuth2.
2. **Controller (`com.dealership.api.dealer`, `com.dealership.api.vehicle`, `com.dealership.api.security`)**:
   - Expõe endpoints RESTful consumindo e retornando DTOs.
   - Valida payloads de entrada com `Jakarta Validation` (`@Valid`, `@NotNull`, `@NotBlank`, `@CPF/@CNPJ`).
   - Gerencia parâmetros de consulta paginada (`Pageable`).
3. **Service (`com.dealership.api.dealer`, `com.dealership.api.vehicle`, `com.dealership.api.aws`)**:
   - Centraliza as regras de negócio, ordenação, regras de unicidade de placa e chassi.
   - Gerencia transações relacionais (`@Transactional`).
   - Dispara eventos de auditoria capturados de forma assíncrona pelo listener do DynamoDB.
   - `S3StorageService`: Gerencia upload e exclusão de arquivos de imagem no Amazon S3.
4. **Repository (`com.dealership.api.dealer`, `com.dealership.api.vehicle`, `com.dealership.api.user`)**:
   - Interfaces JPA estendendo `JpaRepository<T, ID>`.
5. **Mapper (MapStruct)**:
   - Converte tipos entre Entidades JPA e DTOs em tempo de compilação.
6. **Exception Handling (`GlobalExceptionHandler`)**:
   - Captura exceções e retorna respostas estruturadas de erro padronizadas.

---

## Estrutura de Pastas

```text
backend/
├── src/
│   ├── main/
│   │   ├── java/com/dealership/api/
│   │   │   ├── aws/                 # Serviços e clientes AWS S3 e DynamoDB
│   │   │   ├── config/              # CorrelationIdFilter, CORS, OpenAPI, RestClient
│   │   │   ├── dealer/              # Entidade Dealer, Controller, Service, Repository, DTOs, Mapper
│   │   │   ├── security/            # JwtService, JwtFilter, SecurityConfig, AdminBootstrapService, AuthController
│   │   │   ├── user/                # Entidade User, Role, AuthProvider, UserRepository, DTOs
│   │   │   ├── vehicle/             # Entidade Vehicle, Controller, Service, Repository, DTOs, Mapper
│   │   │   ├── viacep/              # Cliente REST para consulta à API ViaCEP
│   │   │   └── shared/              # AuditLog, GlobalExceptionHandler, Utilitários
│   │   └── resources/
│   │       ├── application.yml      # Configurações centralizadas da aplicação
│   │       └── db/migration/        # Scripts de migração Flyway (V1 a V8)
│   └── test/                        # Suíte de testes unitários e de integração
├── Dockerfile                       # Multi-stage build para aplicação Spring Boot
└── pom.xml                          # Dependências Maven e plugins
```

---

## Configuração e Variáveis de Ambiente

Propriedades configuráveis via `application.yml` ou variáveis de ambiente:

| Propriedade (`application.yml`) | Variável de Ambiente | Valor Padrão | Descrição |
|---|---|---|---|
| `jwt.secret` | `JWT_SECRET` | *(Vazio)* | **Obrigatório**. Chave secreta de no mínimo 32 bytes para assinatura HMAC-SHA256. |
| `jwt.expiration` | `JWT_EXPIRATION` | `86400000` | Validade do token JWT em milissegundos (24h). |
| `app.security.admin.username` | `ADMIN_USERNAME` | *(Vazio)* | Nome do usuário administrador a ser criado no bootstrap. |
| `app.security.admin.password` | `ADMIN_PASSWORD` | *(Vazio)* | Senha do usuário administrador a ser criado no bootstrap. |
| `app.security.admin.email` | `ADMIN_EMAIL` | *(Vazio)* | E-mail do usuário administrador a ser criado no bootstrap. |
| `spring.datasource.url` | `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/dealership_db` | URL de conexão JDBC PostgreSQL. |
| `spring.datasource.username` | `SPRING_DATASOURCE_USERNAME` | `postgres` | Usuário do PostgreSQL. |
| `spring.datasource.password` | `SPRING_DATASOURCE_PASSWORD` | `postgrespassword` | Senha do PostgreSQL. |
| `aws.region` | `AWS_REGION` | `us-east-1` | Região da infraestrutura AWS. |
| `aws.s3.bucket-name` | `AWS_S3_BUCKET` | `vehicle-dealer-images` | Nome do Bucket AWS S3 para armazenamento de mídia. |
| `aws.dynamodb.table-name` | `AWS_DYNAMODB_TABLE` | `VehicleDealerAuditLogs` | Nome da tabela AWS DynamoDB para auditoria. |
| `cors.allowed-origins` | `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Origens permitidas no compartilhamento CORS. |

---

## Inicialização Dinâmica de Administrador (AdminBootstrapService)

A aplicação utiliza o componente `AdminBootstrapService`, que implementa a interface `CommandLineRunner` do Spring Boot.

- Durante a inicialização da API, o componente verifica a presença das variáveis de ambiente `ADMIN_USERNAME` e `ADMIN_PASSWORD`.
- Se as variáveis forem fornecidas e o usuário informado não existir no banco de dados, o `AdminBootstrapService` cria automaticamente a conta com perfil `ADMIN`, e-mail associado e senha criptografada via BCrypt.
- Se o usuário já existir ou as variáveis não forem informadas, a criação é ignorada de forma segura.
- **O projeto não utiliza scripts SQL de seed com senhas estáticas no banco de dados.**

---

## Integracões AWS (S3 & DynamoDB)

### Armazenamento de Imagens (AWS S3)
- `S3StorageService`: Serviço responsável por realizar upload, substituição e deleção de imagens associadas a veículos e concessionárias.
- O endpoint `POST /api/vehicles/{id}/image` recebe o arquivo multipart, armazena no bucket configurado e salva a URL resultante na coluna `image_url` da entidade `Vehicle`.

### Auditoria Operacional (AWS DynamoDB)
- `DynamoDbAuditService`: Serviço responsável pela escrita de registros de auditoria na tabela NoSQL `VehicleDealerAuditLogs`.
- `DynamoDbAuditEventListener`: Ouve eventos de negócio (`AuditEvent`) publicados via `ApplicationEventPublisher` e persiste de forma assíncrona os dados (tipo da entidade, ID da entidade, ação realizada, `correlationId`, timestamp e detalhes).
- A tabela possui Time-To-Live (TTL) de 90 dias configurado para retenção e descarte automático de registros antigos.

---

## Banco de Dados e Migrações Flyway

O histórico e a estrutura do PostgreSQL são gerenciados pelo Flyway através dos scripts localizados em `src/main/resources/db/migration/`:

- **V1__initial_schema.sql**: Criação das tabelas `dealers`, `vehicles`, `audit_log` e chaves estrangeiras.
- **V2__security_schema.sql**: Criação da tabela `users` para autenticação.
- **V3__remove_default_admin_seed.sql**: Remoção do registro estático de usuário admin herdado de versões anteriores.
- **V4__vehicle_search_indexes.sql**: Adição do índice composto `idx_vehicles_brand_model_year` em `vehicles`.
- **V5__add_vehicle_and_dealer_image_url.sql**: Adição da coluna `image_url` (VARCHAR 500) nas tabelas `vehicles` e `dealers`.
- **V6__add_vehicle_chassis_and_value.sql**: Adição das colunas `chassis` (VARCHAR 100) e `value` (NUMERIC 15,2) na tabela `vehicles`.
- **V7__clean_blank_image_urls.sql**: Sanitização de registros convertendo strings vazias de `image_url` para `NULL`.
- **V8__add_unique_constraint_to_vehicle_chassis.sql**: Limpeza de chassi duplicado e inclusão da restrição de unicidade `uk_vehicle_chassis` na coluna `chassis`.

---

## Documentação da API (OpenAPI / Swagger)

A especificação OpenAPI 3.0 é exposta dinamicamente:

- **Swagger UI**: http://localhost:8080/api/swagger-ui.html
- **OpenAPI JSON Spec**: http://localhost:8080/api/v3/api-docs

---

## Actuator e Health Checks

- **Health Check**: http://localhost:8080/api/actuator/health
- **Prometheus Metrics**: http://localhost:8080/api/actuator/prometheus

---

## Testes de Software

Execução da suíte de testes unitários e de integração:

```bash
mvn test
```

Os relatórios de cobertura do JaCoCo são gerados em `target/site/jacoco/index.html`.
