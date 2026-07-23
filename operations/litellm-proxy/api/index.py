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
