# Nest + Stripe MINI Starter

Demo backend: **POST /stripe/pay → Stripe Checkout (test mode)**  
Stack: **NestJS 13 · TypeScript · Prisma · PostgreSQL**

Need live subscriptions, verified webhooks, CI/CD?  
👉 [Order the full Fiverr gig](https://www.fiverr.com/konstye/build-a-nestjs-backend-with-stripe-payments-and-postgresql)

---

## Quick Start (< 2 min)

```bash
git clone https://github.com/yermbiz/stripe-demo.git
cd stripe-demo
yarn install --frozen-lockfile

cp .env.example .env                # add STRIPE_KEY=sk_test_xxx

# 1️⃣  Start Postgres container
docker compose up -d db             # port 5434 -> 5432 inside

# 2️⃣  Run migration
npx prisma migrate dev

# 3️⃣  Start API
npm run start:dev                   # http://localhost:3015/stripe/pay

# 4️⃣  View database (optional)
npx prisma studio                   # open http://localhost:5555 to inspect data
```

---

## .env.example

```
STRIPE_KEY=sk_test_xxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxx
DATABASE_URL="postgresql://postgres:123@localhost:5440/stripe_demo?schema=public"
```

---

## Test `/stripe/pay`

```bash
curl -X POST http://localhost:3015/stripe/pay \
  -H "Content-Type: application/json" \
  -d '{"product":"Sample Product","amount":499}'
```

Expected (**HTTP 201**):

```json
{ "url": "https://checkout.stripe.com/pay/cs_test_123..." }
```

1. Open the URL, complete payment (Stripe test mode).  
2. `/stripe/webhook` marks the payment as **PAID** and logs success.

---

### 💳 Stripe test card

Use this card to simulate successful payments:

- **Card number:** `4242 4242 4242 4242`  
- **Any** future date, 3-digit CVC, and ZIP (e.g. `12345`)

See more test cards → https://stripe.com/docs/testing

---


## Stripe Webhook Setup (Local Dev)

To receive Stripe events locally, use a tunneling tool like [Cloudflared](https://github.com/cloudflare/cloudflared):

```bash
npx cloudflared tunnel --url http://localhost:3015
```

Stripe will give you a temporary public URL like:

```
https://random-string.trycloudflare.com
```

In your [Stripe dashboard > Webhooks](https://dashboard.stripe.com/test/webhooks), create a new webhook endpoint:

- **URL:** `https://random-string.trycloudflare.com/stripe/webhook`
- **Events to listen to:**
  - `checkout.session.completed`

Then, in your `.env`, also include:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxx
```

The backend will verify the webhook signature and mark the payment as `PAID`.

---

## docker-compose.yml (Postgres only)

```yaml
version: "3.8"
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: 123
      POSTGRES_DB: stripe_demo
    ports:
      - "5434:5432"
    volumes:
      - db-data:/var/lib/postgresql/data
volumes:
  db-data:
```

---

## Project Structure

```
src/
  stripe/
    dto/create-checkout-session.dto.ts
    stripe.controller.ts
    stripe.service.ts
    stripe.module.ts
  app.module.ts
  main.ts
prisma/schema.prisma
docs/architecture.png
.env.example
docker-compose.yml
```

---

## License
MIT — demo only, no warranty.

## Author
Konsta · Backend engineer  
🔗 [Fiverr – “Nest backend · Stripe · Postgres”](https://www.fiverr.com/konstye/build-a-nestjs-backend-with-stripe-payments-and-postgresql)
