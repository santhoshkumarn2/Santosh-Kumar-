import os

# Set environment variables before importing LiteLLM proxy
_here = os.path.dirname(os.path.abspath(__file__))
os.environ["TMPDIR"] = "/tmp"
os.environ["HOME"] = "/tmp"
os.environ["LITELLM_CONFIG_PATH"] = os.path.join(_here, "..", "config.yaml")
os.environ["DISABLE_SCHEMA_UPDATE"] = "true"
os.environ["LITELLM_LOG"] = "ERROR"

from litellm.proxy.proxy_server import app
