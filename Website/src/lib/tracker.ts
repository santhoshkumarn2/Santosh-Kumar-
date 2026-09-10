/**
 * Client-side funnel tracker for Project Nebula
 * Tracks:
 * 1. Page visits & arrivals (with referrer & UTM parameters)
 * 2. Slide-by-slide visibility & scroll depth via IntersectionObserver + Scroll Position Fallback
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

  // Modern fetch with keepalive is rock-solid across mobile and desktop browsers
  try {
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: data,
      keepalive: true,
    }).catch(() => {
      // Fallback to sendBeacon if fetch errors
      if (navigator.sendBeacon) {
        const blob = new Blob([data], { type: "application/json" });
        navigator.sendBeacon(endpoint, blob);
      }
    });
  } catch {
    if (navigator.sendBeacon) {
      const blob = new Blob([data], { type: "application/json" });
      navigator.sendBeacon(endpoint, blob);
    }
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

  const sectionsToTrack = [
    "hero",
    "problem",
    "solution-1",
    "solution-2",
    "solution-3",
    "solution-4",
    "solution-5",
    "competition",
    "contact",
  ];

  // 2. Slide tracking via IntersectionObserver + Scroll Fallback
  const observedSlides = new Set<string>();
  const slideEntryTimes = new Map<string, number>();

  const markSlideVisible = (slideId: string, trigger: string) => {
    const now = Date.now();
    if (!slideEntryTimes.has(slideId)) {
      slideEntryTimes.set(slideId, now);
    }
    if (!observedSlides.has(slideId)) {
      observedSlides.add(slideId);
      sendEvent({
        type: "slide_view",
        slideId,
        meta: { initialHit: true, trigger },
      });
    }
  };

  const markSlideExit = (slideId: string) => {
    const entryTime = slideEntryTimes.get(slideId);
    if (entryTime) {
      const durationSeconds = Math.round((Date.now() - entryTime) / 100) / 10;
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
  };

  // IntersectionObserver with low threshold (0.05) and negative bottom margin
  let observer: IntersectionObserver | null = null;
  if (typeof IntersectionObserver !== "undefined") {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const slideId = entry.target.id;
          if (!slideId) continue;

          if (entry.isIntersecting) {
            markSlideVisible(slideId, "intersection_observer");
          } else {
            markSlideExit(slideId);
          }
        }
      },
      {
        threshold: [0.05, 0.2],
        rootMargin: "0px 0px -5% 0px",
      }
    );
  }

  // Fallback scroll check (checks bounding rect for every slide)
  const checkScrollVisibility = () => {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    for (const id of sectionsToTrack) {
      const el = document.getElementById(id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const inView = rect.top < vh * 0.85 && rect.bottom > vh * 0.1;
      if (inView) {
        markSlideVisible(id, "scroll_position");
      }
    }
  };

  // Attach observers to all slides with aggressive retries
  const observedElements = new Set<string>();
  const attachObservers = () => {
    for (const id of sectionsToTrack) {
      if (observedElements.has(id)) continue;
      const el = document.getElementById(id);
      if (el) {
        observedElements.add(id);
        if (observer) {
          observer.observe(el);
        }
      }
    }
    checkScrollVisibility();
  };

  // Run attach immediately, and retry to catch any elements mounting after animations/render
  attachObservers();
  if (typeof requestAnimationFrame !== "undefined") {
    requestAnimationFrame(attachObservers);
  }
  setTimeout(attachObservers, 300);
  setTimeout(attachObservers, 1000);
  setTimeout(attachObservers, 2500);

  // Passive scroll & resize listener for dual-trigger fallback
  let scrollTimeout: number | null = null;
  const onScrollThrottled = () => {
    if (scrollTimeout) return;
    scrollTimeout = window.setTimeout(() => {
      scrollTimeout = null;
      checkScrollVisibility();
      if (observedElements.size < sectionsToTrack.length) {
        attachObservers();
      }
    }, 150);
  };

  window.addEventListener("scroll", onScrollThrottled, { passive: true });
  window.addEventListener("resize", onScrollThrottled, { passive: true });

  // On page visibility change / unload, record any remaining dwell times
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      for (const slideId of slideEntryTimes.keys()) {
        markSlideExit(slideId);
      }
    }
  });

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
