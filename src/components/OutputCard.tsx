import { useState } from "react"
import { Twitter, Linkedin, Mail, Copy, Check } from "lucide-react"

type Platform = "twitter" | "linkedin" | "email"
type Status = "idle" | "streaming-twitter" | "streaming-linkedin" | "streaming-email" | "done" | "error"


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

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="flex items-center gap-1 btn btn-sm btn-outline-red rounded-pill"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copied!" : "Copy"}
    </button>
  )
}

function CharCounter({ text, limit }: { text: string; limit: number }) {
  const count = text.length
  const pct = count / limit
  return (
    <span className={`text-xs tabular-nums ${pct > 0.9 ? "text-red" : "text-slate-400"}`}>
      {count.toLocaleString()}
    </span>
  )
}

export default function OutputCard({
  platform,
  content,
  isStreaming,
}: {
  platform: typeof PLATFORMS[0]
  content: string
  isStreaming: boolean
}) {
  const Icon = platform.icon
  const formatted = content
    .split("\n")
    .map((line, i) => {
      if (line.match(/^\d+\//)) return `<p class="font-medium text-slate-800 text-sm mb-1 mt-3 first:mt-0">${line}</p>`
      if (line.startsWith("Subject:")) return `<p class="font-semibold text-slate-900 text-sm">${line}</p>`
      if (line.startsWith("Preview text:")) return `<p class="text-xs text-slate-400 mb-2">${line}</p>`
      if (line === "---") return `<hr class="border-slate-100 my-3">`
      if (line.startsWith("• ")) return `<div class="flex gap-2 text-sm text-slate-600 mb-1"><span class="text-slate-400">•</span><span>${line.slice(2)}</span></div>`
      if (line.trim() === "") return i > 0 ? `<div class="h-2"></div>` : ""
      return `<p class="text-sm text-black leading-relaxed">${line}</p>`
    })
    .join("")

  return (
    <div className={`bg-white rounded-3 mb-2 border overflow-hidden transition-all duration-200 ${isStreaming ? `${platform.border} shadow-lg` : content ? "border-slate-200 shadow-sm" : "border-dashed border-slate-200"}`}>
      {/* Card header */}
      <div className={`px-4 py-3 border-b ${content || isStreaming ? "border-slate-100" : "border-transparent"} flex items-center justify-between`}>
        <div className="d-flex flex-wrap justify-content-between">
        <div className="d-flex align-items-center gap-2.5 mb-2">
          <div className={`icon-box bg-red rounded-circle me-2`}>
            <Icon size={14} className={platform.color} />
            </div>
          <div style={{ fontFamily: "'Transforma Mix', 'Playfair Display', Georgia, serif" }}>
            <span className="fs-6 font-semibold text-slate-800">{platform.label}</span>
            <p className="fs-7 text-slate-400">{platform.tip}</p>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          {isStreaming && (
            <span className="d-flex align-items-center gap-1 text-[11px] font-medium text-red">
              <span className="w-1.5 h-1.5 bg-red rounded-full animate-pulse" />
              Writing…
            </span>
          )}
          {content && !isStreaming && (
            <>
              <CharCounter text={content} limit={platform.charLimit} />
              <CopyButton text={content} />
            </>
          )}
        </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 min-h-[120px]">
        {content ? (
          <div className={`${isStreaming ? "cursor-blink" : ""}`} dangerouslySetInnerHTML={{ __html: formatted }} />
        ) : (
          <p className="text-sm text-black italic">{isStreaming ? "" : platform.placeholder}</p>
        )}
      </div>
    </div>
  )
}