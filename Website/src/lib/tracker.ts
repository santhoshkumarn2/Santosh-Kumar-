/**
 * Client-side funnel tracker for Project Nebula
 * Tracks:
 * 1. Page visits & arrivals (with referrer & UTM parameters)
 * 2. Slide-by-slide visibility & scroll depth via IntersectionObserver
 * 3. Dwell time on each section
 * 4. CTA button clicks ("Request Early Access")
 * 5. Outbound social profile clicks (LinkedIn)
 */

interface TrackEvent {
  type: "pageview" | "slide_view" | "cta_click" | "social_click" | "form_submit";
  sessionId: string;
  slideId?: string;
  durationSeconds?: number;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  userAgent?: string;
  timestamp: string;
  meta?: Record<string, unknown>;
}

const SESSION_KEY = "nebula_session_id";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = "sess_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now().toString(36);
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function sendEvent(event: Omit<TrackEvent, "sessionId" | "timestamp" | "userAgent">) {
  if (typeof window === "undefined") return;

  const payload: TrackEvent = {
    ...event,
    sessionId: getSessionId(),
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
  };

  const data = JSON.stringify(payload);
  const endpoint = "/api/track";

  if (navigator.sendBeacon) {
    const blob = new Blob([data], { type: "application/json" });
    navigator.sendBeacon(endpoint, blob);
  } else {
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: data,
      keepalive: true,
    }).catch(() => {});
  }
}

export function initTracker() {
  if (typeof window === "undefined" || (window as unknown as { __nebula_tracker_init?: boolean }).__nebula_tracker_init) {
    return;
  }
  (window as unknown as { __nebula_tracker_init?: boolean }).__nebula_tracker_init = true;

  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get("utm_source") || undefined;
  const utmMedium = urlParams.get("utm_medium") || undefined;
  const utmCampaign = urlParams.get("utm_campaign") || undefined;
  const referrer = document.referrer || "direct";

  // 1. Initial page view
  sendEvent({
    type: "pageview",
    referrer,
    utmSource,
    utmMedium,
    utmCampaign,
  });

  // 2. Slide tracking via IntersectionObserver
  const observedSlides = new Set<string>();
  const slideEntryTimes = new Map<string, number>();

  const sectionsToTrack = [
    "problem",
    "solution-1",
    "solution-2",
    "solution-3",
    "solution-4",
    "solution-5",
    "competition",
    "contact",
  ];

  const observer = new IntersectionObserver(
    (entries) => {
      const now = Date.now();
      for (const entry of entries) {
        const slideId = entry.target.id;
        if (!slideId) continue;

        if (entry.isIntersecting) {
          slideEntryTimes.set(slideId, now);

          if (!observedSlides.has(slideId)) {
            observedSlides.add(slideId);
            sendEvent({
              type: "slide_view",
              slideId,
              meta: { initialHit: true },
            });
          }
        } else {
          const entryTime = slideEntryTimes.get(slideId);
          if (entryTime) {
            const durationSeconds = Math.round((now - entryTime) / 100) / 10;
            if (durationSeconds > 0.5) {
              sendEvent({
                type: "slide_view",
                slideId,
                durationSeconds,
                meta: { dwell: true },
              });
            }
            slideEntryTimes.delete(slideId);
          }
        }
      }
    },
    { threshold: 0.3 }
  );

  // Attach observer to all slides
  const attachObservers = () => {
    for (const id of sectionsToTrack) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
  };

  if (document.readyState === "complete") {
    attachObservers();
  } else {
    window.addEventListener("load", attachObservers);
  }

  // 3. CTA & Social clicks
  document.addEventListener("click", (e) => {
    const target = (e.target as HTMLElement).closest("a");
    if (!target) return;

    const href = target.getAttribute("href") || "";

    // CTA click (Early access form)
    if (href.includes("/form") || href.includes("forms.gle")) {
      sendEvent({
        type: "cta_click",
        slideId: "contact",
        meta: { href },
      });
    }

    // Social clicks (LinkedIn profile badge/link)
    if (href.includes("linkedin.com") || href.includes("/linkedin")) {
      sendEvent({
        type: "social_click",
        slideId: "contact",
        meta: { platform: "linkedin", href },
      });
    }
  });
}
