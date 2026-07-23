# 🚀 LiteLLM Proxy - Serverless Vercel Deployment

This directory contains the serverless deployment setup for LiteLLM Proxy, configured to route across free-tier model providers (Groq and Google AI Studio).

## 📁 Repository Structure

```
operations/litellm-proxy/
├── api/
│   └── index.py        # Mangum ASGI adapter for LiteLLM serverless execution
├── config.yaml         # Free-tier model routing (Gemma 9B, Llama 70B, Gemini Flash/Pro)
├── vercel.json         # Vercel serverless build and route rewrite configuration
├── requirements.txt    # litellm[proxy], mangum, uvicorn, fastapi, pyyaml
└── README.md           # Setup instructions & environment variable guide
```

## 🔑 Environment Variables

Set the following variables in your Vercel Project Settings (`Settings` -> `Environment Variables`):

- `GROQ_API_KEY_1`: Groq free-tier API key (`gsk_...`)
- `GEMINI_API_KEY_1`: Google AI Studio free-tier API key (`AIzaSy...`)
- `LITELLM_MASTER_KEY`: Bearer token for authentication (e.g. `sk-nebula-admin-key-2026`)

## 🛠️ Local Validation

To validate `config.yaml` syntax locally:

```bash
python -c "import yaml; yaml.safe_load(open('config.yaml'))"
```

## 🌐 Deployment to Vercel

1. Push this directory to your GitHub repository main branch.
2. In [Vercel Dashboard](https://vercel.com/dashboard), click **Add New... -> Project**.
3. Import the repository and set **Root Directory** to `operations/litellm-proxy`.
4. Configure environment variables (`GROQ_API_KEY_1`, `GEMINI_API_KEY_1`, `LITELLM_MASTER_KEY`).
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
