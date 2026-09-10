import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      if (url.pathname === "/api/track") {
        if (request.method === "OPTIONS") {
          return new Response(null, {
            status: 204,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "POST, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type",
            },
          });
        }
        if (request.method === "POST") {
          try {
            const body = await request.text();
            let eventPayload: Record<string, unknown> = {};
            try {
              eventPayload = JSON.parse(body);
            } catch {}

            // 1. Persist to Neon PostgreSQL Database
            const rawDbUrl =
              (env as Record<string, string>)?.DATABASE_URL ||
              process.env.DATABASE_URL ||
              "";
            const dbUrl = rawDbUrl.trim().replace(/^['"]|['"]$/g, "");

            if (dbUrl) {
              try {
                const neonHost = new URL(dbUrl.replace(/^postgresql:\/\//, "https://")).hostname;
                await fetch(`https://${neonHost}/sql`, {
                  method: "POST",
                  headers: {
                    "neon-connection-string": dbUrl,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    query: `
                      INSERT INTO funnel_events (
                        session_id, event_type, slide_id, duration_seconds,
                        referrer, utm_source, utm_medium, utm_campaign,
                        user_agent, meta
                      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
                    `,
                    params: [
                      eventPayload.sessionId || "unknown",
                      eventPayload.type || "unknown",
                      eventPayload.slideId || null,
                      eventPayload.durationSeconds || null,
                      eventPayload.referrer || request.headers.get("referer") || null,
                      eventPayload.utmSource || null,
                      eventPayload.utmMedium || null,
                      eventPayload.utmCampaign || null,
                      eventPayload.userAgent || request.headers.get("user-agent") || null,
                      eventPayload.meta ? JSON.stringify(eventPayload.meta) : null,
                    ],
                  }),
                });
              } catch (neonErr) {
                console.error("Neon tracking insert error:", neonErr);
              }
            }

            // 2. Local filesystem append for development
            try {
              const { appendFileSync, existsSync, mkdirSync } = await import("node:fs");
              const { resolve, join } = await import("node:path");
              const dataDir = resolve(process.cwd(), "../data");
              if (!existsSync(dataDir)) {
                mkdirSync(dataDir, { recursive: true });
              }
              appendFileSync(join(dataDir, "events.jsonl"), body + "\n");
            } catch {}

            return new Response(JSON.stringify({ ok: true }), {
              status: 200,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            });
          } catch (err) {
            console.error("Tracker beacon error:", err);
            return new Response(JSON.stringify({ ok: true }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }
        }
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
