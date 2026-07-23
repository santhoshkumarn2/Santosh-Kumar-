import os
import sys
import traceback

# Ensure read-only filesystem environments (Vercel) use /tmp for logs and cache
os.environ["TMPDIR"] = "/tmp"
os.environ["HOME"] = "/tmp"
os.environ["LITELLM_LOG"] = "ERROR"
os.environ["DISABLE_SCHEMA_UPDATE"] = "true"

_here = os.path.dirname(os.path.abspath(__file__))
os.environ["LITELLM_CONFIG_PATH"] = os.path.join(_here, "..", "config.yaml")

try:
    from litellm.proxy.proxy_server import app
except Exception as err:
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    
    error_msg = str(err)
    tb_str = traceback.format_exc()
    
    app = FastAPI()
    
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"])
    async def catch_all_error(path: str = ""):
        return JSONResponse(
            status_code=500,
            content={
                "error": "LiteLLM Startup Exception",
                "exception": error_msg,
                "traceback": tb_str
            }
        )
