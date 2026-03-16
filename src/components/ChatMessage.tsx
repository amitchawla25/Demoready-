import React from 'react'
import { Message } from '../lib/claude'

interface ChatMessageProps {
  message: Message
  isLatest: boolean
}

function parseRunbook(content: string): { isRunbook: boolean; html: string } {
  if (!content.includes('## DEMO RUNBOOK')) {
    return { isRunbook: false, html: content }
  }

  let html = content
    .replace(/## ([^\n]+)/g, '<h2>$1</h2>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/^(\d+\.\s.+)$/gm, '<li>$1</li>')
    .replace(/^[-•]\s(.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul])/gm, '')

  return { isRunbook: true, html: `<p>${html}</p>` }
}

export default function ChatMessage({ message, isLatest }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const { isRunbook, html } = parseRunbook(message.content)

  if (isUser) {
    return (
      <div className={`flex justify-end mb-4 ${isLatest ? 'animate-fade-up' : ''}`}>
        <div className="max-w-[75%] bg-accent text-ink rounded-2xl rounded-tr-sm px-4 py-3">
          <p className="font-body text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
    )
  }

  if (isRunbook) {
    return (
      <div className={`mb-6 ${isLatest ? 'animate-fade-up' : ''}`}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 bg-accent rounded-sm flex items-center justify-center flex-shrink-0">
            <span className="text-ink font-display font-black text-xs">D</span>
          </div>
          <span className="text-muted text-xs font-mono uppercase tracking-widest">
            Runbook Generated
          </span>
        </div>
        <div className="border border-border rounded-2xl p-6 bg-surface">
          <div
            className="runbook-content"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <button
            onClick={() => {
              const text = message.content
              navigator.clipboard.writeText(text)
            }}
            className="mt-4 text-xs font-mono text-muted hover:text-accent transition-colors border border-border hover:border-accent rounded-lg px-3 py-1.5"
          >
            Copy runbook
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex gap-3 mb-4 ${isLatest ? 'animate-fade-up' : ''}`}>
      <div className="w-6 h-6 bg-accent rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-ink font-display font-black text-xs">D</span>
      </div>
      <div className="flex-1 max-w-[80%]">
        <p className="font-body text-sm text-paper leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
      </div>
    </div>
  )
}
