import os
from litellm.proxy.proxy_server import app
from mangum import Mangum

# Mangum adapts FastAPI/ASGI apps for Vercel Serverless Functions
handler = Mangum(app)
