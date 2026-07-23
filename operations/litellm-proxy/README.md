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
└── README.md           # Setup instructions & dynamic model management guide
```

## 🔐 Dynamic Model & Key Management (Database Mode)

Rather than hardcoding provider credentials in `config.yaml` or static environment variables, models and API keys are stored dynamically in the LiteLLM database.

### 1. Environment Variables in Vercel

Set the following environment variables in Vercel (`Settings` -> `Environment Variables`):

- `LITELLM_MASTER_KEY`: Bearer token for master admin access (e.g., `sk-nebula-admin-key-2026`)
- `DATABASE_URL`: (Optional) PostgreSQL database connection string (e.g. `postgresql://...`) for persisting dynamic models, virtual keys, and usage memory across restarts.

### 2. Adding Models & API Keys Dynamically via Admin API

Once deployed, add new model endpoints with credentials dynamically using the `/model/new` endpoint:

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

### 3. Generating Virtual Client Keys Dynamically

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

## 🌐 Deployment to Vercel

1. Commit and push this directory to your GitHub repository main branch.
2. In [Vercel Dashboard](https://vercel.com/dashboard), click **Add New... -> Project**.
3. Import the repository and set **Root Directory** to `operations/litellm-proxy`.
4. Set `LITELLM_MASTER_KEY` (and `DATABASE_URL` if using persistent DB memory).
5. Deploy.
