# 🚀 LiteLLM Proxy - Serverless Vercel Deployment (Dynamic DB Mode)

This repository contains the serverless deployment setup for LiteLLM Proxy configured for **dynamic database-backed model and key management**.

## 📁 Repository Structure

```
operations/litellm-proxy/
├── api/
│   └── index.py        # Mangum ASGI adapter for LiteLLM serverless execution
├── config.yaml         # Clean config for dynamic DB model routing & admin auth
├── vercel.json         # Vercel serverless build and route rewrite configuration
├── requirements.txt    # litellm[proxy], mangum, uvicorn, fastapi, pyyaml
└── README.md           # Setup instructions & database integration guide
```

## 🗄️ Database Hosting Options for LiteLLM Memory

LiteLLM Proxy uses a PostgreSQL database to store dynamic models, API keys, user virtual keys, and usage tracking. You have two main options:

### Option A: Vercel Postgres (Recommended - Built into Vercel)
1. Go to your Vercel Project → **Storage** tab.
2. Click **Create Database** → Select **Postgres (powered by Neon)**.
3. Select the Free Hobby Tier and click **Create**.
4. Vercel will automatically inject the `DATABASE_URL` environment variable into your deployment!

### Option B: Supabase or Neon (Free Tier)
1. Create a free PostgreSQL instance on [Supabase](https://supabase.com) or [Neon](https://neon.tech).
2. Copy the connection string (e.g. `postgresql://postgres:...@db.xxx.supabase.co:5432/postgres`).
3. Add `DATABASE_URL` to Vercel Project → **Settings** → **Environment Variables**.

---

## 🔐 Dynamic Model & Key Management

Set the following environment variables in Vercel (`Settings` -> `Environment Variables`):

- `LITELLM_MASTER_KEY`: Bearer token for master admin access (e.g., `sk-nebula-admin-key-2026`)
- `DATABASE_URL`: PostgreSQL connection string from Vercel Postgres, Supabase, or Neon.

### Adding Models & API Keys Dynamically via Admin API

Once deployed with a connected database, add model endpoints with credentials dynamically using `/model/new`:

```bash
curl -X POST https://<your-project>.vercel.app/model/new \
  -H "Authorization: Bearer sk-nebula-admin-key-2026" \
  -H "Content-Type: application/json" \
  -d '{
    "model_name": "groq-llama3-70b",
    "litellm_params": {
      "model": "groq/llama-3.1-70b-versatile",
      "api_key": "gsk_..."
    }
  }'
```

### Generating Virtual Client Keys

Generate scoped API keys for agents or subservices using `/key/generate`:

```bash
curl -X POST https://<your-project>.vercel.app/key/generate \
  -H "Authorization: Bearer sk-nebula-admin-key-2026" \
  -H "Content-Type: application/json" \
  -d '{
    "models": ["groq-llama3-70b", "gemini-flash"],
    "duration": "30d"
  }'
```

## 🛠️ Local Validation

To validate `config.yaml` syntax locally:

```bash
python -c "import yaml; yaml.safe_load(open('config.yaml'))"
```
