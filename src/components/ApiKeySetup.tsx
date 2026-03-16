import React, { useState } from 'react'

interface ApiKeySetupProps {
  onKeySubmit: (key: string) => void
}

export default function ApiKeySetup({ onKeySubmit }: ApiKeySetupProps) {
  const [key, setKey] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    const trimmed = key.trim()
    if (!trimmed.startsWith('sk-or-')) {
      setError('Key should start with sk-or-')
      return
    }
    onKeySubmit(trimmed)
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-up">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-accent rounded-sm flex items-center justify-center">
              <span className="text-ink font-display font-black text-sm">D</span>
            </div>
            <span className="font-display font-bold text-paper text-xl tracking-tight">
              DemoReady
            </span>
          </div>
          <p className="text-muted text-sm font-body ml-11">Own the room. Every time.</p>
        </div>

        <div className="border border-border rounded-2xl p-8 bg-surface">
          <h2 className="font-display font-bold text-paper text-lg mb-2">
            Connect your API key
          </h2>
          <p className="text-muted text-sm font-body leading-relaxed mb-6">
            Your key stays in your browser. Get yours at openrouter.ai/keys
          </p>

          <div className="space-y-3">
            <input
              type="password"
              value={key}
              onChange={(e) => {
                setKey(e.target.value)
                setError('')
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="sk-or-v1-..."
              className="w-full bg-ink border border-border rounded-xl px-4 py-3 text-paper font-mono text-sm placeholder-muted focus:outline-none focus:border-accent transition-colors"
            />
            {error && (
              <p className="text-accent text-xs font-body">{error}</p>
            )}
            <button
              onClick={handleSubmit}
              disabled={!key.trim()}
              className="w-full bg-accent text-ink font-display font-bold text-sm py-3 rounded-xl hover:bg-orange-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Start Prep Session
            </button>
          </div>
        </div>

        <p className="text-center text-muted text-xs font-body mt-6">
          Built for PMs who dont wing it.
        </p>
      </div>
    </div>
  )
}
