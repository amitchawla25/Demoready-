import React, { useState, useEffect } from 'react'
import ApiKeySetup from './components/ApiKeySetup'
import ChatInterface from './components/ChatInterface'
import DemoMode from './components/DemoMode'

const API_KEY_STORAGE = 'demoready_api_key'

export default function App() {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [demoMode, setDemoMode] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(API_KEY_STORAGE)
    if (stored) setApiKey(stored)
  }, [])

  const handleKeySubmit = (key: string) => {
    localStorage.setItem(API_KEY_STORAGE, key)
    setApiKey(key)
  }

  const handleReset = () => {
    localStorage.removeItem(API_KEY_STORAGE)
    setApiKey(null)
  }

  if (demoMode) {
    return <DemoMode onExit={() => setDemoMode(false)} />
  }

  if (!apiKey) {
    return <ApiKeySetup onKeySubmit={handleKeySubmit} onWatchDemo={() => setDemoMode(true)} />
  }

  return <ChatInterface apiKey={apiKey} onReset={handleReset} />
}
