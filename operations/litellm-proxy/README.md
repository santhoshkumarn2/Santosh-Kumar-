# 🚀 LiteLLM Proxy - Serverless Vercel Deployment

This directory contains the serverless deployment setup for LiteLLM Proxy, configured to route across free-tier model providers (Groq and Google AI Studio) with **multi-key load balancing** and automatic rate-limit failover.

## 📁 Repository Structure

```
operations/litellm-proxy/
├── api/
│   └── index.py        # Mangum ASGI adapter for LiteLLM serverless execution
├── config.yaml         # Free-tier model routing with multi-key load balancing
├── vercel.json         # Vercel serverless build and route rewrite configuration
├── requirements.txt    # litellm[proxy], mangum, uvicorn, fastapi, pyyaml
└── README.md           # Setup instructions & environment variable guide
```

## 🔑 Multi-Key Environment Variables

When you have multiple API keys from a provider (e.g. 2+ Groq keys or 2+ Gemini keys), LiteLLM automatically load-balances requests across them and fails over if a key hits rate limits (HTTP 429).

Set the following variables in Vercel (`Settings` -> `Environment Variables`):

- **Groq Keys**:
  - `GROQ_API_KEY_1`: First Groq API key (`gsk_...`)
  - `GROQ_API_KEY_2`: Second Groq API key (`gsk_...`)
- **Gemini Keys**:
  - `GEMINI_API_KEY_1`: First Google AI Studio API key (`AIzaSy...`)
  - `GEMINI_API_KEY_2`: Second Google AI Studio API key (`AIzaSy...`)
- **Admin Authentication**:
  - `LITELLM_MASTER_KEY`: Secret bearer token for agent auth (e.g. `sk-nebula-admin-key-2026`)

> 💡 **Note**: You can add `GROQ_API_KEY_3`, `GEMINI_API_KEY_3`, etc. simply by adding corresponding entries in `config.yaml` with the same `model_name`.

## 🛠️ Local Validation

To validate `config.yaml` syntax locally:

```bash
python -c "import yaml; yaml.safe_load(open('config.yaml'))"
```

## 🌐 Deployment to Vercel

1. Commit and push this directory to your GitHub repository main branch.
2. In [Vercel Dashboard](https://vercel.com/dashboard), click **Add New... -> Project**.
3. Import the repository and set **Root Directory** to `operations/litellm-proxy`.
4. Configure environment variables (`GROQ_API_KEY_1`, `GROQ_API_KEY_2`, `GEMINI_API_KEY_1`, `GEMINI_API_KEY_2`, `LITELLM_MASTER_KEY`).
5. Deploy.

## 🧪 Verification

Verify health check:
```bash
curl https://<your-project>.vercel.app/health/liveliness
```

Test completion:
```bash
curl -X POST https://<your-project>.vercel.app/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-nebula-admin-key-2026" \
  -d '{
    "model": "groq-gemma2-9b",
    "messages": [
      {"role": "user", "content": "Hello"}
    ]
  }'
```
