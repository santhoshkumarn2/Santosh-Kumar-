import os

# Tell litellm proxy where the config file lives (relative to this file)
_here = os.path.dirname(os.path.abspath(__file__))
os.environ.setdefault("LITELLM_CONFIG_PATH", os.path.join(_here, "..", "config.yaml"))

# Prevent Prisma from running schema migrations on cold-start
os.environ.setdefault("DISABLE_SCHEMA_UPDATE", "true")

# Prevent litellm from printing noisy startup banners in serverless
os.environ.setdefault("LITELLM_LOG", "ERROR")

from litellm.proxy.proxy_server import app
