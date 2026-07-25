#!/usr/bin/env python3
"""
Unit & Integration Tests for AI Agent Gap Scanner Agent (Agent 019)
===================================================================
Tests gap scanning, taxonomy classification, LangSmith tracing setup, and report generation.
"""

import os
import sys
import unittest

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ops.linkedin_gap_scanner import GapScannerAgent, NEBULA_PILLARS, SEED_GAP_DATABASE

class TestGapScannerAgent(unittest.TestCase):

    def setUp(self):
        self.scanner = GapScannerAgent(project_name="test-nebula-gap-scanner")

    def test_pillar_taxonomy_completeness(self):
        """Verifies all 4 core pillars from Doc 54 Section 1.3 are defined."""
        expected_pillars = [
            "Agent Observability",
            "Deterministic Testing",
            "Per-Iteration Cost",
            "Compliance / PII"
        ]
        for pillar in expected_pillars:
            self.assertIn(pillar, NEBULA_PILLARS)
            self.assertGreater(len(NEBULA_PILLARS[pillar]), 0)

    def test_scan_all_gaps(self):
        """Verifies scanning without filters returns all seed gaps."""
        gaps = self.scanner.scan_gaps(limit=10)
        self.assertEqual(len(gaps), len(SEED_GAP_DATABASE))

    def test_scan_filtered_by_pillar(self):
        """Verifies filtering by 'Observability' returns matching gaps only."""
        gaps = self.scanner.scan_gaps(pillar_filter="Observability", limit=5)
        self.assertGreater(len(gaps), 0)
        for g in gaps:
            self.assertIn("Observability", g["pillar"])

    def test_scan_filtered_by_cost(self):
        """Verifies filtering by 'Cost' returns cost gaps only."""
        gaps = self.scanner.scan_gaps(pillar_filter="Cost", limit=5)
        self.assertGreater(len(gaps), 0)
        for g in gaps:
            self.assertIn("Cost", g["pillar"])

    def test_synthesize_gap_classification(self):
        """Verifies raw issue synthesis auto-classifies into correct pillar."""
        raw_title = "Langfuse proxy adds 200ms latency under high token burn"
        raw_body = "We observed token budget exhaustion when sub-agent enters infinite loop step"
        source_url = "https://github.com/langfuse/langfuse/issues/999"

        gap = self.scanner.synthesize_gap_from_raw_issue(raw_title, raw_body, source_url)

        self.assertEqual(gap["pillar"], "Per-Iteration Cost")
        self.assertEqual(gap["gap_title"], raw_title)
        self.assertEqual(gap["source"], source_url)
        self.assertIn("curator_hook_idea", gap)

    def test_format_as_markdown(self):
        """Verifies markdown report generation structure."""
        gaps = self.scanner.scan_gaps(limit=2)
        md_report = self.scanner.format_as_markdown(gaps)

        self.assertIn("# 🔍 AI Agent Gap Scanner Report", md_report)
        self.assertIn("**Total Gaps Discovered:** 2", md_report)
        self.assertIn("Curator Hook Idea", md_report)

    def test_langsmith_env_setup(self):
        """Verifies LangSmith environment variables are set."""
        self.assertEqual(os.environ.get("LANGCHAIN_TRACING_V2"), "true")
        self.assertEqual(os.environ.get("LANGCHAIN_PROJECT"), "test-nebula-gap-scanner")

if __name__ == "__main__":
    unittest.main()
