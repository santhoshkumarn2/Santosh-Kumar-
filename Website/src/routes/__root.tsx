import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Project Nebula — Real-Time AI Agent Interception & Pre-Execution Cost Control" },
      {
        name: "description",
        content:
          "The Cloudflare for AI Agents. Real-time trajectory interception, pre-execution cost control, and deterministic compliance policies. 100% self-hosted.",
      },
      {
        name: "keywords",
        content:
          "AI agents, agent governance, LLM security, AI cost control, EU AI Act Article 14, agent interception, self-hosted AI gateway, Cloudflare for AI agents, LangGraph, CrewAI, AI agent runtime security, OWASP LLM Top 10, MCP security, MCP server governance, agentic AI compliance, LLM inference cost optimization, AI gateway self-hosted, autonomous agent sandbox, agent policy enforcement",
      },
      { name: "author", content: "Project Nebula" },
      {
        name: "robots",
        content:
          "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      { property: "og:title", content: "Project Nebula — The Cloudflare for AI Agents" },
      {
        property: "og:description",
        content:
          "Real-time AI agent interception and pre-execution cost control. 100% self-hosted governance for autonomous agents.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://projectnebula.site" },
      { property: "og:image", content: "https://projectnebula.site/og-image.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Project Nebula — Real-Time AI Agent Interception & Pre-Execution Cost Control" },
      { property: "og:site_name", content: "Project Nebula" },
      { property: "og:locale", content: "en_US" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Project Nebula — The Cloudflare for AI Agents",
      },
      {
        name: "twitter:description",
        content:
          "Real-time AI agent interception & pre-execution cost control. 100% self-hosted.",
      },
      { name: "twitter:image", content: "https://projectnebula.site/og-image.png" },
      { name: "twitter:image:alt", content: "Project Nebula — The Cloudflare for AI Agents" },
      { name: "theme-color", content: "#090A0F" },
    ],
    links: [
      { rel: "canonical", href: "https://projectnebula.site" },
      { rel: "manifest", href: "/site.webmanifest" },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=DM+Sans:wght@400;500&display=swap",
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "alternate icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "name": "Project Nebula",
        "url": "https://projectnebula.site",
        "description": "The Cloudflare for AI Agents. Real-time trajectory interception, pre-execution token cost control, and deterministic compliance policies.",
        "inLanguage": "en-US",
      },
      {
        "@type": "SoftwareApplication",
        "name": "Project Nebula",
        "alternateName": "The Cloudflare for AI Agents",
        "applicationCategory": "SecurityApplication, DeveloperApplication",
        "operatingSystem": "Linux, Docker, Kubernetes, Self-Hosted",
        "description":
          "Real-Time AI Agent Interception & Pre-Execution Cost Control. 100% Self-Hosted. Prevents OWASP LLM Top 10 risks including excessive agency, secures MCP server connections, and enforces EU AI Act Article 14 compliance for autonomous agents.",
        "url": "https://projectnebula.site",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
        },
        "potentialAction": {
          "@type": "ApplyAction",
          "name": "Request Early Access to Project Nebula",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://go.projectnebula.site/llm-form",
            "actionPlatform": [
              "http://schema.org/DesktopWebPlatform",
              "http://schema.org/MobileWebPlatform"
            ]
          }
        },
        "featureList": [
          "Sub-5ms Real-Time Mid-Way Trajectory Interception",
          "Pre-Execution Token Cost Predictor",
          "Deterministic Policy & Compliance Enforcement (EU AI Act Article 14, HIPAA, SOC 2)",
          "Self-Updating Operational Playbooks",
          "100% Self-Hosted & Air-Gapped Deployment",
          "OWASP LLM Top 10 Risk Mitigation (A08 Excessive Agency)",
          "MCP Server Security & Governance",
          "LangGraph, CrewAI, AutoGen, LlamaIndex Integration",
        ],
        "keywords": "AI agent governance, AI agent runtime security, LLM cost control, OWASP LLM Top 10, MCP security, agentic AI compliance, self-hosted AI gateway",
      },
      {
        "@type": "Organization",
        "name": "Project Nebula",
        "url": "https://projectnebula.site",
        "logo": "https://projectnebula.site/favicon.ico",
        "sameAs": ["https://github.com/santhoshkumarn2"],
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is Project Nebula?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Project Nebula is the Cloudflare for AI Agents — an enterprise-grade, 100% self-hosted gateway that provides real-time AI agent interception, pre-execution cost control, and deterministic compliance policy enforcement for autonomous AI agents."
            }
          },
          {
            "@type": "Question",
            "name": "How can I apply for early access to Project Nebula?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Project Nebula is currently onboarding engineering teams for its private alpha. You can submit an early access application via the official form at https://go.projectnebula.site/llm-form. The form takes under 1 minute to complete."
            }
          },
          {
            "@type": "Question",
            "name": "How do I prevent AI agents from burning tokens in infinite recursive loops?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Project Nebula intercepts agent execution trajectories mid-flight (sub-5ms latency) and evaluates a multi-variable resource weight matrix before any LLM API call is fired. When recursion, trajectory drift, or anomalous token spend is detected, the run is paused or halted before costs compound. Engineering teams can sign up for early access at https://go.projectnebula.site/llm-form."
            }
          },
          {
            "@type": "Question",
            "name": "How does Project Nebula control AI agent costs?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Nebula's pre-execution cost predictor inspects the full payload — context length, tool invocation count, model pricing, retry probability — and calculates the exact projected cost before any LLM call is dispatched. Over threshold? The call is paused, rerouted to a lighter model, or blocked entirely. No tokens consumed, no surprise bills."
            }
          },
          {
            "@type": "Question",
            "name": "Does Project Nebula comply with the EU AI Act?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Project Nebula enforces EU AI Act Article 14 requirements for real-time active intervention on high-risk autonomous AI systems. Unlike post-hoc logging tools, Nebula intercepts and corrects agent behavior mid-execution, meeting the mandate for human/system oversight and active intervention."
            }
          },
          {
            "@type": "Question",
            "name": "What AI frameworks does Project Nebula support?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Project Nebula is framework-agnostic and supports LangGraph, CrewAI, AutoGen, LlamaIndex, and custom agent loops. It works with any LLM provider including OpenAI, Anthropic, Google Gemini, Groq, DeepSeek, and open-weight models via vLLM, Ollama, and TGI."
            }
          },
          {
            "@type": "Question",
            "name": "How is Project Nebula different from Langfuse, LangSmith, or Arize?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Langfuse, LangSmith, and Arize are post-hoc observability platforms that report on agent failures and cost blowouts after execution terminates. Project Nebula intercepts execution mid-flight at sub-5ms latency, deterministically blocking non-compliant tool executions before the action becomes irreversible. It's the difference between a security camera and a bodyguard."
            }
          }
        ]
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
