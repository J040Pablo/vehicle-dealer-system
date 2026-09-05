# Backend – Vehicle Dealer API

![Java 21](https://img.shields.io/badge/Java-21-007396?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Spring Data JPA](https://img.shields.io/badge/Spring_Data_JPA-3.3.3-green?style=for-the-badge&logo=spring&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Flyway](https://img.shields.io/badge/Flyway-Migrations-CC0200?style=for-the-badge&logo=flyway&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Swagger](https://img.shields.io/badge/OpenAPI-3.0-85EA2D?style=for-the-badge&logo=openapi-initiative&logoColor=black)
![Actuator](https://img.shields.io/badge/Spring_Actuator-Enabled-brightgreen?style=for-the-badge)

API RESTful corporativa para gestão de concessionárias e catálogo de veículos, desenvolvida em Java 21 com Spring Boot 3, arquitetura em camadas e práticas avançadas de persistência, auditoria e rastreabilidade.

---

## 🛠️ Tecnologias Utilizadas

* **Java 21**: Utilização de recursos modernos como Pattern Matching e Virtual Threads (suportadas pela JVM).
* **Spring Boot 3.3.3**: Framework base para injeção de dependências, controle web e gerenciamento do ciclo de vida da aplicação.
* **Spring Data JPA & Hibernate**: Abstração de persistência com suporte nativo a paginação (`Pageable`, `Page<T>`).
* **PostgreSQL 16**: Banco de dados relacional robusto para produção.
* **Flyway**: Gerenciamento e versionamento automatizado de schemas de banco de dados (`V1__initial_schema.sql`).
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

1. **Controller (`com.dealership.api.dealer`, `com.dealership.api.vehicle`)**:
   - Expõe endpoints RESTful consumindo e retornando DTOs.
   - Aplica validações de entrada via `Jakarta Validation` (`@Valid`, `@NotNull`, `@NotBlank`, `@CPF/@CNPJ`).
   - Mapeia parâmetros de consulta paginada (`Pageable`).

2. **Service**:
   - Concentra as regras de negócio e orquestração dos fluxos.
   - Gerencia transações com a anotação `@Transactional`.
   - Dispara eventos de auditoria (`AuditEvent`) via `ApplicationEventPublisher`.

3. **Repository**:
   - Interfaces estendendo `JpaRepository<T, ID>`.
   - Fornecem métodos de busca com paginação (`findAll(Pageable)`), busca por CNPJ e por Placa.

4. **DTO (Data Transfer Objects)**:
   - Objetos imutáveis (Records ou Classes com getters) projetados especificamente para transferência de dados de requisição (`DealerRequestDTO`, `VehicleRequestDTO`) e resposta (`DealerResponseDTO`, `VehicleResponseDTO`).

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
│   │   │   ├── vehicle/             # Entidade, Controller, Service, Repository, DTOs, Mapper
│   │   │   ├── viacep/              # Cliente HTTP REST para consumo da API ViaCEP
│   │   │   └── shared/
│   │   │       ├── audit/           # Entidade de AuditLog, Eventos e Listeners
│   │   │       ├── exception/       # GlobalExceptionHandler e Exceções Customizadas
│   │   │       └── util/            # Utilitários (Sanitização de CEP e CNPJ)
│   │   └── resources/
│   │       ├── application.yml      # Configurações centralizadas da aplicação
│   │       └── db/migration/        # Scripts Flyway (V1__initial_schema.sql)
│   └── test/                        # Suíte completa de testes (Unitários, Integração, Mockito)
├── Dockerfile                       # Multi-stage build para otimização de imagem Java
└── pom.xml                          # Dependências Maven e plugins (JaCoCo, MapStruct)
```

---

## ⚙️ Configuração e Variáveis de Ambiente

As configurações estão centralizadas no arquivo `src/main/resources/application.yml`. As principais variáveis configuráveis por ambiente são:

| Variável | Valor Padrão | Descrição |
| :--- | :--- | :--- |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/dealership_db` | URL de conexão com o PostgreSQL |
| `SPRING_DATASOURCE_USERNAME` | `postgres` | Usuário do banco de dados |
| `SPRING_DATASOURCE_PASSWORD` | `postgrespassword` | Senha do banco de dados |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Origens permitidas para requisições CORS |
| `VIACEP_URL` | `https://viacep.com.br/ws` | Base URL do serviço ViaCEP |

---

## 🗄️ Banco de Dados & Flyway

O projeto utiliza **PostgreSQL 16** e gerencia o versionamento da estrutura relacional com **Flyway**.

### Script de Migração (`V1__initial_schema.sql`)
- **Tabela `dealers`**: Guarda os dados de concessionárias (nome, CNPJ único, CEP, logradouro, bairro, cidade, estado, timestamps).
- **Tabela `vehicles`**: Armazena veículos (marca, modelo, ano, placa única, tipo de combustível enum, chave estrangeira `dealer_id`).
- **Tabela `audit_log`**: Registra eventos de alteração de dados (tipo de entidade, ID da entidade, ação realizada, payload JSON, timestamp).
- **Índices de Performance**: Criados explicitamente para `idx_vehicles_dealer_id`, `idx_dealers_cnpj` e `idx_audit_entity`.

---

## 📑 Documentação da API (Swagger / OpenAPI)

A documentação interativa OpenAPI 3.0 é gerada automaticamente pelo `springdoc-openapi`:

* **Swagger UI**: [http://localhost:8080/api/swagger-ui.html](http://localhost:8080/api/swagger-ui.html)
* **OpenAPI JSON Spec**: [http://localhost:8080/api/v3/api-docs](http://localhost:8080/api/v3/api-docs)

---

## 🏥 Health Check (Actuator)

O Spring Boot Actuator expõe o endpoint de verificação de saúde da aplicação e conectividade com o banco de dados:

* **URL**: [http://localhost:8080/api/actuator/health](http://localhost:8080/api/actuator/health)
* **Resposta Esperada**:
```json
{
  "status": "UP"
}
```

---

## 📮 Fluxo de Integração ViaCEP

Ao registrar ou atualizar uma concessionária fornecendo um CEP:

1. O utilitário `CepUtils.normalize()` sanitiza a string removendo hífens e caracteres especiais.
2. O serviço `ViaCepService` aciona o `ViaCepClient` que realiza uma requisição HTTP via `RestClient` para a API pública `https://viacep.com.br/ws/{cep}/json/`.
3. Se o CEP for inexistente ou inválido, o sistema lança uma `BusinessException` capturada pelo `GlobalExceptionHandler`, que retorna HTTP status `400 Bad Request`.
4. Com a resposta válida, os campos de endereço (`street`, `neighborhood`, `city`, `state`) são preenchidos automaticamente na entidade `Dealer`.

---

## 🔍 Rastreabilidade & Correlation ID

Para permitir o rastreio distribuído de requisições de ponta a ponta:

1. O `CorrelationIdFilter` (`OncePerRequestFilter`) intercepta cada requisição HTTP recebida.
2. Verifica a presença do cabeçalho `X-Correlation-Id`. Se ausente, gera um novo `UUID`.
3. Adiciona o identificador no **MDC (Mapped Diagnostic Context)** do Slf4j e injeta o header de resposta `X-Correlation-Id`.
4. Todos os logs gerados durante o processamento da requisição contêm o `correlationId` formatado:
   ```text
   2026-09-05 20:33:35.093 [http-nio-8080-exec-1] [f81d4fae-7dec-11d0-a765-00a0c91e6bf6] WARN c.d.a.s.e.GlobalExceptionHandler - Recurso não encontrado...
   ```

---

## 🧪 Testes de Software

A aplicação possui uma suíte robusta com **mais de 100 testes automatizados**, abrangendo unitários, de integração e de persistência.

### Como Executar os Testes

Na pasta raiz do backend:
```bash
mvn test
```

### Categorias de Testes Implementados

1. **Testes Unitários**:
   - `VehicleServiceTest`, `DealerServiceTest`: Testam a lógica de negócio isolando dependências com `@Mock` e `@InjectMocks` do Mockito.
   - `ViaCepServiceTest`, `ViaCepClientTest`: Testam o comportamento da integração externa e cenários de falha.
   - `VehicleMapperTest`, `DealerMapperTest`: Validam o mapeamento de campos entre DTOs e entidades.

2. **Testes de Integração da Camada Web**:
   - `VehicleControllerTest`, `DealerControllerTest`: Utilizam `@WebMvcTest` e `MockMvc` para testar códigos de status HTTP, validações de payload JSON e deserialização.

3. **Testes de Repositório e Persistência**:
   - `VehicleRepositoryTest`, `DealerRepositoryTest`: Testam consultas JPA, restrições de unicidade (`plate`, `cnpj`) e paginação usando banco de dados em memória / Testcontainers.

4. **Relatório de Cobertura (JaCoCo)**:
   - Durante a execução de `mvn test`, o plugin JaCoCo gera relatórios detalhados de cobertura em `target/site/jacoco/index.html`.

---
