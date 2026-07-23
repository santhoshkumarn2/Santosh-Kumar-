import os
import sys

_here = os.path.dirname(os.path.abspath(__file__))

# Configure environment variables for Vercel serverless execution
os.environ["TMPDIR"] = "/tmp"
os.environ["HOME"] = "/tmp"
os.environ["LITELLM_CONFIG_PATH"] = os.path.join(_here, "..", "config.yaml")
os.environ["DISABLE_SCHEMA_UPDATE"] = "true"
os.environ["LITELLM_LOG"] = "ERROR"

# Ensure DATABASE_URL exists to prevent Prisma initialization error on cold start
if "DATABASE_URL" not in os.environ or not os.environ["DATABASE_URL"]:
    os.environ["DATABASE_URL"] = "postgresql://user:pass@localhost:5432/db"

from litellm.proxy.proxy_server import app
