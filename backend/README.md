# Backend – Vehicle Dealer API

[![Backend CI](https://github.com/J040Pablo/vehicle-dealer-system/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/J040Pablo/vehicle-dealer-system/actions/workflows/backend-ci.yml)
![Java 21](https://img.shields.io/badge/Java-21-007396?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring_Security-JWT-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white)
![Spring Data JPA](https://img.shields.io/badge/Spring_Data_JPA-3.3.3-green?style=for-the-badge&logo=spring&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Flyway](https://img.shields.io/badge/Flyway-Migrations-CC0200?style=for-the-badge&logo=flyway&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Swagger](https://img.shields.io/badge/OpenAPI-3.0-85EA2D?style=for-the-badge&logo=openapi-initiative&logoColor=black)
![Actuator](https://img.shields.io/badge/Spring_Actuator-Enabled-brightgreen?style=for-the-badge)

API RESTful corporativa para gestão de concessionárias e catálogo de veículos, desenvolvida em Java 21 com Spring Boot 3, arquitetura em camadas e práticas avançadas de persistência, segurança JWT, auditoria e rastreabilidade.

---

## 🛠️ Tecnologias Utilizadas

* **Java 21**: Utilização de recursos modernos como Pattern Matching e Virtual Threads.
* **Spring Boot 3.3.3**: Framework base para injeção de dependências, controle web e gerenciamento do ciclo de vida da aplicação.
* **Spring Security 6 & JWT**: Autenticação stateless baseada em JSON Web Tokens assinados via HMAC-SHA256 e controle de acesso baseado em perfis (RBAC).
* **Spring Data JPA & Hibernate**: Abstração de persistência com suporte nativo a paginação (`Pageable`, `Page<T>`).
* **PostgreSQL 16**: Banco de dados relacional robusto para produção.
* **Flyway**: Versionamento e execução automatizada de scripts SQL de migração de banco de dados.
* **MapStruct 1.5.5**: Mapeamento compile-time de alta performance entre Entidades e DTOs (sem overhead de reflexão).
* **Lombok**: Redução de boilerplate de código (getters, setters, construtores, builders).
* **Springdoc OpenAPI 3.0 (Swagger UI)**: Geração dinâmica da documentação interativa da API.
* **Spring Boot Actuator**: Monitoramento de saúde e métricas operacionais.
* **JUnit 5 & Mockito**: Frameworks para testes unitários e de integração de alta cobertura.

---

## 🏛️ Arquitetura e Camadas

A aplicação adota o padrão de Arquitetura em Camadas (Layered Architecture), garantindo forte separação de responsabilidades e alta testabilidade:

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
          ┌─────────┴─────────┐
          │                   │
          ▼                   ▼
    ┌───────────┐       ┌───────────┐
    │  Mapper   │       │Repository │ <-- Abstração JPA, Consultas Paginadas
    └───────────┘       └─────┬─────┘
                              │
                              ▼
                     ┌────────────────┐
                     │ PostgreSQL DB  │
                     └────────────────┘
```

### Explicação das Camadas

1. **Security & Filters (`com.dealership.api.security`, `com.dealership.api.config`)**:
   - `CorrelationIdFilter`: Injeta identificador único de requisição nos logs MDC.
   - `JwtAuthenticationFilter`: Extrai o Bearer Token do cabeçalho `Authorization`, valida a assinatura HMAC-SHA256 e autentica o usuário no contexto do Spring Security.
   - `SecurityConfig`: Define a cadeia de filtros HTTP (`SecurityFilterChain`), desabilita CSRF (API stateless) e define permissões de rotas.

2. **Controller (`com.dealership.api.dealer`, `com.dealership.api.vehicle`, `com.dealership.api.security`)**:
   - Expõe endpoints RESTful consumindo e retornando DTOs.
   - Aplica validações de entrada via `Jakarta Validation` (`@Valid`, `@NotNull`, `@NotBlank`, `@CPF/@CNPJ`).
   - Mapeia parâmetros de consulta paginada (`Pageable`).

3. **Service**:
   - Concentra as regras de negócio e orquestração dos fluxos.
   - Gerencia transações com a anotação `@Transactional`.
   - Dispara eventos de auditoria (`AuditEvent`) via `ApplicationEventPublisher`.

4. **Repository**:
   - Interfaces estendendo `JpaRepository<T, ID>`.
   - Fornecem métodos de busca com paginação (`findAll(Pageable)`), busca por CNPJ e por Placa.

5. **Mapper (MapStruct)**:
   - Interfaces anotadas com `@Mapper(componentModel = "spring")` que geram o código de conversão entre DTOs e Entidades durante a compilação.

6. **Exception Handling (`GlobalExceptionHandler`)**:
   - Centralizador de exceções anotado com `@RestControllerAdvice`.
   - Converte exceções de negócio (`BusinessException`, `ResourceNotFoundException`, `DuplicateCnpjException`) em respostas HTTP estruturadas padrão RFC 7807 (`ProblemDetail`).

---

## 📂 Estrutura de Pastas

```text
backend/
├── src/
│   ├── main/
│   │   ├── java/com/dealership/api/
│   │   │   ├── config/              # Filtros (CorrelationId), CORS, OpenAPI, RestClient
│   │   │   ├── dealer/              # Entidade, Controller, Service, Repository, DTOs, Mapper
│   │   │   ├── security/            # JwtService, JwtFilter, SecurityConfig, AuthController
│   │   │   ├── user/                # Entidade User, Role, UserRepository, DTOs
│   │   │   ├── vehicle/             # Entidade, Controller, Service, Repository, DTOs, Mapper
│   │   │   ├── viacep/              # Cliente HTTP REST para consumo da API ViaCEP
│   │   │   └── shared/
│   │   │       ├── audit/           # Entidade de AuditLog, Eventos e Listeners
│   │   │       ├── exception/       # GlobalExceptionHandler e Exceções Customizadas
│   │   │       └── util/            # Utilitários (Sanitização de CEP e CNPJ)
│   │   └── resources/
│   │       ├── application.yml      # Configurações centralizadas da aplicação
│   │       └── db/migration/        # Scripts Flyway (V1, V2, V3)
│   └── test/                        # Suíte completa de testes (Unitários, Integração, Mockito)
├── Dockerfile                       # Multi-stage build para otimização de imagem Java
└── pom.xml                          # Dependências Maven e plugins (JaCoCo, MapStruct)
```

---

## ⚙️ Configuração e Variáveis de Ambiente

As configurações principais da aplicação estão mapeadas no arquivo `src/main/resources/application.yml`. Todas as propriedades expostas podem ser sobrescritas por variáveis de ambiente no ambiente de execução:

| Propriedade (`application.yml`) | Variável de Ambiente | Valor Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| `jwt.secret` | `JWT_SECRET` | *(Vazio)* | **Obrigatório**. Chave secreta de no mínimo 32 bytes para HMAC-SHA256. |
| `jwt.expiration` | `JWT_EXPIRATION` | `86400000` | Validade do token JWT em milissegundos (24h). |
| `spring.datasource.url` | `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/dealership_db` | URL JDBC do PostgreSQL. |
| `spring.datasource.username` | `SPRING_DATASOURCE_USERNAME` | `postgres` | Usuário do banco de dados. |
| `spring.datasource.password` | `SPRING_DATASOURCE_PASSWORD` | `postgrespassword` | Senha do banco de dados. |
| `cors.allowed-origins` | `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Origem permitida para requisições CORS. |
| `viacep.url` | `VIACEP_URL` | `https://viacep.com.br/ws` | URL base do serviço REST ViaCEP. |

---

## 🔐 Autenticação & Security Features

### Security Features

- **JWT Authentication**: Autenticação stateless baseada em JSON Web Tokens (HMAC-SHA256).
- **Password Encryption**: Criptografia de senhas com algoritmo BCrypt via Spring Security.
- **Rate Limiting (5 req/min por IP)**: Proteção contra brute force no endpoint de autenticação (`/auth/login`) utilizando Bucket4j in-memory.

### Usuário Administrador de Demonstração (Seed Database)
Na inicialização do sistema, a migração Flyway `db/migration/V2__security_schema.sql` semeia automaticamente um usuário administrador para desenvolvimento local:

- **Username**: `admin`
- **Password**: `admin123` *(criptografada via BCrypt `$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a`)*
- **Role**: `ADMIN`

> [!NOTE]
> Este usuário é inserido apenas se não existir no banco (`ON CONFLICT (username) DO NOTHING`). Ele destina-se exclusivamente ao suporte do onboarding de novos desenvolvedores e testes locais.

---

### Regras de Validação do `JWT_SECRET` (`JwtService.java`)

A classe `JwtService.java` executa verificações defensivas no método `@PostConstruct`:

```java
@PostConstruct
public void validateSecretKey() {
    if (secretKey == null || secretKey.trim().isEmpty()) {
        throw new IllegalArgumentException(
                "ERRO CRÍTICO DE SEGURANÇA: A propriedade 'jwt.secret' (ou variável de ambiente JWT_SECRET) não foi informada."
        );
    }
    byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
    if (keyBytes.length < 32) {
        throw new IllegalArgumentException(
                "ERRO CRÍTICO DE SEGURANÇA: A chave secreta 'jwt.secret' deve possuir no mínimo 32 bytes (256 bits)..."
        );
    }
}
```

1. **Validação 1**: A string da chave não pode ser nula, vazia ou contendo apenas espaços.
2. **Validação 2**: Quando convertida para bytes em UTF-8 (`secretKey.getBytes(StandardCharsets.UTF_8)`), o array resultante deve ter **comprimento superior ou igual a 32 bytes**.
3. **Algoritmo**: O Spring Security / jjwt gera uma chave HMAC `Keys.hmacShaKeyFor(keyBytes)` compatível com o algoritmo `HS256`.

---

### Como Gerar um `JWT_SECRET` Válido no Terminal

Execute um dos comandos abaixo para gerar um segredo de 256 bits (32+ bytes) para seu arquivo `.env`:

```bash
# Opção A: Gerar 64 caracteres hexadecimais (64 bytes UTF-8)
openssl rand -hex 32

# Opção B: Gerar 44 caracteres em Base64 (44 bytes UTF-8)
openssl rand -base64 32
```

Exemplo de exportação para execução nativa Maven:
```bash
export JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250655368566D5971
./mvnw spring-boot:run
```

---

## 🗄️ Banco de Dados & Migrações Flyway

O projeto gerencia o histórico e esquemas do **PostgreSQL 16** via **Flyway**:

* **`V1__initial_schema.sql`**: Criação das tabelas `dealers`, `vehicles`, `audit_log` e seus índices de performance.
* **`V2__security_schema.sql`**: Criação da tabela `users` e inserção do usuário `admin` padrão.
* **`V3__add_color_to_vehicles.sql`**: Adição da coluna de cor na tabela de veículos.

---

## 📑 Documentação da API (Swagger / OpenAPI)

A documentação interativa OpenAPI 3.0 é gerada dinamicamente pelo `springdoc-openapi`:

* **Swagger UI**: [http://localhost:8080/api/swagger-ui.html](http://localhost:8080/api/swagger-ui.html)
* **OpenAPI JSON Spec**: [http://localhost:8080/api/v3/api-docs](http://localhost:8080/api/v3/api-docs)

---

## 🏥 Health Check (Actuator)

* **URL**: [http://localhost:8080/api/actuator/health](http://localhost:8080/api/actuator/health)
* **Resposta Esperada**:
```json
{
  "status": "UP"
}
```

---

## 📮 Fluxo de Integração ViaCEP

1. O utilitário `CepUtils.normalize()` sanitiza a string removendo caracteres não numéricos.
2. O serviço `ViaCepService` aciona o `ViaCepClient` que realiza uma requisição HTTP via `RestClient` para a API pública `https://viacep.com.br/ws/{cep}/json/`.
3. Se o CEP for inexistente ou inválido, o sistema lança uma `BusinessException` capturada pelo `GlobalExceptionHandler`, que retorna HTTP status `400 Bad Request`.
4. Com a resposta válida, os campos de endereço (`street`, `neighborhood`, `city`, `state`) são preenchidos automaticamente na entidade `Dealer`.

---

## 📊 Observability Stack & Structured Logging

A arquitetura de observabilidade do **Vehicle Dealer System** foi projetada para suporte total a ambientes de produção e integração com ecossistemas APM/SIEM (**ELK Stack**, **OpenSearch**, **Datadog**, **Grafana Loki**).

### Componentes da Stack

- **Structured JSON Logging**: Emissão de logs em formato JSON estruturado via `logstash-logback-encoder` para o perfil `prod`.
- **Correlation ID (MDC)**: Propagação automática de identificadores de requisição HTTP através do `CorrelationIdFilter`.
- **Rastreabilidade HTTP**: Registro automatizado de início e conclusão de requisições HTTP (`method`, `path`, `status`, `durationMs`).
- **Logs de Eventos de Negócio**: Rastreamento de operações do ciclo de vida dos domínios (`VEHICLE_CREATED`, `VEHICLE_UPDATED`, `DEALER_CREATED`, `VEHICLE_ASSOCIATED`, etc.).
- **Spring Boot Actuator**: Monitoramento de integridade e métricas do sistema (`/api/actuator/health`).
- **OpenAPI 3.0 / Swagger UI**: Documentação interativa e contratos de API (`/api/swagger-ui.html`).

---

### Modos de Execução por Profile

#### 1. Desenvolvimento Local e Profile Padrão (`local` / `default`)
Quando a aplicação é iniciada sem perfis específicos ou com `spring.profiles.active=local` (`mvn spring-boot:run`), os logs são emitidos no terminal em **formato legível (texto)**:

```text
2026-09-07 14:10:22.123 INFO  [6f9d1b5e-0d4a-42f8-a8d4-12d7c6c4d912] c.d.api.config.CorrelationIdFilter - Iniciando requisição HTTP: method=POST path=/api/vehicles
2026-09-07 14:10:22.145 INFO  [6f9d1b5e-0d4a-42f8-a8d4-12d7c6c4d912] c.d.api.vehicle.VehicleService - Evento de negócio: operation=VEHICLE_CREATED entityId=42 brand=Toyota model=Corolla plate=ABC1D23
2026-09-07 14:10:22.150 INFO  [6f9d1b5e-0d4a-42f8-a8d4-12d7c6c4d912] c.d.api.config.CorrelationIdFilter - Requisição HTTP concluída: method=POST path=/api/vehicles status=201 durationMs=27
```

#### 2. Ambiente de Produção (`prod`)
Em ambiente de produção (`spring.profiles.active=prod`), o Logback alterna dinamicamente para saída **JSON em linha única** (`ConsoleAppender` e `RollingFileAppender` em `logs/app-json.log`).

##### Exemplo Real de Log de Sucesso (JSON):
```json
{
  "timestamp": "2026-09-07T14:10:22.145Z",
  "level": "INFO",
  "application": "vehicle-dealer-system",
  "environment": "prod",
  "logger": "com.dealership.api.vehicle.VehicleService",
  "correlationId": "6f9d1b5e-0d4a-42f8-a8d4-12d7c6c4d912",
  "message": "Evento de negócio: operation=VEHICLE_CREATED entityId=42 brand=Toyota model=Corolla plate=ABC1D23",
  "exception": null
}
```

##### Exemplo Real de Rastreabilidade HTTP (JSON):
```json
{
  "timestamp": "2026-09-07T14:10:22.150Z",
  "level": "INFO",
  "application": "vehicle-dealer-system",
  "environment": "prod",
  "logger": "com.dealership.api.config.CorrelationIdFilter",
  "correlationId": "6f9d1b5e-0d4a-42f8-a8d4-12d7c6c4d912",
  "message": "Requisição HTTP concluída: method=POST path=/api/vehicles status=201 durationMs=27",
  "exception": null
}
```

##### Exemplo Real de Erro / Exceção Tratada (JSON):
```json
{
  "timestamp": "2026-09-07T14:12:05.890Z",
  "level": "ERROR",
  "application": "vehicle-dealer-system",
  "environment": "prod",
  "logger": "com.dealership.api.shared.exception.GlobalExceptionHandler",
  "correlationId": "8f12e1f4-7d5d-4f40-a2c4-0e21d1c4e5f1",
  "message": "Erro de comunicação com serviço ViaCEP em /api/dealers: Read timed out",
  "exception": "java.net.SocketTimeoutException: Read timed out\n\tat java.base/sun.nio.ch.NioSocketImpl.timedRead(NioSocketImpl.java:278)\n\tat com.dealership.api.viacep.ViaCepClient.fetchAddress(ViaCepClient.java:45)..."
}
```

---

## 🧪 Testes de Software

### Como Executar os Testes

Na pasta raiz do backend:
```bash
mvn test
```

### Relatório de Cobertura (JaCoCo)
Após a execução de `mvn test`, o plugin JaCoCo gera relatórios detalhados de cobertura em `target/site/jacoco/index.html`.

---
*Desenvolvido seguindo os mais rigorosos padrões de arquitetura corporativa Full Stack.*
