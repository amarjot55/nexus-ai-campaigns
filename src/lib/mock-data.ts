export const brands = [
  { id: "flipmart", name: "Flipmart India" },
  { id: "chaipoint", name: "Chai Point" },
  { id: "urbanfit", name: "UrbanFit" },
];

export const kpis = [
  { label: "Active Campaigns", value: "24", change: 12.5, spark: [4, 6, 5, 8, 7, 10, 12] },
  {
    label: "Messages Sent (30d)",
    value: "1.42M",
    change: 18.2,
    spark: [30, 42, 38, 55, 61, 70, 82],
  },
  { label: "Delivery Rate", value: "97.4%", change: 0.8, spark: [95, 96, 96, 97, 97, 97, 97] },
  { label: "Avg CTR", value: "8.9%", change: -1.4, spark: [10, 9, 11, 8, 9, 8, 9] },
  { label: "Total Reach", value: "8.1L", change: 22.1, spark: [3, 4, 5, 5, 6, 7, 8] },
  { label: "Spend", value: "₹4.72L", change: 6.7, spark: [2, 3, 3, 4, 4, 5, 5] },
];

export const channelPerf = [
  { channel: "WhatsApp", delivery: 98.2, ctr: 14.1 },
  { channel: "SMS", delivery: 96.4, ctr: 5.8 },
  { channel: "RCS", delivery: 94.1, ctr: 11.6 },
  { channel: "Google Ads", delivery: 99.1, ctr: 4.2 },
  { channel: "Meta Ads", delivery: 98.6, ctr: 3.9 },
];

export const funnelData = [
  { stage: "Sent", value: 142000 },
  { stage: "Delivered", value: 138300 },
  { stage: "Opened", value: 78200 },
  { stage: "Clicked", value: 12640 },
  { stage: "Converted", value: 3120 },
];

export const trendData = [
  { day: "Mon", whatsapp: 12, sms: 5, rcs: 8, google: 3, meta: 3 },
  { day: "Tue", whatsapp: 14, sms: 6, rcs: 9, google: 4, meta: 3 },
  { day: "Wed", whatsapp: 13, sms: 5, rcs: 10, google: 4, meta: 4 },
  { day: "Thu", whatsapp: 16, sms: 6, rcs: 11, google: 5, meta: 4 },
  { day: "Fri", whatsapp: 18, sms: 7, rcs: 12, google: 5, meta: 5 },
  { day: "Sat", whatsapp: 21, sms: 8, rcs: 14, google: 6, meta: 5 },
  { day: "Sun", whatsapp: 19, sms: 7, rcs: 13, google: 5, meta: 5 },
];

export const liveEvents: string[] = [
  "WhatsApp campaign 'Diwali Sale' delivered to 12,400 users",
  "AI paused campaign 'Flash Sale NCR' — anomaly detected in delivery rate",
  "A/B test winner selected: Template B (+18% CTR)",
  "Segment 'High-intent Delhi buyers' refreshed — 8,420 users",
  "RCS campaign 'New Arrivals' opened by 4,120 users",
  "SMS fallback triggered for 2,140 non-WhatsApp users",
  "Nexus AI recommended shifting send time to 6:30 PM IST",
  "Google Ads budget re-allocated: +₹8,000 to 'Repeat Buyers'",
  "Meta Ads: CTR up 22% on 'Bengaluru Tier-1' creative",
  "Consent verified for 14,200 recipients (DND compliant)",
];

export const campaigns = [
  {
    id: "c1",
    name: "Diwali Mega Sale",
    channel: "WhatsApp + SMS",
    status: "Live",
    sent: 42100,
    delivered: 41300,
    opened: 24800,
    clicked: 3820,
  },
  {
    id: "c2",
    name: "Flash Sale NCR",
    channel: "WhatsApp",
    status: "Paused",
    sent: 12100,
    delivered: 11800,
    opened: 6120,
    clicked: 810,
  },
  {
    id: "c3",
    name: "New Arrivals — Ethnic",
    channel: "RCS",
    status: "Scheduled",
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
  },
  {
    id: "c4",
    name: "Cart Recovery — 24h",
    channel: "WhatsApp",
    status: "Live",
    sent: 6200,
    delivered: 6120,
    opened: 4210,
    clicked: 924,
  },
  {
    id: "c5",
    name: "Bengaluru Loyalty Push",
    channel: "Meta Ads",
    status: "Completed",
    sent: 88400,
    delivered: 87200,
    opened: 32100,
    clicked: 2810,
  },
  {
    id: "c6",
    name: "Chai Point Weekend",
    channel: "SMS",
    status: "Draft",
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
  },
];

export const segments = [
  {
    id: "s1",
    name: "Delhi NCR — Last 30d buyers",
    size: 8420,
    updated: "2h ago",
    cities: { Delhi: 4200, Gurgaon: 2100, Noida: 1420, Faridabad: 700 },
  },
  {
    id: "s2",
    name: "Mumbai high-AOV",
    size: 3120,
    updated: "1d ago",
    cities: { Mumbai: 2100, Thane: 620, "Navi Mumbai": 400 },
  },
  {
    id: "s3",
    name: "Bengaluru repeat buyers",
    size: 5640,
    updated: "6h ago",
    cities: { Bengaluru: 5640 },
  },
  {
    id: "s4",
    name: "Tier 2 — dormant 60d",
    size: 14200,
    updated: "3h ago",
    cities: { Jaipur: 3200, Lucknow: 2800, Indore: 2400, Kochi: 2100, Chandigarh: 3700 },
  },
];

export const aiSuggestedSegments = [
  {
    name: "High-intent, low-engagement",
    size: 2100,
    reason: "Browsed 3+ times, no purchase in 14d",
  },
  {
    name: "Cart abandoners — 24h window",
    size: 1840,
    reason: "Added ₹500+ to cart, dropped at checkout",
  },
  {
    name: "Reactivation — 90d dormant",
    size: 6420,
    reason: "No opens in 90 days, past AOV ₹1,200+",
  },
];

export const templates = [
  {
    id: "t1",
    name: "Diwali Sale — Bold",
    channel: "WhatsApp",
    status: "Approved",
    ctr: 22.1,
    recommended: true,
  },
  { id: "t2", name: "Diwali Sale — Warm", channel: "WhatsApp", status: "Approved", ctr: 18.4 },
  { id: "t3", name: "Cart Recovery Nudge", channel: "SMS", status: "Approved", ctr: 6.2 },
  {
    id: "t4",
    name: "New Arrivals — Rich Card",
    channel: "RCS",
    status: "Approved",
    ctr: 12.8,
    recommended: true,
  },
  { id: "t5", name: "Loyalty Points Alert", channel: "SMS", status: "Pending", ctr: 0 },
  { id: "t6", name: "Flash Deal — Urgency", channel: "WhatsApp", status: "Rejected", ctr: 0 },
];

export const channels = [
  {
    id: "wa",
    name: "WhatsApp Business API",
    status: "Connected",
    account: "WABA ID: 1029384756",
    latency: 142,
    success: 98.2,
  },
  {
    id: "sms",
    name: "SMS (DLT-Registered)",
    status: "Connected",
    account: "Header: NEXUSAI",
    latency: 88,
    success: 96.4,
  },
  {
    id: "rcs",
    name: "RCS Business Messaging",
    status: "Connected",
    account: "Agent: nexus_rcs_prod",
    latency: 210,
    success: 94.1,
  },
  {
    id: "gads",
    name: "Google Ads",
    status: "Connected",
    account: "Customer ID: 342-118-9821",
    latency: 320,
    success: 99.1,
  },
  {
    id: "meta",
    name: "Meta Ads",
    status: "Connected",
    account: "Ad Account: act_88291042",
    latency: 280,
    success: 98.6,
  },
];

export const sampleContact = {
  name: "Aarav Sharma",
  phone: "+91 98104 22188",
  city: "Delhi",
};
