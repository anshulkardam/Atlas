# Atlas

Atlas enriches people and companies using async research agents and observable pipelines.

## 🔧 Installation

1. Clone the repository:

```bash
git clone https://github.com/anshulkardam/Atlas.git
```

2. Navigate to the project directory:

```bash
cd awesome-project
```

3. Install dependencies:

```bash
npm install
# or
pnpm install
```

## 🚀 Usage

```bash
npm run dev
# or
pnpm dev
```
## Architecture Overview

API Gateway – Auth, routing, rate limiting

Campaign Service – Owns database (Postgres + Prisma)

Research Service – AI agent + search + circuit breaker

WebSocket Service – Real-time progress streaming

Redis – BullMQ queue + pub/sub + circuit breaker state

Gemini AI – Structured extraction

Firecrawl API – Search + scrape

## End-to-End Flow

User clicks Enrich

POST /api/people/:id/enrich

Research service enqueues BullMQ job

Agent runs up to 5 iterations:

Plan query

Search (with cache + circuit breaker)

Scrape

Extract structured JSON

Persist search logs

Publish progress

On completion:

Persist context_snippets

Update person status

Emit final progress

Frontend listens via WebSocket and updates modal in real-time


| Key                                       | Description                                   |
| ----------------------------------------- | --------------------------------------------- |
| `circuit_breaker:search_api:state`        | Current state (`CLOSED`, `OPEN`, `HALF_OPEN`) |
| `circuit_breaker:search_api:failures`     | Failure counter                               |
| `circuit_breaker:search_api:successes`    | Success counter (HALF_OPEN mode)              |
| `circuit_breaker:search_api:last_failure` | Timestamp of last failure                     |


## 📋 API Endpoints


| Method | Endpoint             | Service  | Description       |
| ------ | -------------------- | -------- | ----------------- |
| POST   | `/api/auth/login`    | Campaign | User login        |
| POST   | `/api/auth/register` | Campaign | User registration |

| Method | Endpoint             | Service  | Description         |
| ------ | -------------------- | -------- | ------------------- |
| GET    | `/api/campaigns`     | Campaign | Get campaigns       |
| GET    | `/api/companies/:id` | Campaign | Get company details |
| GET    | `/api/people`        | Campaign | Get people list     |
| GET    | `/api/people/:id`    | Campaign | Get person details  |

| Method | Endpoint                   | Service  | Description            |
| ------ | -------------------------- | -------- | ---------------------- |
| POST   | `/api/people/:id/enrich`   | Research | Trigger enrichment job |
| GET    | `/api/jobs/:job_id/status` | Research | Get job status         |

| Method | Endpoint                   | Service  | Description          |
| ------ | -------------------------- | -------- | -------------------- |
| GET    | `/api/snippets/person/:id` | Campaign | Get context snippets |


## 🔧 Configuration

Environment variables:

```env
check .env.example files for each service
```

