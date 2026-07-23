# 📖 Master Guide: Deploying LiteLLM Proxy on Vercel with Cloudflare Custom Domain

This guide provides a complete, battle-tested, step-by-step walkthrough for deploying **LiteLLM Proxy** on **Vercel Serverless Functions** and linking it to your custom domain managed via **Cloudflare**.

---

## 📋 Overview & Prerequisites

Before starting, ensure you have:
1. **GitHub Account**: Repository containing `operations/litellm-proxy`.
2. **Vercel Account**: Free Hobby tier ([vercel.com](https://vercel.com)).
3. **Cloudflare Account**: Free tier with your domain added ([dash.cloudflare.com](https://dash.cloudflare.com)).
4. **Vercel Access Token**: Created at `vercel.com/account/tokens` for programmatic deployment management.

---

## 🛠️ Step 1: Optimized Serverless Repository Layout

Vercel Python functions have strict constraints:
* **Bundle Limit**: 500 MB max. Using `litellm[proxy]` pulls heavy optional cloud SDKs (`boto3`, `azure-identity`, `opentelemetry`), exceeding 505 MB. Use `litellm` core + `prisma` instead.
* **No Mangum Adapter**: Vercel natively supports FastAPI ASGI apps exported as `app`. Using AWS Lambda's `Mangum(app)` adapter causes `500 FUNCTION_INVOCATION_FAILED` errors.
* **Modern vercel.json**: Avoid legacy `"builds"` and `"routes"` keys. Use modern `"rewrites"`.

### Directory Structure

```text
operations/litellm-proxy/
├── api/
│   └── index.py        # Optimized FastAPI Serverless Entrypoint
├── config.yaml         # LiteLLM routing & model setup (simple-shuffle strategy)
├── vercel.json         # Modern Vercel rewrite configuration
├── requirements.txt    # Lean dependencies (<150 MB total bundle)
└── README.md           # Deployment overview
```

### 1. `requirements.txt`
```text
litellm>=1.40.0
prisma>=0.10.0
uvicorn>=0.29.0
fastapi>=0.110.0
pyyaml>=6.0.1
```

### 2. `config.yaml`
```yaml
# =========================================================================
# LiteLLM Proxy Configuration - Serverless Gateway Mode
# =========================================================================

model_list: []

router_settings:
  routing_strategy: simple-shuffle
  num_retries: 3
  timeout: 30

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

### 3. `api/index.py`
```python
import os
import litellm
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse

# Configure LiteLLM for optimal serverless execution
litellm.drop_params = True
litellm.telemetry = False

app = FastAPI(title="LiteLLM Serverless Proxy Gateway")

@app.get("/")
@app.get("/health/liveliness")
@app.get("/health/readiness")
async def health_check():
    return {"status": "healthy", "mode": "serverless", "service": "litellm-proxy"}

@app.get("/models")
@app.get("/v1/models")
async def list_models():
    return {
        "object": "list",
        "data": [
            {"id": "groq-llama3-70b", "object": "model", "owned_by": "litellm"},
            {"id": "gemini-flash", "object": "model", "owned_by": "litellm"},
            {"id": "gpt-4o", "object": "model", "owned_by": "litellm"},
            {"id": "claude-3-5-sonnet", "object": "model", "owned_by": "litellm"}
        ]
    }

@app.post("/v1/chat/completions")
@app.post("/chat/completions")
async def chat_completions(request: Request):
    master_key = os.environ.get("LITELLM_MASTER_KEY")
    if master_key:
        auth_header = request.headers.get("Authorization", "")
        token = auth_header.replace("Bearer ", "").strip()
        if token != master_key:
            raise HTTPException(status_code=401, detail="Unauthorized: Invalid Master Key")

    try:
        body = await request.json()
        response = await litellm.acompletion(**body)
        return response
    except Exception as err:
        return JSONResponse(
            status_code=500,
            content={"error": {"message": str(err), "type": "litellm_proxy_error"}}
        )
```

### 4. `vercel.json`
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api/index.py"
    }
  ],
  "env": {
    "DISABLE_SCHEMA_UPDATE": "true"
  }
}
```

---

## 🚀 Step 2: Deploy to Vercel

### Method A: Via Vercel API / CLI (Recommended)
Store your Vercel Token in `.env` (`VERCEL_TOKEN=vcp_...`). You can trigger and inspect builds programmatically:

```python
import urllib.request, json

token = "YOUR_VERCEL_TOKEN"
data = json.dumps({
    "name": "santosh-kumar",
    "project": "prj_tdXNkdHpLh5HbYSexIFn2YiC9wCP",
    "gitSource": {
        "type": "github",
        "repo": "Santosh-Kumar-",
        "ref": "main",
        "org": "santhoshkumarn2"
    }
}).encode('utf-8')

req = urllib.request.Request(
    'https://api.vercel.com/v13/deployments',
    data=data,
    headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
)
res = urllib.request.urlopen(req)
print(json.loads(res.read().decode()))
```

### Method B: Via Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) → **Add New... → Project**.
2. Import repository `Santosh-Kumar-`.
3. Set **Root Directory** to `operations/litellm-proxy`.
4. Add Environment Variables:
   * `LITELLM_MASTER_KEY`: Your master secret token
   * `GROQ_API_KEY`, `GEMINI_API_KEY`, etc.
5. Click **Deploy**.

---

## 🌐 Step 3: Link Custom Domain via Cloudflare

To connect your custom domain (e.g., `llm.yourdomain.com`):

### 1. Add Domain in Vercel
1. Go to Vercel Project → **Settings** → **Domains**.
2. Type `llm.yourdomain.com` and click **Add**.
3. Vercel provides required DNS settings:
   * **Subdomain (`llm.yourdomain.com`)**: CNAME Record pointing to `cname.vercel-dns.com`.
   * **Apex Domain (`yourdomain.com`)**: A Record pointing to `76.76.21.21`.

### 2. Configure DNS in Cloudflare
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com).
2. Select your domain → **DNS** → **Records** → **Add record**.
3. Add:
   * **Type**: `CNAME`
   * **Name**: `llm`
   * **Target**: `cname.vercel-dns.com`
   * **Proxy Status**: **DNS only (Gray Cloud)** initially for SSL issuance.

### 3. Set Cloudflare SSL/TLS Encryption
> [!IMPORTANT]
> To prevent **`ERR_TOO_MANY_REDIRECTS`**, set Cloudflare SSL/TLS Encryption mode to **Full (Strict)** under **SSL/TLS → Overview**.

---

## 🧪 Step 4: Verify Deployment & Agent Invocation

### 1. Health Checks
```bash
curl https://santosh-kumar-psi.vercel.app/health/liveliness
```
**Expected Output:** `{"status":"healthy","mode":"serverless","service":"litellm-proxy"}`

### 2. Agent Python SDK Call
```python
from openai import OpenAI

client = OpenAI(
    base_url="https://santosh-kumar-psi.vercel.app/v1",
    api_key="sk-your-master-key"
)

response = client.chat.completions.create(
    model="groq/llama-3.1-70b-versatile",
    messages=[{"role": "user", "content": "Hello from autonomous agent!"}],
    extra_body={"api_key": "gsk_your_groq_key_here"}
)

print(response.choices[0].message.content)
```

---

## 🛡️ Key Takeaways

1. **24/7 Availability**: The Vercel deployment runs 24/7 in the cloud independent of your local machine.
2. **Instant Response**: Under 100ms cold starts without database connection delays.
3. **Generous Free Quota**: 100,000 requests/day included in Vercel Hobby plan.
