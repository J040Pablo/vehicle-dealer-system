# Vehicle Dealer System

![Java 21](https://img.shields.io/badge/Java-21-007396?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring_Security-JWT-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

Sistema corporativo completo para Gestão de Veículos e Concessionárias, projetado com arquitetura moderna em camadas, autenticação segura JWT (Spring Security 6), conteinerização Docker, integração com serviços externos e práticas de observabilidade.

---

## 📌 Visão Geral

### Objetivo do Projeto
O **Vehicle Dealer System** foi desenvolvido para centralizar a gestão operacional do catálogo de veículos e da rede de concessionárias parceiras de uma montadora automotiva. O sistema permite cadastrar, atualizar, listar, filtrar, autenticar usuários e auditar todas as operações comerciais de forma eficiente e segura.

### Problema que Resolve
* **Descentralização e Inconsistência de Dados**: Evita cadastros duplicados de concessionárias (validação única de CNPJ) e placas veiculares.
* **Autenticação e Controle de Acesso**: Proteção de endpoints REST via Spring Security e JSON Web Tokens (JWT) com RBAC (Role-Based Access Control).
* **Agilidade no Cadastro de Endereços**: Elimina a digitação manual de logradouros via integração automatizada com a API **ViaCEP**.
* **Falta de Rastreabilidade Operacional**: Registra auditoria completa de criações, alterações e exclusões na tabela `audit_log`, aliada ao rastreio de requisições por `Correlation ID`.
* **Escalabilidade em Grandes Catálogos**: Implementa paginação e ordenação no servidor (Spring Data `Pageable`), garantindo alta performance no consumo de dados.

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
                      Header: Authorization (Bearer JWT)
                                    |
                                    v
+-----------------------------------+-----------------------------------+
|                        BACKEND SPRING BOOT 3                          |
|                                                                       |
|  [ CorrelationIdFilter ] -> [ JwtAuthenticationFilter ]               |
|                                    |                                  |
|                                    v                                  |
|                         [ Controller ] -> [ Service ]                 |
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

---

## ⚙️ Variáveis de Ambiente

A aplicação utiliza variáveis de ambiente centralizadas no arquivo `.env` localizado na raiz do projeto.

### Tabela de Referência de Variáveis

| Variável | Obrigatória | Valor Padrão (Local) | Descrição |
| :--- | :---: | :--- | :--- |
| `JWT_SECRET` | **Sim** | *(Nenhum - Definido no `.env.example`)* | Chave secreta HMAC-SHA256 usada para assinatura e validação de tokens JWT. Deve possuir no **mínimo 32 bytes (256 bits)** em UTF-8. |
| `JWT_EXPIRATION` | Não | `86400000` | Tempo de validade do token JWT em milissegundos (86400000 ms = 24 horas). |
| `SPRING_DATASOURCE_URL` | Não | `jdbc:postgresql://localhost:5432/dealership_db` | URL JDBC de conexão com o PostgreSQL (`jdbc:postgresql://postgres:5432/dealership_db` para Docker). |
| `SPRING_DATASOURCE_USERNAME` | Não | `postgres` | Nome do usuário do banco de dados PostgreSQL. |
| `SPRING_DATASOURCE_PASSWORD` | Não | `postgrespassword` | Senha de acesso ao banco de dados PostgreSQL. |
| `CORS_ALLOWED_ORIGINS` | Não | `http://localhost:5173` | Origens HTTP permitidas para requisições Cross-Origin (CORS). |
| `VIACEP_URL` | Não | `https://viacep.com.br/ws` | URL base do serviço REST externo ViaCEP. |

---

## 🚀 Como Executar

### Pré-requisitos
* **Docker Engine** (v20.10+) e **Docker Compose** (v2.0+)
* *(Opcional para execução nativa)*: **Java 21 JDK** e **Node.js 18+**

---

### 1. Execução Simplificada via Docker Compose (Recomendado)

#### Passo 1: Configurar as Variáveis de Ambiente
Na raiz do projeto, crie o arquivo `.env` a partir do modelo pré-configurado `.env.example`:

```bash
cp .env.example .env
```

> [!IMPORTANT]
> O arquivo `.env.example` já inclui um segredo `JWT_SECRET` válido para o ambiente de desenvolvimento local. Em ambientes de produção, gere uma nova chave de 256 bits.

#### Passo 2: Inicializar os Containers
Execute o Docker Compose para compilar e subir os serviços de banco de dados, backend e frontend:

```bash
docker compose up -d --build
```

O Docker Compose inicializará automaticamente em ordem de dependência:
1. `postgres` (PostgreSQL 16) com verificação de saúde (`healthcheck`).
2. `backend` (Spring Boot API), aguardando a saúde do banco.
3. `frontend` (Nginx + React App), conectado à API.

#### Passo 3: Acessar a Aplicação

| Serviço | URL de Acesso | Descrição |
| :--- | :--- | :--- |
| **Frontend Web** | [http://localhost:3000](http://localhost:3000) | Interface gráfica do usuário |
| **Backend REST API** | [http://localhost:8080/api](http://localhost:8080/api) | Base URL da API Spring Boot |
| **Swagger UI** | [http://localhost:8080/api/swagger-ui.html](http://localhost:8080/api/swagger-ui.html) | Documentação OpenAPI 3.0 interativa |
| **Health Check** | [http://localhost:8080/api/actuator/health](http://localhost:8080/api/actuator/health) | Endpoint de verificação de status |

#### Passo 4: Credenciais de Demonstração (Ambientes Locais/Demo)
A aplicação aplica automaticamente a migração Flyway (`V2__security_schema.sql`), inserindo um usuário administrador padrão para testes locais:

* **Usuário**: `admin`
* **Senha**: `admin123`
* **Perfil / Role**: `ADMIN`

> [!WARNING]
> As credenciais acima são pré-configuradas exclusivamente para facilitar a avaliação e desenvolvimento local. Altere a senha ou desative este usuário antes de implantar em ambiente de produção.

---

### 2. Comandos Operacionais do Docker Compose

* **Visualizar status dos containers**:
  ```bash
  docker compose ps
  ```

* **Acompanhar os logs do backend em tempo real**:
  ```bash
  docker compose logs -f backend
  ```

* **Encerrar os containers**:
  ```bash
  docker compose down
  ```

* **Encerrar os containers removendo volumes (reset total do banco de dados)**:
  ```bash
  docker compose down -v
  ```

---

### 3. Execução Manual para Desenvolvimento (Sem Docker total)

#### Passo A: Banco de Dados PostgreSQL
Suba apenas o container do banco de dados:
```bash
docker compose up -d postgres
```

#### Passo B: Backend Spring Boot
Garantindo que o arquivo `.env` esteja preenchido ou a variável `JWT_SECRET` esteja exportada no terminal:
```bash
cd backend
export JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250655368566D5971
./mvnw spring-boot:run
```
*A API iniciará na porta `8080`.*

#### Passo C: Frontend React
```bash
cd frontend
npm install
npm run dev
```
*A aplicação web estará disponível em [http://localhost:5173](http://localhost:5173).*

---

## 🔧 Solução de Problemas: `JWT_SECRET`

A segurança da autenticação JWT é gerenciada pela classe `JwtService.java`. Durante a inicialização da aplicação Spring Boot (`@PostConstruct`), o sistema executa verificações estritas sobre a chave secreta configurada.

### Regras de Validação Implementadas no Código (`JwtService.java`)

1. **Obrigatoriedade**: A propriedade `jwt.secret` (ou variável de ambiente `JWT_SECRET`) **não pode ser nula nem vazia**.
2. **Comprimento Mínimo de Chave**: O vetor de bytes retornado por `JWT_SECRET.getBytes(StandardCharsets.UTF_8)` deve conter **no mínimo 32 bytes (256 bits)**.

---

### Diagnóstico de Erros Comuns

#### Sintoma: Falha na Inicialização do Backend (`IllegalArgumentException`)

Ao tentar iniciar a aplicação (via `./mvnw spring-boot:run` ou `docker compose up`), a aplicação é interrompida com o seguinte log de erro:

```text
java.lang.IllegalArgumentException: ERRO CRÍTICO DE SEGURANÇA: A propriedade 'jwt.secret' (ou variável de ambiente JWT_SECRET) não foi informada. A aplicação não pode ser inicializada sem uma chave secreta JWT válida.
```
ou:
```text
java.lang.IllegalArgumentException: ERRO CRÍTICO DE SEGURANÇA: A chave secreta 'jwt.secret' deve possuir no mínimo 32 bytes (256 bits) de comprimento para garantir a segurança da assinatura HMAC-SHA256.
```

#### Causa do Erro
- O arquivo `.env` não foi criado a partir de `.env.example`.
- A variável `JWT_SECRET` está ausente no ambiente do Docker Compose.
- A chave fornecida possui menos de 32 caracteres/bytes.

---

### Resolução Passo a Passo

1. **Certifique-se de que o arquivo `.env` existe na raiz do projeto**:
   ```bash
   ls -la .env
   ```
   Se não existir, copie o arquivo de exemplo:
   ```bash
   cp .env.example .env
   ```

2. **Gerando uma Nova Chave Secreta Válida (256 bits / 32 bytes)**:
   Caso deseje gerar um novo segredo cryptograficamente seguro, execute um dos comandos abaixo no terminal Linux/macOS:

   * **Opção 1 (Hexadecimal - 64 caracteres hex = 64 bytes UTF-8)**:
     ```bash
     openssl rand -hex 32
     ```
   * **Opção 2 (Base64 - 44 caracteres base64 >= 32 bytes UTF-8)**:
     ```bash
     openssl rand -base64 32
     ```

3. **Atualizar a Variável no `.env`**:
   Cole a chave gerada no arquivo `.env`:
   ```env
   JWT_SECRET=sua_chave_gerada_com_mais_de_32_caracteres_aqui_1234567890
   ```

4. **Reiniciar o Container do Backend**:
   ```bash
   docker compose up -d --build backend
   ```

---

## 🛠️ Resumo de Funcionalidades

- [x] **Autenticação & Segurança JWT**: Login com geração de JWT assinado via HMAC-SHA256, autorização por Roles (`ADMIN`, `USER`).
- [x] **CRUD de Concessionárias**: Cadastro com auto-preenchimento via CEP, edição, listagem paginada e exclusão.
- [x] **CRUD de Veículos**: Cadastro completo com associação de concessionária, tipo de combustível e placa única.
- [x] **Paginação de Dados**: Suporte a parâmetros `page`, `size` e `sort` em todas as consultas de listagem.
- [x] **Auditoria Automatizada**: Publicação de eventos de auditoria para persistência de histórico de operações.
- [x] **Rastreabilidade (Correlation ID)**: Injeção de UUID no header `X-Correlation-Id` vinculado ao MDC de logs.
- [x] **Integração ViaCEP**: Consumo de API externa com tratamento de timeouts e fallback de exceção.
- [x] **Observabilidade (Health Check)**: Endpoint Actuator exposto para monitoramento de disponibilidade.

---
*Desenvolvido seguindo os mais rigorosos padrões de arquitetura corporativa Full Stack.*
