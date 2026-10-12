# Nexus AI — Agentic Omnichannel Campaign Copilot

One sentence in, a compliant multi-channel campaign out. Type a brief like
*"Launch an RCS + SMS win-back for Tier 2 users inactive for 60 days with 20% off at 10 PM"*
and Nexus parses intent, builds the audience, removes users without consent or on DND,
routes each user WhatsApp → RCS → SMS, drafts DLT-safe copy and moves sends into the TRAI window.
Nothing sends without the marketer's approval.

- **PRD:** https://www.notion.so/3f72123d4b0b81ef9bd3e7458099838b
- Audience, channels and metrics in the demo are simulated.

## How it works
- `src/lib/intent.ts` — rule-based intent engine: parses the brief into a JSON intent schema, filters a 60K synthetic audience, applies consent/DND exclusion, waterfall routing with cost estimates, copy compliance checks and the TRAI send-window guard. v2 swaps the parser for an LLM behind the same schema.
- `src/components/ai/AIAssistant.tsx` — copilot panel with voice input and read-aloud.
- Screens: dashboard, campaigns, audience, templates, channels, analytics, settings.

## Stack
React 19, TypeScript, TanStack Router, Tailwind, Recharts, Vite. Prototyped with Lovable.

## Run locally
```bash
npm install
npm run dev
```

Built by Amarjot Singh.
