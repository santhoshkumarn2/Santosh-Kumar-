export type FunnelStage = {
  stageId: number;
  name: string;
  count: number;
  conversionFromPrevious: number;
  dropOffRate: number;
  badge: string;
};

export type SlideRetention = {
  slideId: string;
  title: string;
  retainedCount: number;
  botRetainedCount: number;
  dropPercent: number;
  avgTimeSeconds: number;
};

export type UnifiedStage = {
  stageId: number;
  name: string;
  badge: string;
  human: number;
  bot: number;
};

export type HumanChannel = {
  source: string;
  dubClicks: number;
  visits: number;
  scrolled: number;
  reachedLastSlide: number;
  ctaClicks: number;
  submissions: number;
  qualityScore: "High" | "Medium" | "Low";
};

export type BotChannel = {
  source: string;
  agents: string;
  requests: number;
  rendered: number;
  reachedLastSlide: number;
  ctaTouches: number;
  formProbes: number;
};

export type FunnelData = {
  summary: {
    totalPageVisits: number;
    totalPageViews: number;
    viewsPerVisitRatio: number;
    inboundDubClicks: number;
    totalConversions: number;
    overallConversionRate: number;
    lastUpdated?: string;
  };
  unifiedFunnel: UnifiedStage[];
  humanChannels: HumanChannel[];
  botChannels: BotChannel[];
  funnelStages: FunnelStage[];
  slideRetention: SlideRetention[];
  dropOffDiagnostics: {
    byDevice: {
      device: string;
      arrivals: number;
      deepReads: number;
      conversions: number;
      conversionRate: number;
    }[];
    byReferrer: {
      source: string;
      clicks: number;
      visits: number;
      conversions: number;
      qualityScore: "High" | "Medium" | "Low";
    }[];
    byTopCountries: {
      country: string;
      visits: number;
      ctaClicks: number;
      conversions: number;
    }[];
  };
  botIntelligence: {
    totalHumanRequests: number;
    totalBotRequests: number;
    botSharePercentage: number;
    botFunnel: {
      crawledSite: number;
      interactedCTA: number;
      attemptedSubmission: number;
    };
    crawlerCategories: { category: string; count: number }[];
  };
  socialOutbound: {
    platform: string;
    handle: string;
    clicks: number;
    newFollows: number;
    returnVisits: number;
  }[];
  dubLinks: {
    linkId: string;
    shortUrl: string;
    targetUrl: string;
    totalClicks: number;
    lastClicked: string;
  }[];
};

export const funnelData: FunnelData = {
  "summary": {
    "totalPageVisits": 30,
    "totalPageViews": 191,
    "viewsPerVisitRatio": 6.37,
    "inboundDubClicks": 87,
    "totalConversions": 0,
    "overallConversionRate": 0,
    "lastUpdated": "2026-09-08T06:42:35.686Z"
  },
  "unifiedFunnel": [
    {
      "stageId": 1,
      "name": "Arrived on site",
      "badge": "Real browser visits (Cloudflare RUM & Neon)",
      "human": 30,
      "bot": 271
    },
    {
      "stageId": 2,
      "name": "Scrolled past hero",
      "badge": "Scrolled past hero into #problem",
      "human": 2,
      "bot": 0
    },
    {
      "stageId": 3,
      "name": "Reached last slide",
      "badge": "Hit #contact (Tracker)",
      "human": 0,
      "bot": 0
    },
    {
      "stageId": 4,
      "name": "Clicked Early Access",
      "badge": "Dub /form clicks",
      "human": 9,
      "bot": 0
    },
    {
      "stageId": 5,
      "name": "Submitted Google Form",
      "badge": "Google Sheet verified",
      "human": 0,
      "bot": 0
    }
  ],
  "humanChannels": [
    {
      "source": "Google (Organic Search)",
      "dubClicks": 0,
      "visits": 1,
      "scrolled": 0,
      "reachedLastSlide": 0,
      "ctaClicks": 0,
      "submissions": 0,
      "qualityScore": "High"
    },
    {
      "source": "LinkedIn",
      "dubClicks": 2,
      "visits": 2,
      "scrolled": 0,
      "reachedLastSlide": 0,
      "ctaClicks": 0,
      "submissions": 0,
      "qualityScore": "High"
    },
    {
      "source": "Direct / Organic",
      "dubClicks": 75,
      "visits": 27,
      "scrolled": 2,
      "reachedLastSlide": 0,
      "ctaClicks": 9,
      "submissions": 0,
      "qualityScore": "High"
    },
    {
      "source": "Hacker News",
      "dubClicks": 0,
      "visits": 0,
      "scrolled": 0,
      "reachedLastSlide": 0,
      "ctaClicks": 0,
      "submissions": 0,
      "qualityScore": "Low"
    },
    {
      "source": "Reddit",
      "dubClicks": 0,
      "visits": 0,
      "scrolled": 0,
      "reachedLastSlide": 0,
      "ctaClicks": 0,
      "submissions": 0,
      "qualityScore": "Low"
    }
  ],
  "botChannels": [
    {
      "source": "AI model crawlers",
      "agents": "ClaudeBot (14), Applebot (6), GPTBot (1)",
      "requests": 21,
      "rendered": 19,
      "reachedLastSlide": 0,
      "ctaTouches": 0,
      "formProbes": 0
    },
    {
      "source": "Security & API Scanners",
      "agents": "authorized-ai-gateway-fingerprint/1.0 (HK endpoint fuzzing)",
      "requests": 250,
      "rendered": 0,
      "reachedLastSlide": 0,
      "ctaTouches": 0,
      "formProbes": 0
    }
  ],
  "funnelStages": [
    {
      "stageId": 1,
      "name": "Arrivals",
      "count": 30,
      "conversionFromPrevious": 100,
      "dropOffRate": 0,
      "badge": "Verified visits (Cloudflare RUM & Neon)"
    },
    {
      "stageId": 2,
      "name": "Engaged Readers",
      "count": 2,
      "conversionFromPrevious": 6.67,
      "dropOffRate": 93.33,
      "badge": "Scrolled past hero into #problem (Verified on-site)"
    },
    {
      "stageId": 3,
      "name": "Deep Reads",
      "count": 0,
      "conversionFromPrevious": 0,
      "dropOffRate": 100,
      "badge": "Awaiting deeper reads"
    },
    {
      "stageId": 4,
      "name": "Intent (CTA Click)",
      "count": 9,
      "conversionFromPrevious": 30,
      "dropOffRate": 70,
      "badge": "Clicked Early Access (Dub links)"
    },
    {
      "stageId": 5,
      "name": "Converted",
      "count": 0,
      "conversionFromPrevious": 0,
      "dropOffRate": 100,
      "badge": "Google Form responses (0 in Sheet)"
    }
  ],
  "slideRetention": [
    {
      "slideId": "hero",
      "title": "Hero / Globe",
      "retainedCount": 30,
      "botRetainedCount": 0,
      "dropPercent": 0,
      "avgTimeSeconds": 0
    },
    {
      "slideId": "problem",
      "title": "The Problem",
      "retainedCount": 3,
      "botRetainedCount": 0,
      "dropPercent": 90,
      "avgTimeSeconds": 4
    },
    {
      "slideId": "solution-1",
      "title": "Trajectory Interception",
      "retainedCount": 0,
      "botRetainedCount": 0,
      "dropPercent": 100,
      "avgTimeSeconds": 0
    },
    {
      "slideId": "solution-2",
      "title": "Cost Predictor",
      "retainedCount": 0,
      "botRetainedCount": 0,
      "dropPercent": 100,
      "avgTimeSeconds": 0
    },
    {
      "slideId": "solution-3",
      "title": "Policy Layer",
      "retainedCount": 0,
      "botRetainedCount": 0,
      "dropPercent": 100,
      "avgTimeSeconds": 0
    },
    {
      "slideId": "solution-4",
      "title": "Self-Updating Playbooks",
      "retainedCount": 0,
      "botRetainedCount": 0,
      "dropPercent": 100,
      "avgTimeSeconds": 0
    },
    {
      "slideId": "solution-5",
      "title": "100% Self-Hosted",
      "retainedCount": 0,
      "botRetainedCount": 0,
      "dropPercent": 100,
      "avgTimeSeconds": 0
    },
    {
      "slideId": "competition",
      "title": "Comparison Matrix",
      "retainedCount": 0,
      "botRetainedCount": 0,
      "dropPercent": 100,
      "avgTimeSeconds": 0
    },
    {
      "slideId": "contact",
      "title": "Early Access Boarding",
      "retainedCount": 0,
      "botRetainedCount": 0,
      "dropPercent": 100,
      "avgTimeSeconds": 0
    }
  ],
  "dropOffDiagnostics": {
    "byDevice": [
      {
        "device": "Desktop",
        "arrivals": 23,
        "deepReads": 1,
        "conversions": 0,
        "conversionRate": 0
      },
      {
        "device": "Mobile",
        "arrivals": 0,
        "deepReads": 1,
        "conversions": 0,
        "conversionRate": 0
      },
      {
        "device": "Tablet",
        "arrivals": 0,
        "deepReads": 0,
        "conversions": 0,
        "conversionRate": 0
      }
    ],
    "byReferrer": [
      {
        "source": "Direct / Organic",
        "clicks": 75,
        "visits": 27,
        "conversions": 0,
        "qualityScore": "High"
      },
      {
        "source": "Google (Organic Search)",
        "clicks": 0,
        "visits": 1,
        "conversions": 0,
        "qualityScore": "High"
      },
      {
        "source": "LinkedIn",
        "clicks": 2,
        "visits": 2,
        "conversions": 0,
        "qualityScore": "High"
      }
    ],
    "byTopCountries": [
      {
        "country": "IN",
        "visits": 11,
        "ctaClicks": 0,
        "conversions": 0
      },
      {
        "country": "US",
        "visits": 8,
        "ctaClicks": 0,
        "conversions": 0
      },
      {
        "country": "CA",
        "visits": 4,
        "ctaClicks": 0,
        "conversions": 0
      },
      {
        "country": "CN",
        "visits": 2,
        "ctaClicks": 0,
        "conversions": 0
      }
    ]
  },
  "botIntelligence": {
    "totalHumanRequests": 191,
    "totalBotRequests": 271,
    "botSharePercentage": 58.66,
    "botFunnel": {
      "crawledSite": 271,
      "interactedCTA": 0,
      "attemptedSubmission": 0
    },
    "crawlerCategories": [
      {
        "category": "Security & Gateway Probers (HK Scanner)",
        "count": 250
      },
      {
        "category": "AI Model Crawlers (ClaudeBot, Applebot, GPTBot)",
        "count": 21
      }
    ]
  },
  "socialOutbound": [
    {
      "platform": "LinkedIn page",
      "handle": "@santhoshkumar-project-nebula",
      "clicks": 1,
      "newFollows": 0,
      "returnVisits": 0
    },
    {
      "platform": "X / Twitter",
      "handle": "@projectnebula",
      "clicks": 0,
      "newFollows": 0,
      "returnVisits": 0
    },
    {
      "platform": "GitHub",
      "handle": "santhoshkumarn2/Santosh-Kumar-",
      "clicks": 0,
      "newFollows": 0,
      "returnVisits": 0
    },
    {
      "platform": "Discord community",
      "handle": "/invite/nebula",
      "clicks": 0,
      "newFollows": 0,
      "returnVisits": 0
    },
    {
      "platform": "YouTube / demos",
      "handle": "@projectnebula",
      "clicks": 0,
      "newFollows": 0,
      "returnVisits": 0
    }
  ],
  "dubLinks": [
    {
      "linkId": "link_root",
      "shortUrl": "go.projectnebula.site",
      "targetUrl": "https://projectnebula.site",
      "totalClicks": 75,
      "lastClicked": "2026-09-08T06:42:35.000Z"
    },
    {
      "linkId": "link_form",
      "shortUrl": "go.projectnebula.site/form",
      "targetUrl": "https://forms.gle/t9tLSXnVH7DNL4oW6",
      "totalClicks": 6,
      "lastClicked": "2026-09-08T05:45:00.000Z"
    },
    {
      "linkId": "link_llm_form",
      "shortUrl": "go.projectnebula.site/llm-form",
      "targetUrl": "https://forms.gle/d2MUiXcBHrLvP9JR8",
      "totalClicks": 3,
      "lastClicked": "2026-09-08T04:15:00.000Z"
    },
    {
      "linkId": "link_li",
      "shortUrl": "go.projectnebula.site/li",
      "targetUrl": "https://projectnebula.site/?utm_source=linkedin&utm_medium=social&utm_campaign=post2",
      "totalClicks": 2,
      "lastClicked": "2026-09-07T18:40:00.000Z"
    },
    {
      "linkId": "link_linkedin",
      "shortUrl": "go.projectnebula.site/linkedin",
      "targetUrl": "https://www.linkedin.com/in/santhoshkumar-project-nebula",
      "totalClicks": 1,
      "lastClicked": "2026-09-07T16:00:00.000Z"
    },
    {
      "linkId": "link_hn",
      "shortUrl": "go.projectnebula.site/hn",
      "targetUrl": "https://projectnebula.site/?utm_source=hackernews",
      "totalClicks": 0,
      "lastClicked": "2026-09-06T10:00:00.000Z"
    },
    {
      "linkId": "link_reddit",
      "shortUrl": "go.projectnebula.site/reddit",
      "targetUrl": "https://projectnebula.site/?utm_source=reddit",
      "totalClicks": 0,
      "lastClicked": "2026-09-06T10:00:00.000Z"
    }
  ]
};
