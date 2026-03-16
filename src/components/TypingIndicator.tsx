import React from 'react'

export default function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-4 animate-fade-up">
      <div className="w-6 h-6 bg-accent rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-ink font-display font-black text-xs">D</span>
      </div>
      <div className="flex items-center gap-1 py-2">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  )
}
