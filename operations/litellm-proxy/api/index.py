import os
import sys

_here = os.path.dirname(os.path.abspath(__file__))

# Critical environment overrides for Vercel serverless read-only environment
os.environ["TMPDIR"] = "/tmp"
os.environ["HOME"] = "/tmp"
os.environ["PRISMA_BINARY_CACHE_DIR"] = "/tmp/prisma-python"
os.environ["LITELLM_CONFIG_PATH"] = os.path.join(_here, "..", "config.yaml")
os.environ["DISABLE_SCHEMA_UPDATE"] = "true"
os.environ["LITELLM_LOG"] = "ERROR"

# Ensure DATABASE_URL exists so Prisma client initialization doesn't throw uncaught error
if "DATABASE_URL" not in os.environ or not os.environ["DATABASE_URL"]:
    os.environ["DATABASE_URL"] = "postgresql://user:pass@localhost:5432/db"

from litellm.proxy.proxy_server import app
