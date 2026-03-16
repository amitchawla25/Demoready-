import { useState, useRef, useEffect } from 'react'
import { Message, sendMessage } from '../lib/claude'
import ChatMessage from './ChatMessage'
import TypingIndicator from './TypingIndicator'

interface ChatInterfaceProps {
  apiKey: string
  onReset: () => void
}

export default function ChatInterface({ apiKey, onReset }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [sessionComplete, setSessionComplete] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      startSession()
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const startSession = async () => {
    setIsLoading(true)
    setError('')
    try {
      const greeting = await sendMessage(
        [{ role: 'user', content: 'Start my demo prep session.' }],
        apiKey
      )
      setMessages([
        { role: 'user', content: 'Start my demo prep session.' },
        { role: 'assistant', content: greeting },
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect. Check your API key.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: trimmed },
    ]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)
    setError('')

    try {
      const reply = await sendMessage(newMessages, apiKey)
      const updatedMessages: Message[] = [
        ...newMessages,
        { role: 'assistant', content: reply },
      ]
      setMessages(updatedMessages)

      if (reply.includes('## DEMO RUNBOOK')) {
        setSessionComplete(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setIsLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleNewSession = () => {
    setMessages([])
    setInput('')
    setError('')
    setSessionComplete(false)
    initialized.current = false
    setTimeout(() => {
      initialized.current = false
      startSession()
    }, 100)
  }

  // Filter out the initial trigger message from display
  const displayMessages = messages.filter(
    (m) => m.content !== 'Start my demo prep session.'
  )

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-accent rounded-sm flex items-center justify-center">
            <span className="text-ink font-display font-black text-sm">D</span>
          </div>
          <span className="font-display font-bold text-paper text-lg tracking-tight">
            DemoReady
          </span>
          <span className="hidden sm:block w-1 h-1 rounded-full bg-border" />
          <span className="hidden sm:block text-muted text-xs font-mono">
            Demo Prep Session
          </span>
        </div>
        <div className="flex items-center gap-3">
          {sessionComplete && (
            <button
              onClick={handleNewSession}
              className="text-xs font-mono text-muted hover:text-paper transition-colors border border-border hover:border-accent rounded-lg px-3 py-1.5"
            >
              New session
            </button>
          )}
          <button
            onClick={onReset}
            className="text-xs font-mono text-muted hover:text-accent transition-colors"
          >
            Change key
          </button>
        </div>
      </header>

      {/* Progress indicator */}
      {!sessionComplete && messages.length > 2 && (
        <div className="px-6 py-2 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <div
                  key={step}
                  className={`h-0.5 w-6 rounded-full transition-colors ${
                    Math.floor(displayMessages.length / 2) >= step
                      ? 'bg-accent'
                      : 'bg-border'
                  }`}
                />
              ))}
            </div>
            <span className="text-muted text-xs font-mono">
              {Math.min(Math.floor(displayMessages.length / 2), 6)}/6
            </span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-2xl mx-auto">
          {error && !messages.length && (
            <div className="border border-accent/30 bg-accent/5 rounded-xl p-4 mb-4">
              <p className="text-accent text-sm font-body">{error}</p>
              <button
                onClick={startSession}
                className="mt-2 text-xs font-mono text-accent hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {displayMessages.map((msg, i) => (
            <ChatMessage
              key={i}
              message={msg}
              isLatest={i === displayMessages.length - 1}
            />
          ))}

          {isLoading && <TypingIndicator />}

          {error && messages.length > 0 && (
            <div className="text-accent text-xs font-mono text-center py-2">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      {!sessionComplete && (
        <div className="border-t border-border px-4 sm:px-6 py-4 flex-shrink-0">
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-3 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer..."
                rows={1}
                disabled={isLoading}
                className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 text-paper font-body text-sm placeholder-muted focus:outline-none focus:border-accent transition-colors resize-none disabled:opacity-50 leading-relaxed"
                style={{ minHeight: '48px', maxHeight: '120px' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = 'auto'
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px'
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-accent text-ink w-12 h-12 rounded-xl flex items-center justify-center hover:bg-orange-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M2 8L14 8M14 8L8 2M14 8L8 14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <p className="text-muted text-xs font-mono mt-2 text-center">
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      )}

      {sessionComplete && (
        <div className="border-t border-border px-6 py-4 flex-shrink-0">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <p className="text-muted text-sm font-body">
              Runbook complete. You're ready.
            </p>
            <button
              onClick={handleNewSession}
              className="bg-accent text-ink font-display font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-orange-500 transition-colors"
            >
              Prep another demo →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
