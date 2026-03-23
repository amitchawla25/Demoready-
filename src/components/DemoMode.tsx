import React, { useState, useRef, useEffect } from 'react'

interface Step {
  type: 'agent' | 'user'
  text: string
  delay: number
}

const DEMO_SCRIPT: Step[] = [
  {
    type: 'agent',
    text: "Tell me about the demo — what are you showing, who's going to be in the room, and what needs to happen by the end of this meeting?",
    delay: 800
  },
  {
    type: 'user',
    text: "Demoing Claude for Enterprise to our CTO David, CFO Linda, and VP Compliance Robert who added himself last minute. Pilot cut our monthly compliance reporting from 2 days to 40 minutes. Need budget approval today — $180K decision.",
    delay: 1200
  },
  {
    type: 'agent',
    text: "Robert adding himself is the real story here. Is he protecting his team, skeptical of AI, or both? And what's fragile in the demo itself — what should never get clicked?",
    delay: 1000
  },
  {
    type: 'user',
    text: "Robert has 6 people on his compliance team. He'll frame it as regulatory risk but he's protecting headcount. Fragile: Claude runs slow live — 45 seconds of silence. Can't touch the legacy database report, it breaks.",
    delay: 1200
  },
  {
    type: 'agent',
    text: "David's a CTO — he's going to go straight at the data security question. What's his specific concern and do you have an answer ready?",
    delay: 1000
  },
  {
    type: 'user',
    text: "Our compliance data has customer PII. David wants to know where it goes and whether Anthropic trains on it. I have the enterprise data agreement ready to pull up.",
    delay: 1200
  },
  {
    type: 'agent',
    text: "Good. What's your backup if the live demo stalls or Robert pushes you onto the legacy database?",
    delay: 1000
  },
  {
    type: 'user',
    text: "Pre-recorded 4 minute video of the full run on clean data. If anything breaks I switch to that without making a big deal of it.",
    delay: 1200
  },
  {
    type: 'agent',
    text: "Got what I need. Building your runbook now...",
    delay: 800
  }
]

const RUNBOOK = `## DEMO RUNBOOK

**Demo:** Claude for Enterprise — Compliance Reporting Automation
**Audience:** David Park (CTO), Linda Torres (CFO), Robert Chen (VP Compliance)
**Goal:** Budget approval for full deployment — $180K annual contract
**Time:** 25 minutes

---

## PRE-DEMO CHECKLIST
- Open Claude Enterprise on clean pre-loaded data — not live database
- Have enterprise data agreement open in separate tab
- Pre-recorded video ready to go in another tab
- Log in 15 minutes early and run through the flow once
- Do not open legacy database report under any circumstances

---

## YOUR OPENING LINE
"Two days down to 40 minutes. I want to show you exactly how — and then we can talk about what it means for the team."

---

## DEMO FLOW

**1. The before state — 2 min**
Show the current process. Spreadsheets, manual steps, 2 analysts, 2 days. Let it land. Don't rush this — the contrast is your strongest moment.

**2. Claude runs the report — 4 min**
Start the task. While Claude runs — and it will take 45 seconds — narrate what's happening. "It's pulling from three data sources simultaneously, cross-referencing against our regulatory framework, formatting to the exact template our auditors require." Fill the silence with substance.

**3. The output — 3 min**
Show the completed report. Same format. Zero errors. Point out two things: accuracy and audit trail. Robert needs to see the audit trail — it's his compliance proof.

**4. Security slide — 2 min**
Pull up the enterprise data agreement before David asks. "I know data security is the first question — here's exactly what the agreement covers." Take it off the table proactively.

---

## WHAT TO SKIP
**Legacy database report** — breaks on live data. If Robert asks to see it say: "That's in phase 2 of the rollout — we deliberately scoped phase 1 to the three stable workflows so we could prove it cleanly."

**Admin configuration screens** — half built. Never navigate there.

---

## THE QUESTIONS THEY WILL ASK

**David: "Where does our data go? Does Anthropic train on it?"**
What he really wants: proof he won't get blamed for a data breach.
Answer: "Nothing leaves your environment. Zero retention, zero training on your data — it's in the enterprise agreement on page 2. I can send it to you after this."

**Linda: "What's the ROI and does this replace headcount?"**
What she really wants: a number she can defend to the board.
Answer: "We're not replacing anyone — we're redeploying them to higher value work. The $180K pays back in under 4 months based on analyst hours alone. I have the model if you want it."

**Robert: "What happens when it makes a mistake on a regulatory filing?"**
What he really wants: to not be held responsible if something goes wrong.
Answer: "Every output has a full audit trail — who ran it, what sources it used, what it produced. Your team reviews and approves before anything gets filed. Claude does the work, your team owns the decision."

**Robert: "My team needs to be involved in any rollout."**
Answer: "Absolutely — your team runs this. We're not removing humans from compliance decisions, we're removing the manual data work so they can focus on the judgment calls only they can make."

**David: "What's the security certification?"**
Answer: "SOC 2 Type II, GDPR compliant, enterprise data agreement in place. I'll send the full security pack after this meeting."

---

## LANDMINE MAP

**Robert derailing with headcount:**
Early signal: he uses the word "replace" or "my team."
Defuse: "This doesn't change your headcount — it changes what your team spends their time on. The regulatory judgment stays with them."
Never say: "This could reduce the need for..." — you'll lose the room.

**The 45-second silence:**
Don't apologize. Don't say "it's usually faster." Narrate the process confidently while it runs. Silence that you own reads as confidence.

**David going deep on security:**
Have the enterprise agreement on screen within 30 seconds of the question. Don't describe it — show it.

---

## IF SOMETHING BREAKS
"Let me switch to the recorded run so we don't lose time — same workflow, ran it yesterday on our actual data."
Pull up video. Keep talking. Do not apologize more than once.

---

## YOUR CLOSING ASK
"I need two things: David's sign-off on security and Linda's approval to move to procurement. Robert — I want your team leading the rollout. Can we align on those three things right now?"

---

## AFTER THE MEETING
Send within 2 hours: one paragraph summarizing the decision, the enterprise data agreement, the ROI model, and a proposed rollout timeline.
If Robert is still uncertain: schedule 30 minutes with him alone. Let him voice the headcount concern directly. That conversation is easier without David and Linda in the room.`

interface DemoModeProps {
  onExit: () => void
}

export default function DemoMode({ onExit }: DemoModeProps) {
  const [messages, setMessages] = useState<{ type: string; text: string }[]>([])
  const [showRunbook, setShowRunbook] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [started, setStarted] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [typingText, setTypingText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping, typingText])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const typeMessage = (text: string, onDone: () => void) => {
    let i = 0
    setTypingText('')
    const interval = setInterval(() => {
      i++
      setTypingText(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(interval)
        onDone()
      }
    }, 18)
  }

  const runStep = (step: number) => {
    if (step >= DEMO_SCRIPT.length) {
      setIsTyping(false)
      setShowRunbook(true)
      return
    }

    const s = DEMO_SCRIPT[step]

    timeoutRef.current = setTimeout(() => {
      if (s.type === 'agent') {
        setIsTyping(true)
        setTypingText('')
        typeMessage(s.text, () => {
          setIsTyping(false)
          setMessages(prev => [...prev, { type: 'agent', text: s.text }])
          setTypingText('')
          setCurrentStep(step + 1)
          runStep(step + 1)
        })
      } else {
        setIsTyping(true)
        setTypingText('')
        typeMessage(s.text, () => {
          setIsTyping(false)
          setMessages(prev => [...prev, { type: 'user', text: s.text }])
          setTypingText('')
          setCurrentStep(step + 1)
          runStep(step + 1)
        })
      }
    }, s.delay)
  }

  const startDemo = () => {
    setStarted(true)
    runStep(0)
  }

  const completedAgentMessages = messages.filter(m => m.type === 'agent').length
  const progress = Math.min(Math.round((completedAgentMessages / 5) * 100), 100)

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-accent rounded-sm flex items-center justify-center">
            <span className="text-ink font-display font-black text-sm">D</span>
          </div>
          <span className="font-display font-bold text-paper text-lg tracking-tight">DemoReady</span>
          <span className="text-muted text-xs font-mono border border-border rounded-full px-3 py-0.5">Demo Mode</span>
        </div>
        <button onClick={onExit} className="text-xs font-mono text-muted hover:text-accent transition-colors">
          Exit demo
        </button>
      </header>

      {!showRunbook ? (
        <>
          {started && (
            <div className="px-6 py-2 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-0.5 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-500"
                    style={{ width: progress + '%' }}
                  />
                </div>
                <span className="text-muted text-xs font-mono">{progress}%</span>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
            <div className="max-w-2xl mx-auto">
              {!started && (
                <div className="flex flex-col items-center justify-center h-full py-24 animate-fade-up">
                  <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-6">
                    <span className="text-ink font-display font-black text-xl">D</span>
                  </div>
                  <h2 className="font-display font-bold text-paper text-2xl mb-3 text-center">See DemoReady in action</h2>
                  <p className="text-muted text-sm font-body text-center max-w-sm mb-8 leading-relaxed">
                    Watch a full prep session for a high-stakes enterprise demo. No input needed — just watch.
                  </p>
                  <button
                    onClick={startDemo}
                    className="bg-accent text-ink font-display font-bold text-sm px-8 py-3 rounded-xl hover:bg-orange-500 transition-colors"
                  >
                    Start demo →
                  </button>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={'flex mb-4 animate-fade-up ' + (msg.type === 'user' ? 'justify-end' : 'gap-3')}>
                  {msg.type === 'agent' && (
                    <div className="w-6 h-6 bg-accent rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-ink font-display font-black text-xs">D</span>
                    </div>
                  )}
                  <div className={'max-w-[80%] px-4 py-3 rounded-2xl text-sm font-body leading-relaxed ' +
                    (msg.type === 'user'
                      ? 'bg-accent text-ink rounded-tr-sm font-medium'
                      : 'bg-surface text-paper rounded-tl-sm')}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {isTyping && typingText && (
                <div className={'flex mb-4 animate-fade-up ' + (DEMO_SCRIPT[currentStep - 1]?.type === 'user' || (currentStep < DEMO_SCRIPT.length && DEMO_SCRIPT[currentStep]?.type === 'user') ? 'justify-end' : 'gap-3')}>
                  {!(DEMO_SCRIPT[currentStep - 1]?.type === 'user') && currentStep > 0 && DEMO_SCRIPT[currentStep - 1]?.type === 'agent' && (
                    <div className="w-6 h-6 bg-accent rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-ink font-display font-black text-xs">D</span>
                    </div>
                  )}
                  {DEMO_SCRIPT[currentStep > 0 ? currentStep - 1 : 0]?.type === 'agent' && (
                    <div className="w-6 h-6 bg-accent rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-ink font-display font-black text-xs">D</span>
                    </div>
                  )}
                  <div className={'max-w-[80%] px-4 py-3 rounded-2xl text-sm font-body leading-relaxed ' +
                    (DEMO_SCRIPT[currentStep > 0 ? currentStep - 1 : 0]?.type === 'user'
                      ? 'bg-accent text-ink rounded-tr-sm font-medium'
                      : 'bg-surface text-paper rounded-tl-sm')}>
                    {typingText}<span className="animate-pulse">|</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 animate-fade-up">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-accent rounded-sm flex items-center justify-center">
                <span className="text-ink font-display font-black text-xs">D</span>
              </div>
              <span className="text-muted text-xs font-mono uppercase tracking-widest">Runbook Generated</span>
            </div>
            <div className="border border-border rounded-2xl p-6 bg-surface">
              <div className="runbook-content" dangerouslySetInnerHTML={{ __html: RUNBOOK
                .replace(/## ([^\n]+)/g, '<h2>$1</h2>')
                .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
                .replace(/^---$/gm, '<hr style="border-color:#2A2A38;margin:16px 0"/>')
                .replace(/\n\n/g, '</p><p>')
              }} />
              <button
                onClick={() => navigator.clipboard.writeText(RUNBOOK)}
                className="mt-4 text-xs font-mono text-muted hover:text-accent transition-colors border border-border hover:border-accent rounded-lg px-3 py-1.5"
              >
                Copy runbook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
