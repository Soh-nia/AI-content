/**
 * Repurpose — AI Content Repurposing Tool
 *
 * Design direction: Vibrant violet accent on clean white. 
 * Input left, three output cards right (or stacked on mobile).
 * Each output card has a platform-specific icon and character count.
 * Signature element: platform mock previews showing how it looks in context.
 */

import { useState, useRef, useCallback } from "react"
import { Twitter, Linkedin, Mail, RotateCcw, AlertCircle } from "lucide-react"
import { streamFromClaude } from "./lib/anthropic"
import Header from "./components/Header"
import OutputCard from "./components/OutputCard"
import AppImage from "./assets/images/app-1.jpg"
import Shadow from "./assets/images/svg/shadow.svg"


type Platform = "twitter" | "linkedin" | "email"
type Status = "idle" | "streaming-twitter" | "streaming-linkedin" | "streaming-email" | "done" | "error"

interface Outputs {
  twitter: string
  linkedin: string
  email: string
}

// ─── Prompt Engineering ───────────────────────────────────────────────────

const TWITTER_SYSTEM = `You are a viral Twitter/X content strategist. You turn long-form content into engaging thread that gets reshares.

Rules for great Twitter threads:
- Tweet 1 is the hook — it must make someone stop scrolling. Start with a surprising insight, bold claim, or compelling question. NO "Thread:" or "🧵" prefix.
- Each tweet is 240 characters max — count carefully
- 5–8 tweets total
- End with a summary tweet and a question to drive replies
- Use line breaks for readability
- No excessive emojis — 1–2 max per tweet where genuinely useful

Format:
1/ [Hook tweet]

2/ [Tweet 2]

3/ [Tweet 3]

[Continue through thread]

[Final tweet]: What do you think? Reply with…`

const LINKEDIN_SYSTEM = `You are a LinkedIn content expert who writes posts that get genuine engagement — not cringe corporate speak.

Rules for great LinkedIn posts:
- Open with a one-line hook on its own line (no "I'm excited to share…")
- Use short paragraphs — 2 sentences max each
- Tell a story or share a genuine insight
- Use line breaks liberally — LinkedIn rewards whitespace
- Include 3–5 bullet points for the key takeaway
- End with ONE specific question to drive comments
- 800–1200 characters total
- 3–5 hashtags at the end, relevant not generic

Format the post ready to copy-paste into LinkedIn.`

const EMAIL_SYSTEM = `You are an expert email newsletter writer. You write emails that people actually open and read — not corporate newsletters.

Structure every email exactly like this:

Subject: [Compelling subject line — max 50 chars, no clickbait]
Preview text: [30-char preview that complements the subject]

---

[Opening: 1 sentence that gets straight to the point]

[Body: 2–3 short paragraphs. Tell the story or share the insight. Be conversational.]

[Key takeaways as a bulleted list:]
• Point 1
• Point 2
• Point 3

[CTA: One clear action — read more, reply, share]

[Sign-off: warm but brief]

Keep it under 400 words. Write like you're emailing a friend who's a professional.`

// ─── Platform Config ──────────────────────────────────────────────────────

const PLATFORMS = [
  {
    id: "twitter" as Platform,
    label: "Twitter / X Thread",
    icon: Twitter,
    color: "text-sky-500",
    bg: "bg-sky-50",
    border: "border-sky-200",
    ring: "ring-sky-200",
    streaming: "streaming-twitter" as Status,
    charLimit: 280 * 8,
    placeholder: "Thread will appear here…",
    tip: "5–8 tweets · hook-driven · shareable",
  },
  {
    id: "linkedin" as Platform,
    icon: Linkedin,
    label: "LinkedIn Post",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    ring: "ring-blue-200",
    streaming: "streaming-linkedin" as Status,
    charLimit: 3000,
    placeholder: "LinkedIn post will appear here…",
    tip: "800–1200 chars · story-driven · professional",
  },
  {
    id: "email" as Platform,
    icon: Mail,
    label: "Email Newsletter",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    ring: "ring-violet-200",
    streaming: "streaming-email" as Status,
    charLimit: 2000,
    placeholder: "Email draft will appear here…",
    tip: "Under 400 words · conversational · one CTA",
  },
]

const PLATFORM_SYSTEMS: Record<Platform, string> = {
  twitter: TWITTER_SYSTEM,
  linkedin: LINKEDIN_SYSTEM,
  email: EMAIL_SYSTEM,
}

// ─── Main App ──────────────────────────────────────────────────────────────

export default function App() {
  const [source, setSource] = useState("")
  const [tone, setTone] = useState("professional")
  const [outputs, setOutputs] = useState<Outputs>({ twitter: "", linkedin: "", email: "" })
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState("")
  const stopRef = useRef<(() => void) | null>(null)

  const isStreaming = status.startsWith("streaming")
  const canGenerate = source.trim().length > 100
  const hasOutput = outputs.twitter || outputs.linkedin || outputs.email

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) return
    setOutputs({ twitter: "", linkedin: "", email: "" })
    setError("")

    const userMessage = `Tone preference: ${tone}\n\nOriginal content:\n\n${source}`

    // Stream all three sequentially
    const sequence: Platform[] = ["twitter", "linkedin", "email"]
    const statuses: Status[] = ["streaming-twitter", "streaming-linkedin", "streaming-email"]

    const runNext = async (index: number) => {
      if (index >= sequence.length) { setStatus("done"); return }
      const platform = sequence[index]
      setStatus(statuses[index])
      const stop = await streamFromClaude({
        system: PLATFORM_SYSTEMS[platform],
        userMessage,
        onChunk: (t) => setOutputs((p) => ({ ...p, [platform]: p[platform] + t })),
        onComplete: () => runNext(index + 1),
        onError: (msg) => { setError(msg); setStatus("error") },
        maxTokens: 1024,
      })
      stopRef.current = stop
    }
    runNext(0)
  }, [source, tone, canGenerate])

  const reset = () => {
    stopRef.current?.()
    setOutputs({ twitter: "", linkedin: "", email: "" })
    setStatus("idle")
    setError("")
  }

  return (
    <>
      {/* Header */}
      <Header />

      {/* Hero */}
      <section className="overflow-hidden inverted border-bottom">
        <div className="py-15 d-flex flex-column container min-vh-100 foreground">
          <div className="row align-items-center justify-content-center justify-content-lg-between my-auto">
            <div className="col-lg-6 col-xl-5 text-center text-lg-start foreground mb-5 mb-lg-0">
              <h1 className="display-1 lh-sm" style={{ fontFamily: "'Transforma Mix', 'Playfair Display', Georgia, serif" }}>Write once. Publish everywhere.</h1>
              <p className="lead text-secondary my-4 fw-lg-75">
                Paste any blog post, article, or long-form content. Get a Twitter thread, LinkedIn post, and email newsletter — each crafted for the platform, ready to publish.
              </p>
              
            </div>
            <div className="col-lg-5 position-relative">
              <div className="card equal-2-1 equal-lg-1-1 overflow-visible level-1">
                <div className="card-wrap">
                  <img className="img-fluid" src={AppImage} alt="Image" data-aos="fade-up"
                    data-aos-delay="200" />
                </div>
              </div>
              <img className="position-absolute top-50 start-50 translate-middle level-2" src={Shadow}
                alt="" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-10" id="main">
        <div className="container">
          <div className="row align-items-center justify-content-center justify-content-lg-between">
            <div className="col-12 mb-5 mb-lg-0 inverted">
              <div>
                <h3 className="mt-3" style={{ fontFamily: "'Transforma Mix', 'Playfair Display', Georgia, serif" }}>Source Content</h3>
                <span className="mb-3 lead text-secondary fw-lg-45">
                  Blog post, article, essay, notes
                </span>
              </div>

              {/* Tone selector */}
              <div className="my-2 row justify-content-center justify-content-lg-start g-1">
                {["professional", "casual", "bold"].map((t) => (
                  <div className="col-auto" key={t}>
                    <button
                    onClick={() => setTone(t)}
                    disabled={isStreaming}
                    className={`btn btn-sm rounded-pill ${tone === t ? "btn-red" : "btn-outline-white"}`}
                    >
                      {t}
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <textarea
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  rows={10}
                  placeholder="Paste your content here…&#10;&#10;Minimum 100 characters. The richer your source material, the better the output across all three platforms."
                  className="form-control rounded-3 p-3 h-100 w-100"
                  disabled={isStreaming}
                />
                <div className="mt-2 d-flex justify-content-between">
                  <span className="text-start text-slate-300">{source.length} chars</span>
                  {!canGenerate && !isStreaming && (
                    <p className="text-end text-slate-400">Add at least 100 characters of source content</p>
                  )}
                </div>
              </div>

              {/* Status indicators */}
              {(isStreaming || hasOutput) && (
                <div className="my-3 d-flex flex-wrap justify-content-start">
                  {PLATFORMS.map((p) => {
                    const done = !!outputs[p.id] && status !== p.streaming
                    const active = status === p.streaming
                    const Icon = p.icon
                    return (
                      <div className={`list-group-item d-flex align-items-center ${active ? "text-red" : done ? "text-secondary" : "text-slate-300"}`}>
                        <div className={`icon-box bg-white rounded-circle me-2 ${active ? "bg-white" : done ? "bg-green-500" : "bg-slate-100"}`}>
                        {done ? <span className="text-black text-[12px]">✓</span> : <Icon size={16} className={active ? "text-red" : "text-black"} />}
                        </div>
                        {p.label}
                      </div>
                    )
                  })}
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 animate-fade-in">
                  <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">{error}</p>
                </div>
              )}

              <div className="d-flex justify-content-end gap-2 my-3">
                <button
                  onClick={handleGenerate}
                  disabled={!canGenerate || isStreaming}
                  className="btn btn-sm btn-red rounded-pill disabled:opacity-40 disabled:cursor-not-allowed text-white"
                >
                  {isStreaming ? "Repurposing…" : "Repurpose Content"}
                </button>
                {hasOutput && !isStreaming && (
                  <button onClick={reset} className="btn btn-sm btn-outline-white rounded-pill">
                    <RotateCcw size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="col-12" data-aos="fade-up">
              <div className="space-y-4">
                {PLATFORMS.map((p) => (
                  <OutputCard
                    key={p.id}
                    platform={p}
                    content={outputs[p.id]}
                    isStreaming={status === p.streaming}
                  />
                ))}

                {status === "done" && (
                  <div className="py-3 flex items-center gap-2 animate-slide-up">
                    <p className="text-sm text-red font-medium">
                      All three formats ready. Copy each to its platform and you're done.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

    </>
  )
}
