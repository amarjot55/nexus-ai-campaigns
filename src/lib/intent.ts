// Nexus AI — campaign intent engine (v1, rule-based).
// Parses a natural-language brief into a structured campaign plan and runs it
// against a synthetic audience. v2 (see PRD) swaps the parser for an LLM with
// this same output schema, so the UI and guardrails stay unchanged.

export type Channel = "WhatsApp" | "RCS" | "SMS";

export type Intent = {
  channels: Channel[];
  cities: string[];
  boughtWithinDays?: number;
  inactiveForDays?: number;
  cartAbandoners: boolean;
  minAov?: number;
  discountPct?: number;
  occasion?: string;
  requestedTime?: string;
  missing: string[];
};

type User = {
  city: string;
  lastPurchaseDays: number;
  lastActiveDays: number;
  aov: number;
  cartAbandoned: boolean;
  hasWhatsApp: boolean;
  rcsCapable: boolean;
  optedIn: boolean;
  dnd: boolean;
};

export const CITY_REGIONS: Record<string, string[]> = {
  ncr: ["Delhi", "Gurgaon", "Noida", "Faridabad"],
  "delhi ncr": ["Delhi", "Gurgaon", "Noida", "Faridabad"],
  "tier 2": ["Jaipur", "Lucknow", "Indore", "Kochi", "Chandigarh", "Ludhiana", "Amritsar"],
  "tier-2": ["Jaipur", "Lucknow", "Indore", "Kochi", "Chandigarh", "Ludhiana", "Amritsar"],
  punjab: ["Ludhiana", "Amritsar", "Mohali"],
  metro: ["Delhi", "Mumbai", "Bengaluru", "Hyderabad", "Chennai", "Kolkata"],
};

const CITY_WEIGHTS: Record<string, number> = {
  Delhi: 14, Mumbai: 13, Bengaluru: 12, Hyderabad: 8, Pune: 7, Chennai: 7, Kolkata: 6,
  Gurgaon: 6, Noida: 5, Faridabad: 3, Thane: 3, Jaipur: 4, Lucknow: 4, Indore: 3,
  Kochi: 2, Chandigarh: 3, Mohali: 2, Ludhiana: 2, Amritsar: 2,
};
export const CITIES = Object.keys(CITY_WEIGHTS);

// Per-message cost assumptions (₹), indicative Indian CPaaS rates.
export const COST: Record<Channel, number> = { WhatsApp: 0.82, RCS: 0.2, SMS: 0.14 };

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let _users: User[] | null = null;
export function audienceBase(): User[] {
  if (_users) return _users;
  const rnd = mulberry32(20261013);
  const total = Object.values(CITY_WEIGHTS).reduce((a, b) => a + b, 0);
  const pick = () => {
    let r = rnd() * total;
    for (const [c, w] of Object.entries(CITY_WEIGHTS)) {
      if ((r -= w) <= 0) return c;
    }
    return "Delhi";
  };
  _users = Array.from({ length: 60000 }, () => {
    const lastPurchaseDays = Math.floor(rnd() ** 1.6 * 365);
    return {
      city: pick(),
      lastPurchaseDays,
      lastActiveDays: Math.min(lastPurchaseDays, Math.floor(rnd() ** 1.3 * 200)),
      aov: Math.round(300 + rnd() ** 2 * 4700),
      cartAbandoned: rnd() < 0.09,
      hasWhatsApp: rnd() < 0.86,
      rcsCapable: rnd() < 0.58,
      optedIn: rnd() < 0.93,
      dnd: rnd() < 0.06,
    };
  });
  return _users;
}

const num = (s: string) => Number(s.replace(/,/g, ""));

export function parseIntent(text: string): Intent {
  const t = ` ${text.toLowerCase()} `;
  const channels: Channel[] = [];
  if (/whats\s?app|\bwa\b/.test(t)) channels.push("WhatsApp");
  if (/\brcs\b|rich (card|message)/.test(t)) channels.push("RCS");
  if (/\bsms\b|text message/.test(t)) channels.push("SMS");

  const cities = new Set<string>();
  for (const [region, list] of Object.entries(CITY_REGIONS)) {
    if (t.includes(region)) list.forEach((c) => cities.add(c));
  }
  for (const c of CITIES) {
    if (new RegExp(`\\b${c.toLowerCase()}\\b`).test(t)) cities.add(c);
  }
  if (/\bbangalore\b/.test(t)) cities.add("Bengaluru");
  if (/\bgurugram\b/.test(t)) cities.add("Gurgaon");

  const unit = (u: string) => (u.startsWith("week") ? 7 : u.startsWith("month") ? 30 : 1);
  let boughtWithinDays: number | undefined;
  const bought = t.match(/(?:purchas\w*|bought|order\w*|buyers?)[^.]*?(?:last|past|within)\s+(\d+)\s*(day|week|month)/);
  if (bought) boughtWithinDays = num(bought[1]) * unit(bought[2]);
  else if (/recent (buyers|purchasers|customers)/.test(t)) boughtWithinDays = 30;

  let inactiveForDays: number | undefined;
  const inactive = t.match(/(?:inactive|dormant|not active|lapsed|haven'?t (?:bought|purchased|visited))[^.]*?(\d+)\s*(day|week|month)/);
  if (inactive) inactiveForDays = num(inactive[1]) * unit(inactive[2]);
  else if (/\b(inactive|dormant|lapsed|win[- ]?back|reactivat)/.test(t)) inactiveForDays = 60;

  const aov = t.match(/(?:aov|order value|spent|spend)[^\d₹]*(?:above|over|>|more than)?\s*₹?\s*([\d,]+)/);
  const disc = t.match(/(\d{1,2})\s*%\s*(?:off|discount)/);
  const time = t.match(/\b(?:at|by)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm))/);
  const occasion = ["diwali", "holi", "navratri", "eid", "christmas", "new year", "raksha bandhan", "independence day", "black friday"].find((o) => t.includes(o));

  const missing: string[] = [];
  if (!channels.length) missing.push("channel");
  if (!cities.size) missing.push("location");

  return {
    channels: channels.length ? channels : ["WhatsApp", "SMS"],
    cities: [...cities],
    boughtWithinDays,
    inactiveForDays,
    cartAbandoners: /abandon|cart/.test(t),
    minAov: aov ? num(aov[1]) : undefined,
    discountPct: disc ? Number(disc[1]) : undefined,
    occasion: occasion ? occasion.replace(/\b\w/g, (c) => c.toUpperCase()) : undefined,
    requestedTime: time ? time[1].toUpperCase().replace(/\s+/g, " ") : undefined,
    missing,
  };
}

export type Plan = {
  matched: number;
  byCity: { n: string; v: number }[];
  excludedConsent: number;
  excludedDnd: number;
  routed: Record<Channel, number>;
  unreachable: number;
  cost: number;
  sendTime: string;
  quietHoursAdjusted: boolean;
  messages: { channel: Channel; text: string; checks: { label: string; ok: boolean }[] }[];
};

function to24(t: string) {
  const m = t.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/);
  if (!m) return null;
  let h = Number(m[1]) % 12;
  if (m[3] === "PM") h += 12;
  return h + Number(m[2] || 0) / 60;
}

export function planCampaign(intent: Intent): Plan {
  const users = audienceBase().filter(
    (u) =>
      (!intent.cities.length || intent.cities.includes(u.city)) &&
      (intent.boughtWithinDays === undefined || u.lastPurchaseDays <= intent.boughtWithinDays) &&
      (intent.inactiveForDays === undefined || u.lastActiveDays >= intent.inactiveForDays) &&
      (!intent.cartAbandoners || u.cartAbandoned) &&
      (intent.minAov === undefined || u.aov >= intent.minAov),
  );
  const consented = users.filter((u) => u.optedIn);
  const eligible = consented.filter((u) => !u.dnd);

  // Waterfall routing in the order the marketer listed channels (WhatsApp > RCS > SMS by default).
  const order: Channel[] = (["WhatsApp", "RCS", "SMS"] as Channel[]).filter((c) => intent.channels.includes(c));
  const routed: Record<Channel, number> = { WhatsApp: 0, RCS: 0, SMS: 0 };
  let unreachable = 0;
  for (const u of eligible) {
    const ch = order.find((c) => (c === "WhatsApp" ? u.hasWhatsApp : c === "RCS" ? u.rcsCapable : true));
    if (ch) routed[ch]++;
    else unreachable++;
  }

  const counts: Record<string, number> = {};
  users.forEach((u) => (counts[u.city] = (counts[u.city] || 0) + 1));
  const byCity = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([n, v]) => ({ n, v }));

  // TRAI promotional window: 10 AM – 9 PM. Default to the 6:30 PM engagement peak.
  let sendTime = intent.requestedTime || "6:30 PM";
  const h = to24(sendTime);
  const quietHoursAdjusted = h !== null && (h < 10 || h >= 21);
  if (quietHoursAdjusted) sendTime = "6:30 PM";

  const offer = intent.discountPct ? `${intent.discountPct}% off` : "an exclusive offer";
  const hook = intent.occasion ? `${intent.occasion} special: ` : intent.inactiveForDays ? "We miss you! " : intent.cartAbandoners ? "Still thinking it over? " : "";
  const messages = order.map((channel) => {
    const text =
      channel === "SMS"
        ? `NEXUSAI: ${hook}Hi {#name#}, enjoy ${offer} today. Shop: nexs.us/{#code#}. Reply STOP to opt out`
        : channel === "RCS"
          ? `${hook}Hi {{name}}, ${offer} is waiting for you. Tap "Shop now" to see picks for ${intent.cities[0] || "you"}.`
          : `${hook}Hi {{1}}, enjoy ${offer} on your favourites. Tap below to shop before it ends.`;
    const checks =
      channel === "SMS"
        ? [
            { label: `${text.length}/160 chars (1 segment)`, ok: text.length <= 160 },
            { label: "DLT header + variables", ok: true },
            { label: "Opt-out text", ok: /stop/i.test(text) },
          ]
        : channel === "WhatsApp"
          ? [
              { label: "Marketing template, {{1}} variable", ok: true },
              { label: "No prohibited claims", ok: !/guarantee|100%|free money/i.test(text) },
            ]
          : [{ label: "Rich card + suggested action", ok: true }];
    return { channel, text, checks };
  });

  const cost = order.reduce((s, c) => s + routed[c] * COST[c], 0);
  return {
    matched: users.length,
    byCity,
    excludedConsent: users.length - consented.length,
    excludedDnd: consented.length - eligible.length,
    routed,
    unreachable,
    cost: Math.round(cost),
    sendTime,
    quietHoursAdjusted,
    messages,
  };
}

export const isCampaignBrief = (t: string) =>
  /\b(send|launch|run|blast|notify|target|campaign|broadcast|message|remind)\b/i.test(t) &&
  !/\boptimi[sz]e\b/i.test(t);
