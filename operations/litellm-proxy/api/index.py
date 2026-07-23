import os
import traceback

# Set up env vars before import
_here = os.path.dirname(os.path.abspath(__file__))
os.environ.setdefault("LITELLM_CONFIG_PATH", os.path.join(_here, "..", "config.yaml"))
os.environ.setdefault("DISABLE_SCHEMA_UPDATE", "true")
os.environ.setdefault("LITELLM_LOG", "ERROR")

_startup_error = None
_startup_tb = None

try:
    from litellm.proxy.proxy_server import app
except Exception as e:
    _startup_error = str(e)
    _startup_tb = traceback.format_exc()
    # Fallback: create a minimal app that exposes the crash reason
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse

    app = FastAPI()

    @app.get("/{path:path}")
    @app.post("/{path:path}")
    async def catch_all(path: str = ""):
        return JSONResponse(
            status_code=500,
            content={
                "startup_error": _startup_error,
                "traceback": _startup_tb,
                "config_path": os.environ.get("LITELLM_CONFIG_PATH"),
                "config_exists": os.path.exists(os.environ.get("LITELLM_CONFIG_PATH", "")),
            }
        )
