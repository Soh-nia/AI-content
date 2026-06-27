# Repurpose — AI Content Repurposing Tool

> Write once. Publish everywhere. Paste a blog post and get a Twitter thread, LinkedIn post, and email newsletter — each crafted for the platform.

## What it does

Paste any long-form content (blog post, article, essay) and get three ready-to-publish pieces:

- **Twitter / X Thread** — 5–8 tweets, hook-first, shareable format
- **LinkedIn Post** — 800–1200 characters, story-driven with bullet takeaways and hashtags
- **Email Newsletter** — subject line, preview text, conversational body, clear CTA

Each generates sequentially with live streaming. Three tone options: professional, casual, bold.

## Tech stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Anthropic Claude API (`claude-sonnet-4-5`)
- Deployed on Vercel

## Getting started

```bash
git clone https://github.com/YOUR_USERNAME/repurpose
cd repurpose
npm install
cp .env.example .env.local
# Add VITE_ANTHROPIC_API_KEY to .env.local
npm run dev
```

## Environment variables

```
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
```

## Prompt engineering

Three platform-specific system prompts, each optimised for its format:

**Twitter prompt** — instructs Claude on the hook-first structure, 240 char limit per tweet, 5–8 tweet count, and ending with a question to drive replies.

**LinkedIn prompt** — short paragraphs, whitespace-heavy format, story + bullet structure, one CTA, and 3–5 relevant hashtags. Explicitly prohibits corporate speak.

**Email prompt** — structured output (subject, preview text, body, bullets, CTA, sign-off). Keeps it under 400 words and instructs a conversational tone.

All three prompts inject a tone modifier (`professional`, `casual`, `bold`) from the user's selection.

## Deployment

```bash
npm run build
vercel --prod
```

## Planned features

- [ ] Custom tone/voice settings
- [ ] Schedule to Buffer/Hootsuite
- [ ] Instagram caption format
- [ ] YouTube description format
- [ ] Save and history of repurposed content
- [ ] A/B variations for each platform

## License

MIT
