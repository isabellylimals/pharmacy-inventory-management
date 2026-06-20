# FarmaGestão - Sistema de Gerenciamento de Estoque de Farmácia

## Sobre o Projeto

O **FarmaGestão** é um sistema digital, desenvolvido sob a metodologia ágil Scrum, para modernizar e otimizar a gestão de estoque e as operações de frente de caixa (PDV) de farmácias. Criado para eliminar a dependência de anotações manuais, o sistema automatiza o fluxo desde a entrada de produtos até a realização de vendas, garantindo o controlo rigoroso de lotes, datas de validade e níveis de estoque.

---

## Principais Funcionalidades

* **Controle de Acesso por Perfil:** Sistema de login seguro utilizando tokens JWT, com permissões visuais e técnicas diferenciadas para a **Proprietária** (acesso total a relatórios e gestão) e **Atendentes** (foco nas operações de balcão e vendas).
* **Gestão de Medicamentos e Inventário:** Cadastro completo de medicamentos (incluindo princípio ativo, categoria e tipo de receita), gestão rigorosa de lotes e acompanhamento de datas de validade.
* **Frente de Caixa Integrada (PDV):** Registo de vendas ágil com **baixa automática e imediata no estoque**, mantendo os saldos sincronizados.
* **Alertas Inteligentes:** Notificações automáticas e bloqueios visuais para medicamentos próximos do prazo de validade e itens que atingiram o estoque mínimo de segurança.
* **Reposição Automatizada:** Geração automática de listas de compras e solicitações de reposição direta com fornecedores para itens críticos ou em falta.
* **Dashboard e Relatórios Gerenciais:** Extração de relatórios mensais, visualização de produtos mais vendidos e histórico completo de movimentações para tomada de decisão estratégica.

---

## Tecnologias Utilizadas

### Backend (`/backend`)
* **Linguagem:** Java (versão 17+)
* **Framework:** Spring Boot
* **Persistência de Dados:** Spring Data JPA / Hibernate
* **Segurança:** Spring Security com autenticação JWT
* **Base de Dados:** PostgreSQL / MySQL (Configurável)
* **Gestor de Dependências:** Maven

### Frontend (`/frontend`)
* **Linguagem:** TypeScript
* **Biblioteca Principal:** React
* **Build Tool:** Vite
* **Estilização:** Tailwind CSS
* **Componentes de UI:** Shadcn UI
* **Gestor de Pacotes:** npm / pnpm

---

## Como Executar o Projeto

Para correr o projeto localmente, certifica-te de ter o **Java 17+**, o **Node.js** e uma **Base de Dados Relacional** (como PostgreSQL ou MySQL) instalados na tua máquina.

### 1. Backend

```bash
# Entre na pasta do backend
cd backend

# Configure as credenciais do banco de dados e a chave secreta JWT no arquivo:
# src/main/resources/application.properties

# Instale as dependências e inicie o servidor com o Maven Wrapper
# Linux/Mac:
./mvnw spring-boot:run
# Windows:
mvnw.cmd spring-boot:run
```

### 2. Frontend
```bash
# Em outro terminal, entre na pasta do frontend
cd frontend

# Instale as dependências do Node
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```