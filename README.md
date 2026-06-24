# Music Store

Projeto E-commerce de discos, merch e produtos musicais. Aplicação full-stack com frontend em React e backend em microsserviços Spring Boot.

---

## 📁 Estrutura do projeto

```text
music-merchandising-app/
├── main/        # Frontend React (CRA + Tailwind + PrimeReact)
└── Backend/     # Microsserviços Java 21 / Spring Boot 4
    ├── eureka-server         (8761) — Service Discovery
    ├── api-gateway           (8080) — Entrada única (JWT + CORS)
    ├── auth-service          (8081) — Usuários, login, favoritos
    ├── product-service       (8083) — Catálogo, estoque, reserve atômico
    ├── cart-service          (8082) — Carrinho de compras
    ├── order-service         (8084) — Pedidos, frete, tracking, eventos Kafka
    └── notification-service  (8085) — Consumer Kafka, notificações
```

---

## ✨ Funcionalidades

### Loja (público)

- **Catálogo** com busca, filtros por categoria e faixa de preço
- **Página do produto** com descrição, preço, estoque, produtos relacionados
- **Categorias** dedicadas com slugs em português (Metal Progressivo, Black Metal, Vinil, CDs, Merchandise oficial, etc.)
- **Carrosséis** na home (Recém Chegados, Baseado no que você viu, Ofertas da Semana — agrupados por preço ≤ R$ 100)
- **Hero** com banner gerado dinamicamente: descrições via **Groq (LLaMA 3.3 70B)** e imagens via **Unsplash/RapidAPI**, cacheadas em `localStorage` por 4 dias
- **Histórico de produtos vistos** (persistido em `localStorage`, com sanitização contra storage corrompido)
- **Tema "liquid glass"**: gradient azul-marinho → preto fixo no body, cards translúcidos com `backdrop-filter` e highlight interno
- **Cálculo de frete em tempo real** via **Melhor Envio (sandbox)** — Correios, Jadlog, etc. — proxy do CRA para contornar CORS

### Conta

- **Cadastro** com validação de CPF (dígitos verificadores), e-mail, senha forte (8+ chars, maiúscula, número, especial)
- **Login** com JWT (subject = `userId`; troca de e-mail não invalida tokens vivos)
- **Edição de perfil** completa: nome, e-mail, CPF, endereço, foto (upload com redimensionamento automático)
- **Reconfirmação de senha** obrigatória para alterar e-mail ou senha
- **Carrinho persistente** no MongoDB — quantidade, remoção, total, **zera no logout**
- **Favoritos sincronizados** com o backend (carregados via Context, 1 fetch só)
- **Meus Pedidos** com rastreamento, código dos Correios copiável, status visual
- **Notificações** em tempo real (assinadas via Kafka) — criação, confirmação, envio, entrega, cancelamento — com badge de não lidas no perfil
- **Compra "Comprar Agora"** adiciona ao carrinho + redireciona, com cálculo de frete obrigatório antes de finalizar

### Painel administrativo (`/admin`)

- **Login dedicado** com verificação de `role: ADMIN`
- **Dashboard** com KPIs (receita do mês, pedidos pendentes, produtos ativos, usuários)
- **Gerenciar produtos**: CRUD completo, multi-categoria, upload de imagem, controle de estoque (campo `stockQuantity`), produtos sem estoque ficam ocultos do público mas visíveis para o admin
- **Gerenciar pedidos**: atualizar status com transições válidas (PENDING → CONFIRMED → SHIPPED → DELIVERED, com CANCELLED em qualquer ponto), adicionar código de rastreio (validado por regex), ver endereço de entrega
- **Gerenciar usuários**: listar, buscar por nome/email/CPF, remover (sem auto-exclusão)
- **Sidebar** com navegação contextual e logout

### Segurança

- **JWT** validado no gateway, com `iss=music-store` e `aud=music-store-api` exigidos no parsing (tokens de outros ambientes são rejeitados)
- **Subject = `userId`** (não e-mail) — troca de e-mail não quebra sessões
- **Whitelist exata** (regex) de rotas públicas: `POST /users/login`, `POST /users/register`, `GET /products`, `GET /products/{id}`, Swagger
- **OPTIONS preflight** sempre liberado (CORS funciona via gateway)
- **Mutações exigem `X-User-Id`** não-vazio no gateway
- **`X-Internal-Secret`** validado em todos os serviços downstream com **comparação constant-time** (`MessageDigest.isEqual`) — impede timing attack
- **`X-User-Id` / `X-User-Role` / `X-User-Email`** injetados pelo gateway no JWT
- **Spring Security** + `@PreAuthorize` no auth-service
- **Interceptors** em product/order/cart/notification para checar role e ownership
- **Transições de status** de pedido validadas no backend (transitions inválidas devolvem 409)
- **Actuator** restrito a `health`/`info` em todos os serviços, sem expor `env`/`metrics`/`heapdump`
- **CORS** restrito a `localhost:3000` e `localhost:5173` (não usa wildcard `172.*`/`192.168.*` que permitiria DNS rebinding)
- **`GlobalExceptionHandler`** com `traceId` UUID — stacktrace nunca vai no body da resposta

### Resiliência

- **Kafka producer** com `acks=all`, `enable.idempotence=true`, retries=5
- **Kafka consumer** com `DefaultErrorHandler` + retry com `FixedBackOff` (3x, 1s) + **Dead Letter Topic** (`order.created.DLT`, `order.status-changed.DLT`)
- **Idempotência** das notificações via `dedupKey` (índice único Mongo): evento reprocessado não duplica notificação
- **AckMode.MANUAL_IMMEDIATE** no consumer — ack só depois do save
- **Estoque** com `@Version` (optimistic lock Mongo) — endpoint `POST /products/{id}/reserve` com retry de 5x em conflito, evita overselling em concorrência
- **Reserva de estoque atômica** antes da criação do pedido (transação rollback se faltar estoque → cliente recebe 409 com mensagem amigável)

---

## 🛠️ Stack

### Frontend (`main/`)

- **React 18** (CRA) + **React Router v7**
- **Tailwind CSS 3** + classes utilitárias compostas em `index.css` para o tema glass (`.app-bg`, `.glass-card`, `.glass-popover`, `.glass-bar`)
- **PrimeReact 10** (DataTable, Dialog, MultiSelect, Dropdown, Toast)
- **Axios** com interceptors (token JWT + tratamento 401)
- **Lucide React** para ícones
- **Swiper** para o carrossel da home
- **Context API** para Auth, Cart, Favorites
- **Proxy de desenvolvimento** (`setupProxy.js`) para o Melhor Envio (contorna CORS sandbox)

### Backend (`Backend/`)

- **Java 21** + **Spring Boot 4.0.4**
- **Spring Cloud Gateway MVC** (api-gateway, rotas com `http://service:port` via DNS do Docker — `lb://` não funciona em 2025.1)
- **Spring Cloud Netflix Eureka** (discovery)
- **PostgreSQL 16** (auth-service) + **Flyway** para migrations
- **MongoDB 7** (product, cart, order, notification) + **Mongock 5.5.1** para migrations (com workaround `@Bean @Primary MongoClient` por incompatibilidade com Spring Boot 4 autoconfig)
- **Apache Kafka** para eventos (`order.created`, `order.status-changed`) + DLTs
- **Spring Security** + **JJWT 0.12** (auth-service)
- **RestClient** (order-service → product-service para reservar estoque)
- **SpringDoc OpenAPI** (Swagger em cada serviço)
- **Maven** para build

### Infraestrutura

- **Docker Compose** orquestrando 10 containers (3 de infra + 7 serviços Java)
- Multi-stage builds com Eclipse Temurin 21 (Alpine)
- Healthchecks em todos os containers
- DNS interno via rede `music-net`
- **YAML anchors** no `docker-compose.yml` (`x-shared-env`, `x-internal-env`) para distribuir `JWT_SECRET` / `INTERNAL_SECRET` sem duplicação

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

O seed (`auth-service/.../V5__reset_admin_user.sql`) cria um admin com credenciais conhecidas:

- **Email:** `rafael@music.com`
- **Senha:** `Admin@123`

Faça login e acesse `/admin`. Se quiser promover outra conta a admin:

```bash
docker exec auth-db psql -U postgres -d auth_db \
  -c "UPDATE users SET role='ADMIN' WHERE email='SEU_EMAIL';"
```

Depois é só fazer logout + login para regenerar o JWT com o novo role.

---

## 📡 Variáveis de ambiente

### Frontend (`main/.env`)

```env
REACT_APP_API_URL=http://localhost:8080

# APIs externas (carrossel da home)
REACT_APP_GROQ_API_KEY=...           # https://console.groq.com
REACT_APP_RAPIDAPI_KEY=...           # unsplash-image-search-api.p.rapidapi.com

# Melhor Envio (cálculo de frete) — gere um token pessoal no sandbox
REACT_APP_MELHOR_ENVIO_TOKEN=...     # https://sandbox.melhorenvio.com.br
REACT_APP_MELHOR_ENVIO_FROM_CEP=01310100
```

> O token do Melhor Envio precisa ser um **Personal Access Token** com escopo `shipping-calculate` — não o Client Secret de um aplicativo OAuth. O proxy `setupProxy.js` injeta `Authorization: Bearer <token>` nas chamadas para `/melhor-envio/*`.

### Backend

Definidos via `environment` no `docker-compose.yml` através de YAML anchors (`x-shared-env`, `x-internal-env`):

- `JWT_SECRET` — segredo HMAC SHA-512 (base64)
- `JWT_ISSUER` (default: `music-store`)
- `JWT_AUDIENCE` (default: `music-store-api`)
- `INTERNAL_SECRET` — segredo para validar chamadas entre serviços

---

## 🗄️ Banco de dados

### PostgreSQL (`auth_db`)

- `users` — id, nome, e-mail, senha (BCrypt), CPF, role, foto, endereço
- `user_favorites` — relação user ↔ productId
- **Migrations Flyway** em `auth-service/src/main/resources/db/migration/`:
  - V1: cria tabela `users`
  - V2: cria tabela `user_favorites`
  - V3: seed do admin (depois sobrescrito em V5)
  - V4: amplia coluna `profile_photo_url` (data URLs base64)
  - V5: reset do admin com senha conhecida (`Admin@123`)

### MongoDB

- `product_db.products` — produtos com `@Version` para optimistic lock; V001 cria índices, V002 seed inicial, V003 backfill do campo `version`
- `cart_db.carts` — carrinhos por usuário
- `order_db.orders` — pedidos com items, status, tracking, `shippingCost`, `shippingService`
- `notification_db.notifications` — notificações com `dedupKey` indexado único

---

## 🔄 Fluxo de uma compra

```text
1. Usuário (logado) clica "Adicionar ao Carrinho" ou "Comprar Agora" no produto
   → POST /cart/{userId}/items
   → (Comprar Agora também redireciona para /carrinho)

2. Acessa /carrinho
   → GET /cart/{userId}

3. Ajusta quantidades (+/-) ou remove itens
   → POST/DELETE /cart/{userId}/items/{productId}

4. Calcula frete (obrigatório antes de finalizar)
   → Frontend: /melhor-envio/shipment/calculate (proxy → sandbox Melhor Envio)
   → Mostra opções de transportadora (Jadlog, Correios PAC/SEDEX, etc.)

5. Finaliza compra
   → POST /orders { items, paymentMethod: PIX, shippingCost, shippingService, shippingCarrier }
   → order-service chama product-service POST /products/{id}/reserve (decrementa estoque atômico)
   → Cria pedido (status=PENDING, total = itens + frete)
   → Publica evento OrderCreated no Kafka
   → notification-service consome e cria notificação ORDER_CONFIRMED

6. Admin gerencia em /admin/pedidos
   → PATCH /orders/{id}/status (PENDING → CONFIRMED → SHIPPED → DELIVERED)
   → PATCH /orders/{id}/tracking (código + transportadora)
   → Cada mudança publica OrderStatusChanged no Kafka
   → notification-service consome e cria notificação ORDER_SHIPPED/DELIVERED/CANCELLED

7. Usuário acompanha em /perfil/pedidos
   → GET /orders/user/{userId}
   → Pode copiar o código de rastreio dos Correios
   → Vê histórico de notificações no perfil (badge de não lidas)
```

---

## 🔧 Comandos úteis

```bash
# Logs de um serviço
docker compose logs -f api-gateway

# Reiniciar um serviço após code change
docker compose up -d --build product-service

# Forçar recriar container (descartar imagem antiga em cache)
docker compose up -d --build --force-recreate order-service

# Parar tudo (mantém dados)
docker compose down

# Zerar tudo (apaga Postgres, Mongo, Kafka)
docker compose down -v

# Acessar Postgres
docker exec -it auth-db psql -U postgres -d auth_db

# Acessar Mongo
docker exec -it mongodb mongosh

# Inspecionar tópicos Kafka
docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --list

# Ler mensagens do DLT (notificações que falharam)
docker exec kafka /opt/kafka/bin/kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 --topic order.created.DLT --from-beginning
```

---

## 🐛 Troubleshooting

### "Network Error" no login depois de mudanças no backend

Limpe o JWT antigo:

```js
// no DevTools console:
localStorage.clear()
location.reload()
```

Tokens antigos não têm `iss`/`aud` e são rejeitados pelo gateway.

### CORS quebrou (`Access-Control-Allow-Origin` duplicado)

Significa que dois pontos estão adicionando o header. O `auth-service` não deve ter `CorsConfigurationSource` próprio — só o gateway responde CORS.

### Produto não aparece na home / categoria

Provavelmente está sem estoque. O backend filtra produtos com `stockQuantity == 0` para não-admins. Para confirmar, faça login como admin — eles continuam visíveis no `/admin/produtos`.

### Carousel da home não carrega imagens

- Verifique que `REACT_APP_RAPIDAPI_KEY` está no `.env` e o `npm start` foi reiniciado depois.
- Plano free do Unsplash via RapidAPI tem limite por segundo — após o primeiro carregamento, o cache de 4 dias no `localStorage` cobre as visitas seguintes.
- Para resetar o circuit breaker:

  ```js
  localStorage.removeItem('carousel_rate_limited_until')
  ```

### Cálculo de frete dá 401

O token do Melhor Envio precisa ser um **Personal Access Token** com o escopo `shipping-calculate`, não o Client Secret de aplicativo OAuth. Gere em `https://sandbox.melhorenvio.com.br/painel/gerenciar/tokens`.

---

## 📚 Swagger / API Docs

Cada serviço expõe Swagger em sua porta:

- Auth: [http://localhost:8081/swagger-ui.html](http://localhost:8081/swagger-ui.html)
- Products: [http://localhost:8083/swagger-ui.html](http://localhost:8083/swagger-ui.html)
- Cart: [http://localhost:8082/swagger-ui.html](http://localhost:8082/swagger-ui.html)
- Orders: [http://localhost:8084/swagger-ui.html](http://localhost:8084/swagger-ui.html)
- Notifications: [http://localhost:8085/swagger-ui.html](http://localhost:8085/swagger-ui.html)
