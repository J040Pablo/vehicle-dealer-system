# Vehicle Dealer System – Gestão de Veículos e Concessionárias

> **Desafio Técnico – Desenvolvedor Fullstack (Java 21 / Spring Boot + React / TypeScript)**

---

## Sobre o Projeto

O **Vehicle Dealer System** é uma aplicação web completa projetada para gerenciar concessionárias parceiras e o catálogo de veículos disponíveis de uma montadora. 

A solução oferece:
- **Cadastro e Manutenção de Concessionárias**: Auto-preenchimento de endereço no backend via integração com a **API ViaCEP**.
- **Cadastro e Gestão de Veículos**: Cadastro de marca, modelo, ano, placa e tipo de combustível (`FLEX`, `GASOLINA`, `ETANOL`, `DIESEL`, `ELETRICO`, `HIBRIDO`).
- **Associação Dinâmica (1:N)**: Vincule ou transfira veículos entre concessionárias com facilidade.
- **Rastreabilidade & Auditoria**: Logs estruturados em formato JSON com `X-Correlation-Id` e tabela de auditoria `audit_log` via Spring Events.
- **Health Check**: Monitoring de status da aplicação em `/api/actuator/health`.

---

## Tecnologias Utilizadas

### Backend
- **Java 21** & **Spring Boot 3.3**
- **Spring Data JPA** & **Hibernate**
- **PostgreSQL 16** & **Flyway Migration**
- **MapStruct** & **Lombok**
- **Bean Validation (Jakarta)**
- **OpenAPI 3.0 / Swagger UI**
- **JUnit 5**, **Mockito** & **Testcontainers**

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **TanStack Query (React Query v5)**
- **React Hook Form** + **Zod Schema Validation**
- **Tailwind CSS** + **Lucide Icons**
- **Axios Interceptor** (Injeção de `X-Correlation-Id`)

### Infraestrutura
- **Docker** & **Docker Compose**
- **Nginx Alpine**

---

## Como Executar o Projeto

### Opção 1: Via Docker Compose (Recomendado - 1 Comando)

Pré-requisito: Ter o **Docker** e o **Docker Compose** instalados na sua máquina.

```bash
# Clone o repositório e acesse a pasta raiz
cd vehicle-dealer-system

# Suba todos os containers (PostgreSQL, Backend e Frontend)
docker-compose up -d --build
```

Após subir os containers, acesse:
- 💻 **Frontend (Web UI)**: [http://localhost:3000](http://localhost:3000)
- ⚙️ **Backend REST API**: [http://localhost:8080/api](http://localhost:8080/api)
- 📑 **Documentação Swagger UI**: [http://localhost:8080/api/swagger-ui.html](http://localhost:8080/api/swagger-ui.html)
- 🏥 **Actuator Health Check**: [http://localhost:8080/api/actuator/health](http://localhost:8080/api/actuator/health)

---

### Opção 2: Executar Localmente (Desenvolvimento)

#### 1. Banco de Dados PostgreSQL
Suba apenas o container do banco:
```bash
docker-compose up -d postgres
```

#### 2. Backend Spring Boot
```bash
cd backend
./mvnw spring-boot:run
```

#### 3. Frontend React Vite
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Executando os Testes Unitários

Para rodar a suíte de testes do Backend:

```bash
cd backend
./mvnw test
```

---

## 📖 Documentação Arquitetural & AWS

- 📑 Arquitetura Completa do Sistema: [`ARCHITECTURE.md`](ARCHITECTURE.md)
- ☁️ Guia de Implantação Futura na AWS: [`docs/aws-deployment.md`](docs/aws-deployment.md)
