# Music Store

E-commerce de discos, merchandise e produtos musicais. Aplicação full-stack com frontend em React e backend em microsserviços Spring Boot.

---

## 📁 Estrutura do projeto

```text
music-merchandising-app/
├── main/        # Frontend React (CRA + Tailwind + PrimeReact)
└── Backend/     # Microsserviços Java 21 / Spring Boot 4
    ├── eureka-server         (8761) — Service Discovery
    ├── api-gateway           (8080) — Entrada única (JWT + CORS)
    ├── auth-service          (8081) — Usuários, login, favoritos
    ├── product-service       (8083) — Catálogo de produtos
    ├── cart-service          (8082) — Carrinho de compras
    ├── order-service         (8084) — Pedidos e rastreamento
    └── notification-service  (8085) — Notificações (Kafka consumer)
```

---

## ✨ Funcionalidades

### Loja (público)

- **Catálogo** com busca, filtros por categoria e faixa de preço
- **Página do produto** com descrição, preço, estoque, produtos relacionados
- **Categorias** dedicadas com slugs em português
- **Carrosséis** na home (recém-chegados, ofertas, recomendados)
- **Histórico de produtos vistos** (persistido em `localStorage`)

### Conta

- **Cadastro** com validação de CPF (dígitos verificadores), e-mail, senha forte (8+ chars, maiúscula, número, especial)
- **Login** com JWT
- **Edição de perfil** completa: nome, e-mail, CPF, endereço, foto (upload com redimensionamento automático)
- **Carrinho persistente** no MongoDB — quantidade, remoção, total
- **Favoritos sincronizados** com o backend (carregados via Context, 1 fetch só)
- **Meus Pedidos** com rastreamento e detalhes do recibo
- **Login obrigatório** para favoritar, comprar e ver carrinho/perfil (modal pedindo login aparece nas ações protegidas)

### Painel administrativo (`/admin`)

- **Login dedicado** com verificação de `role: ADMIN`
- **Dashboard** com KPIs (receita do mês, pedidos pendentes, produtos ativos, usuários)
- **Gerenciar produtos**: CRUD completo, multi-categoria, upload de imagem, status ativo/inativo
- **Gerenciar pedidos**: atualizar status (com transições válidas), adicionar código de rastreio (só após pagamento confirmado), ver endereço de entrega
- **Gerenciar usuários**: listar, buscar por nome/email/CPF, remover (sem auto-exclusão)
- **Sidebar** com navegação contextual e logout

### Segurança

- **JWT** validado no gateway (auth-service como source of truth)
- **Whitelist** de rotas públicas (`POST /users/login`, `POST /users/register`, `GET /products`)
- **`X-Internal-Secret`** em todos os serviços downstream — impede acesso direto pulando o gateway
- **`X-User-Id` / `X-User-Role`** injetados pelo gateway no JWT
- **Spring Security** + `@PreAuthorize` no auth-service (admin-only para listar/excluir usuários)
- **Interceptors** em product/order/cart/notification para checar role e ownership
- **Transições de status** de pedido validadas no frontend e backend

---

## 🛠️ Stack

### Frontend (`main/`)

- **React 18** (CRA) + **React Router v7**
- **Tailwind CSS 3** para estilo
- **PrimeReact 10** (DataTable, Dialog, MultiSelect, Dropdown, Toast)
- **Axios** para HTTP
- **Lucide React** para ícones
- **Context API** para Auth e Favoritos

### Backend (`Backend/`)

- **Java 21** + **Spring Boot 4.0.4**
- **Spring Cloud Gateway MVC** (api-gateway)
- **Spring Cloud Netflix Eureka** (discovery)
- **PostgreSQL 16** (auth-service) + **Flyway** para migrations
- **MongoDB 7** (product, cart, order, notification) + **Mongock 5** para migrations
- **Apache Kafka** para eventos (order → notification)
- **Spring Security** + **JJWT 0.12** (auth-service)
- **SpringDoc OpenAPI** (Swagger em cada serviço)
- **Maven** para build

### Infraestrutura

- **Docker Compose** orquestrando 10 containers (3 de infra + 7 serviços Java)
- Multi-stage builds com Eclipse Temurin 21 (Alpine)
- Healthchecks em todos os containers
- DNS interno via rede `music-net`

---

## ✅ Pré-requisitos

- **Docker** + **Docker Compose** (para subir o backend)
- **Node.js 18+** e **npm** (para rodar o frontend)

---

## 🚀 Como executar

### 1. Subir o backend

```bash
cd Backend
docker compose up -d --build
```

⏱️ Primeiro build leva ~5–10 min (Maven baixa dependências). Builds seguintes usam cache de layer.

Verifique se está tudo healthy:

```bash
docker compose ps
```

Testar:

```bash
curl http://localhost:8080/products
```

### 2. Rodar o frontend

```bash
cd main
npm install
npm start
```

A loja abre em `http://localhost:3000`.

### 3. Conta administrativa

O seed cria um admin (`rafael@music.com`) com senha BCrypt **desconhecida**. Para criar uma conta de admin:

```bash
# 1. Registre uma conta normal pela tela /register
# 2. Promova ela a ADMIN:
docker exec auth-db psql -U postgres -d auth_db \
  -c "UPDATE users SET role='ADMIN' WHERE email='SEU_EMAIL';"

# 3. Faça logout + login para regenerar o JWT
# 4. Acesse /admin
```

---

## 📡 Variáveis de ambiente

### Frontend (`main/.env`)

```env
REACT_APP_API_URL=http://localhost:8080
```

### Backend

Todos os YAMLs estão configurados com valores fixos para Docker (`mongodb:27017`, `auth-db:5432`, `eureka-server:8761`). Em produção, considerar variáveis de ambiente para:

- `JWT_SECRET`
- `INTERNAL_SECRET`
- `DB_PASSWORD`

---

## 🗄️ Banco de dados

### PostgreSQL (`auth_db`)

- `users` — id, nome, e-mail, senha (BCrypt), CPF, role, foto, endereço
- `user_favorites` — relação user ↔ productId
- **Migrations Flyway** em `auth-service/src/main/resources/db/migration/`

### MongoDB

- `product_db.products` — 30 produtos seedados via Mongock V002
- `cart_db.carts` — carrinhos por usuário
- `order_db.orders` — pedidos com items, status, tracking
- `notification_db.notifications` — notificações de eventos

---

## 🔄 Fluxo de uma compra

```text
1. Usuário (logado) clica "Adicionar ao Carrinho" no produto
   → POST /cart/{userId}/items

2. Acessa /carrinho
   → GET /cart/{userId} — lista os itens

3. Ajusta quantidades (+/-) ou remove itens
   → POST/DELETE /cart/{userId}/items/{productId}

4. Finaliza compra
   → POST /orders { items, total, paymentMethod: PIX }
   → Backend cria pedido (status=PENDING)
   → Publica evento OrderCreated no Kafka
   → notification-service recebe e cria notificação

5. Admin recebe novo pedido em /admin/pedidos
   → PATCH /orders/{id}/status (PENDING → CONFIRMED → SHIPPED → DELIVERED)
   → PATCH /orders/{id}/tracking (código + transportadora, após CONFIRMED)

6. Usuário acompanha em /perfil/pedidos
   → GET /orders/user/{userId}
```

---

## 🔧 Comandos úteis

```bash
# Logs de um serviço
docker compose logs -f api-gateway

# Reiniciar um serviço após code change
docker compose up -d --build product-service

# Parar tudo (mantém dados)
docker compose down

# Zerar tudo (apaga Postgres, Mongo, Kafka)
docker compose down -v

# Acessar Postgres
docker exec -it auth-db psql -U postgres -d auth_db

# Acessar Mongo
docker exec -it mongodb mongosh
```

---

## 📚 Swagger / API Docs

Cada serviço expõe Swagger em sua porta:

- Auth: [http://localhost:8081/swagger-ui.html](http://localhost:8081/swagger-ui.html)
- Products: [http://localhost:8083/swagger-ui.html](http://localhost:8083/swagger-ui.html)
- Cart: [http://localhost:8082/swagger-ui.html](http://localhost:8082/swagger-ui.html)
- Orders: [http://localhost:8084/swagger-ui.html](http://localhost:8084/swagger-ui.html)
- Notifications: [http://localhost:8085/swagger-ui.html](http://localhost:8085/swagger-ui.html)
