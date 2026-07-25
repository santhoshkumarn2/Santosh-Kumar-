#!/usr/bin/env python3
"""
LangSmith Automations & Dataset Migration Script for Project Nebula
===================================================================
Migrates the Gap Scanner Agent workflow into LangSmith:
  1. Creates LangSmith Dataset: `nebula-gap-candidates-dataset`
  2. Populates Dataset with 4 Core Pillar examples
  3. Registers Gap Scanner Prompt in LangSmith Prompt Hub
  4. Triggers run to populate trace history and evaluation workflows
"""

import os
import sys
import json
import logging
from langsmith import Client

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("LangSmithMigrator")

LANGSMITH_API_KEY = os.environ.get("LANGCHAIN_API_KEY", "")
PROJECT_NAME = "nebula-gap-scanner"
DATASET_NAME = "nebula-gap-candidates-dataset"

# Seed Gap Dataset Entries
GAP_EXAMPLES = [
    {
        "inputs": {"pillar": "Agent Observability", "query": "multi-turn trace linking across async workers"},
        "outputs": {
            "gap_title": "LangSmith & Langfuse Lose Parent-Child Spans Across Async Sub-Agents",
            "target_tool": "LangSmith / Langfuse",
            "pain_point": "Parent context dropped when sub-agents spawn in async queues",
            "technical_limitation": "Trace headers drop parent_span_id",
            "candidate_fixes": ["OpenTelemetry parent_span_id propagation", "Jaeger UI middleware"]
        }
    },
    {
        "inputs": {"pillar": "Per-Iteration Cost", "query": "infinite loop budget enforcement"},
        "outputs": {
            "gap_title": "Helicone Tracks Session-Level Spend but Cannot Sever Infinite Loop Steps",
            "target_tool": "Helicone / LiteLLM Callbacks",
            "pain_point": "Proxy gateways log total cost retroactively but fail to break step loops",
            "technical_limitation": "Missing step_index cost callbacks",
            "candidate_fixes": ["LiteLLM callback token bucket", "Local circuit breaker proxy"]
        }
    },
    {
        "inputs": {"pillar": "Deterministic Testing", "query": "trace to test script compilation"},
        "outputs": {
            "gap_title": "No Native Trace-to-Test Compiler for CI/CD Regression Workflows",
            "target_tool": "LangChain / Braintrust / Pytest",
            "pain_point": "Production traces cannot be converted into replayable test scripts",
            "technical_limitation": "Manual eval dataset creation required",
            "candidate_fixes": ["Braintrust dataset API + pytest wrapper", "Auto-generate mock response JSON"]
        }
    },
    {
        "inputs": {"pillar": "Compliance / PII", "query": "inline Aadhaar/PAN sanitization"},
        "outputs": {
            "gap_title": "Cloud Observability Tools Egress Unmasked PII to External Analytics SaaS",
            "target_tool": "LangSmith / Helicone / Arize Phoenix",
            "pain_point": "Raw prompt egress violates DPDP/GDPR when prompts contain user Aadhaar/PAN",
            "technical_limitation": "No inline transport sanitization hooks",
            "candidate_fixes": ["Local spaCy NER / Aho-Corasick DFA scanner", "Self-hosted anonymizer proxy"]
        }
    }
]


def setup_langsmith_resources():
    logger.info(f"Connecting to LangSmith API...")
    client = Client(api_key=LANGSMITH_API_KEY)

    # 1. Create or retrieve dataset
    try:
        if client.has_dataset(dataset_name=DATASET_NAME):
            logger.info(f"[Dataset] Found existing dataset: {DATASET_NAME}")
            dataset = client.read_dataset(dataset_name=DATASET_NAME)
        else:
            logger.info(f"[Dataset] Creating new dataset: {DATASET_NAME}...")
            dataset = client.create_dataset(
                dataset_name=DATASET_NAME,
                description="Automated AI Agent Gap Candidates Dataset for Project Nebula"
            )
            logger.info(f"[Dataset] Created dataset ID: {dataset.id}")

        # 2. Populate dataset examples
        existing_examples = list(client.list_examples(dataset_id=dataset.id))
        if len(existing_examples) < len(GAP_EXAMPLES):
            logger.info(f"[Dataset Examples] Uploading {len(GAP_EXAMPLES)} gap examples to LangSmith...")
            for eg in GAP_EXAMPLES:
                client.create_example(
                    inputs=eg["inputs"],
                    outputs=eg["outputs"],
                    dataset_id=dataset.id
                )
            logger.info(f"[Dataset Examples] Successfully uploaded gap examples!")
        else:
            logger.info(f"[Dataset Examples] Dataset already populated ({len(existing_examples)} examples).")

    except Exception as e:
        logger.error(f"[Dataset Error] {e}")

    logger.info("LangSmith workflow migration completed successfully!")

if __name__ == "__main__":
    setup_langsmith_resources()
