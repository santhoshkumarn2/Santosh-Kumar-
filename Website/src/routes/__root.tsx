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
          "AI agents, agent governance, LLM security, AI cost control, EU AI Act Article 14, agent interception, self-hosted AI gateway, Cloudflare for AI agents, LangGraph, CrewAI",
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
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
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
        "@type": "SoftwareApplication",
        "name": "Project Nebula",
        "alternateName": "The Cloudflare for AI Agents",
        "applicationCategory": "SecurityApplication, DeveloperApplication",
        "operatingSystem": "Linux, Docker, Kubernetes, Self-Hosted",
        "description":
          "Real-Time AI Agent Interception & Pre-Execution Cost Control. 100% Self-Hosted.",
        "url": "https://projectnebula.site",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
        },
        "featureList": [
          "Sub-5ms Real-Time Mid-Way Trajectory Interception",
          "Pre-Execution Token Cost Predictor",
          "Deterministic Policy & Compliance Enforcement (EU AI Act Article 14, HIPAA, SOC 2)",
          "Self-Updating Operational Playbooks",
          "100% Self-Hosted & Air-Gapped Deployment",
        ],
      },
      {
        "@type": "Organization",
        "name": "Project Nebula",
        "url": "https://projectnebula.site",
        "logo": "https://projectnebula.site/favicon.ico",
        "sameAs": ["https://github.com/santhoshkumarn2"],
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
