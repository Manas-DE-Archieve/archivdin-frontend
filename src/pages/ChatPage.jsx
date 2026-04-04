import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { chatApi, voiceApi } from '../api'
import SourceCard from '../components/SourceCard'
import { useAuth } from '../hooks/useAuth'

// ─── VAD thresholds ──────────────────────────────────────────────────────────
const SPEAK_THRESHOLD  = 20
const SILENCE_THRESHOLD = 14
const SILENCE_DELAY    = 1300

// ─── Components ──────────────────────────────────────────────────────────────
function SourcesToggle({ sources }) {
  const [open, setOpen] = useState(false)
  if (!sources?.length) return null
  return (
    <div className="mt-2">
      <button onClick={() => setOpen(v => !v)} className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
        <span className={`transition-transform duration-200 ${open ? 'rotate-90' : ''}`}>▶</span>
        Источники ({sources.length})
      </button>
      {open && (
        <div className="mt-1.5 space-y-1.5">
          {sources.map((s, j) => <SourceCard key={j} source={s} />)}
        </div>
      )}
    </div>
  )
}

function SpeakButton({ text }) {
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef(null)

  const toggle = async () => {
    if (playing) {
      audioRef.current?.pause()
      setPlaying(false)
      return
    }
    try {
      setPlaying(true)
      const url = await voiceApi.synthesize(text)
      const audio = new Audio(url)
      audioRef.current = audio
      audio.onended = () => setPlaying(false)
      audio.onerror = () => setPlaying(false)
      await audio.play()
    } catch { setPlaying(false) }
  }

  return (
    <button onClick={toggle} title={playing ? 'Остановить' : 'Прослушать'}
      style={{
        width: 26, height: 26, borderRadius: 8, border: 'none', cursor: 'pointer',
        background: playing ? '#e8f4fd' : 'transparent', color: playing ? '#3b9edb' : '#b0bec5',
        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', marginTop: 4,
      }}>
      {playing ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
      )}
    </button>
  )
}

function SoraOverlay({ voicePhase, lastTranscript, onClose }) {
  const labels = {
    waiting:  'Жду когда заговорите...',
    listening: 'Слушаю...',
    thinking: 'Думаю...',
    speaking: 'Говорю...',
  }
  const isWaving   = voicePhase === 'listening' || voicePhase === 'speaking'
  const isSpinning = voicePhase === 'thinking'
  const isWaiting  = voicePhase === 'waiting'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(10,18,36,0.88)', backdropFilter: 'blur(8px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.75rem',
    }}>
      <div style={{ position: 'relative', width: 210, height: 210, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', width: 196, height: 196, borderRadius: '50%', border: '1.5px solid transparent',
          ...(isWaving   ? { borderColor: 'rgba(167,139,250,0.22)', animation: 'sv-wave 1.1s ease-out 0.38s infinite' } : {}),
          ...(isSpinning ? { borderColor: 'rgba(167,139,250,0.2)', borderBottomColor: 'transparent', animation: 'sv-spin 1.7s linear reverse infinite' } : {}),
          ...(isWaiting  ? { borderColor: 'rgba(167,139,250,0.1)', animation: 'sv-wave 2.8s ease-out 0.9s infinite' } : {}),
        }} />
        <div style={{ position: 'absolute', width: 168, height: 168, borderRadius: '50%', border: '1.5px solid transparent',
          ...(isWaving   ? { borderColor: 'rgba(167,139,250,0.48)', animation: 'sv-wave 1.1s ease-out infinite' } : {}),
          ...(isSpinning ? { borderColor: 'rgba(167,139,250,0.45)', borderTopColor: 'transparent', animation: 'sv-spin 1.0s linear infinite' } : {}),
          ...(isWaiting  ? { borderColor: 'rgba(167,139,250,0.18)', animation: 'sv-wave 2.8s ease-out infinite' } : {}),
        }} />
        <div style={{
          width: 132, height: 132, borderRadius: '50%', zIndex: 2, position: 'relative',
          background: 'radial-gradient(circle at 36% 34%, #c4b5fd, #7c3aed 52%, #3b0764)',
          animation: voicePhase === 'listening' ? 'sv-bounce 0.38s ease-in-out infinite' : voicePhase === 'speaking' ? 'sv-bounce 0.46s ease-in-out infinite' : voicePhase === 'thinking' ? 'sv-pulse 1.1s ease-in-out infinite' : 'sv-breath 3.5s ease-in-out infinite',
          filter: voicePhase === 'thinking' ? 'brightness(0.72)' : voicePhase === 'listening' ? 'brightness(1.16) saturate(1.2)' : 'none',
          transition: 'filter 0.4s ease',
        }}>
          <div style={{ position: 'absolute', top: 17, left: 21, width: 30, height: 18, background: 'rgba(255,255,255,0.22)', borderRadius: '50%', transform: 'rotate(-28deg)' }} />
        </div>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 15, letterSpacing: '0.03em', minHeight: 22 }}>{labels[voicePhase]}</p>
      {lastTranscript && (
        <div style={{ maxWidth: 360, background: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: '0.6rem 1rem', fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, textAlign: 'center', border: '0.5px solid rgba(255,255,255,0.1)' }}>
          {lastTranscript}
        </div>
      )}
      <button onClick={onClose} style={{ marginTop: 4, padding: '0.55rem 1.8rem', borderRadius: 99, border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.75)', fontSize: 14, cursor: 'pointer' }}>
        Завершить
      </button>
      <style>{`
        @keyframes sv-breath  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.055)} }
        @keyframes sv-bounce  { 0%,100%{transform:scale(1.04) translateY(-3px)} 50%{transform:scale(0.97) translateY(3px)} }
        @keyframes sv-pulse   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
        @keyframes sv-wave    { 0%{transform:scale(1);opacity:.85} 100%{transform:scale(1.38);opacity:0} }
        @keyframes sv-spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  )
}

// ─── Main ChatPage ───────────────────────────────────────────────────────────
export default function ChatPage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  const [sessions, setSessions]       = useState([])
  const [sessionId, setSessionId]     = useState(null)
  const [messages, setMessages]       = useState([])
  const [input, setInput]             = useState('')
  const [streaming, setStreaming]     = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [recording, setRecording]     = useState(false)
  const [micError, setMicError]       = useState('')

  const [voiceOpen,      setVoiceOpen]      = useState(false)
  const [voicePhase,     setVoicePhase]     = useState('waiting')
  const [lastTranscript, setLastTranscript] = useState('')

  const bottomRef   = useRef(null)
  const textareaRef = useRef(null)
  const mediaRecRef = useRef(null)
  const chunksRef   = useRef([])

  const vadStreamRef     = useRef(null)
  const vadAnalyserRef   = useRef(null)
  const vadRafRef        = useRef(null)
  const vadRecRef        = useRef(null)
  const vadChunksRef     = useRef([])
  const vadSilenceTimer  = useRef(null)
  const vadActiveRef     = useRef(false)
  const vadSpeakingRef   = useRef(false)
  const vadProcessingRef = useRef(false)
  const vadAudioRef      = useRef(null)
  const sessionIdRef     = useRef(null)

  useEffect(() => { sessionIdRef.current = sessionId }, [sessionId])

  const loadSessions = useCallback(async () => {
    if (!user) return
    try {
      const { data } = await chatApi.listSessions({ page: 1, limit: 50 })
      setSessions(data.items || [])
    } catch {}
  }, [user])

  useEffect(() => {
    const init = async () => {
      await loadSessions()
      try {
        const { data } = await chatApi.createSession()
        setSessionId(data.id)
      } catch {}
    }
    init()
  }, [loadSessions])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const openSession = async (id) => {
    try {
      const { data } = await chatApi.getMessages(id)
      setMessages(data.map(m => ({ role: m.role, content: m.content, sources: m.sources })))
      setSessionId(id)
      setSidebarOpen(false)
    } catch {}
  }

  const newSession = async () => {
    try {
      const { data } = await chatApi.createSession()
      setSessionId(data.id)
      setMessages([])
      setSidebarOpen(false)
      await loadSessions()
    } catch {}
  }

  const sendMessage = async () => {
    if (!input.trim() || streaming || !sessionId) return
    const question = input.trim()
    setInput('')
    setStreaming(true)
    setMessages(prev => [
      ...prev,
      { role: 'user', content: question },
      { role: 'assistant', content: '', sources: null, _streaming: true },
    ])
    try {
      const token = localStorage.getItem('access_token')
      const res = await fetch(`/api/chat/sessions/${sessionId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content: question }),
      })
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const payload = JSON.parse(line.slice(6))
            if (payload.type === 'sources') {
              setMessages(prev => { const n=[...prev]; n[n.length-1]={...n[n.length-1],sources:payload.data}; return n })
            } else if (payload.type === 'token') {
              setMessages(prev => { const n=[...prev]; n[n.length-1]={...n[n.length-1],content:n[n.length-1].content+payload.data}; return n })
            } else if (payload.type === 'done') {
              setMessages(prev => { const n=[...prev]; n[n.length-1]={...n[n.length-1],_streaming:false}; return n })
              await loadSessions()
            }
          } catch {}
        }
      }
    } catch (e) {
      setMessages(prev => { const n=[...prev]; n[n.length-1]={role:'assistant',content:`Ошибка: ${e.message}`,_streaming:false}; return n })
    } finally {
      setStreaming(false)
      textareaRef.current?.focus()
    }
  }

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }

  const startRecording = async () => {
    setMicError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        try {
          const text = await voiceApi.transcribe(blob)
          setInput(prev => prev ? prev + ' ' + text : text)
          textareaRef.current?.focus()
        } catch { setMicError('Ошибка распознавания') }
      }
      mediaRecRef.current = mr
      mr.start()
      setRecording(true)
    } catch { setMicError('Нет доступа к микрофону') }
  }

  const stopRecording = () => { mediaRecRef.current?.stop(); setRecording(false) }

  const sendVoiceMessage = useCallback(async (blob) => {
    if (!vadActiveRef.current) return
    vadProcessingRef.current = true
    setVoicePhase('thinking')
    try {
      const text = await voiceApi.transcribe(blob)
      if (!text || !vadActiveRef.current) { vadProcessingRef.current = false; setVoicePhase('waiting'); return }
      setLastTranscript(text)
      setMessages(prev => [...prev, { role: 'user', content: text }, { role: 'assistant', content: '', sources: null, _streaming: true }])

      const sid = sessionIdRef.current
      const token = localStorage.getItem('access_token') || ''
      const res = await fetch(`/api/chat/sessions/${sid}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: text }),
      })

      let answer = ''
      const reader = res.body.getReader()
      const dec = new TextDecoder()
      let buf = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += dec.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop()
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const p = JSON.parse(line.slice(6))
            if (p.type === 'sources') { setMessages(prev => { const n=[...prev]; n[n.length-1]={...n[n.length-1],sources:p.data}; return n }) }
            else if (p.type === 'token') { answer += p.data; setMessages(prev => { const n=[...prev]; n[n.length-1]={...n[n.length-1],content:n[n.length-1].content+p.data}; return n }) }
            else if (p.type === 'done') { setMessages(prev => { const n=[...prev]; n[n.length-1]={...n[n.length-1],_streaming:false}; return n }); loadSessions() }
          } catch {}
        }
      }

      if (!vadActiveRef.current) { vadProcessingRef.current = false; return }
      if (answer) {
        const audioUrl = await voiceApi.synthesize(answer)
        if (!vadActiveRef.current) { vadProcessingRef.current = false; return }
        const audio = new Audio(audioUrl)
        vadAudioRef.current = audio
        setVoicePhase('speaking')
        audio.onended = () => { vadAudioRef.current = null; vadProcessingRef.current = false; if (vadActiveRef.current) setVoicePhase('waiting') }
        audio.onerror = () => { vadAudioRef.current = null; vadProcessingRef.current = false; if (vadActiveRef.current) setVoicePhase('waiting') }
        await audio.play()
      } else {
        vadProcessingRef.current = false; if (vadActiveRef.current) setVoicePhase('waiting')
      }
    } catch { vadProcessingRef.current = false; if (vadActiveRef.current) setVoicePhase('waiting') }
  }, [loadSessions])

  const startVADLoop = useCallback((stream, analyser) => {
    const dataArr = new Uint8Array(analyser.frequencyBinCount)
    const tick = () => {
      if (!vadActiveRef.current) return
      vadRafRef.current = requestAnimationFrame(tick)
      analyser.getByteTimeDomainData(dataArr)
      let sum = 0
      for (let i = 0; i < dataArr.length; i++) { const d = (dataArr[i] - 128) / 128; sum += d * d }
      const rms = Math.sqrt(sum / dataArr.length) * 100
      if (vadProcessingRef.current) return

      if (!vadSpeakingRef.current && rms > SPEAK_THRESHOLD) {
        vadSpeakingRef.current = true
        clearTimeout(vadSilenceTimer.current); vadSilenceTimer.current = null
        setVoicePhase('listening')
        vadChunksRef.current = []
        const mr = new MediaRecorder(stream)
        mr.ondataavailable = e => { if (e.data.size > 0) vadChunksRef.current.push(e.data) }
        mr.onstop = () => { const blob = new Blob(vadChunksRef.current, { type: 'audio/webm' }); sendVoiceMessage(blob) }
        mr.start()
        vadRecRef.current = mr
      } else if (vadSpeakingRef.current && rms > SPEAK_THRESHOLD) {
        clearTimeout(vadSilenceTimer.current); vadSilenceTimer.current = null
      } else if (vadSpeakingRef.current && rms < SILENCE_THRESHOLD) {
        if (!vadSilenceTimer.current) {
          vadSilenceTimer.current = setTimeout(() => {
            vadSilenceTimer.current = null; vadSpeakingRef.current = false
            if (vadRecRef.current && vadRecRef.current.state === 'recording') { vadRecRef.current.stop(); vadRecRef.current = null }
          }, SILENCE_DELAY)
        }
      }
    }
    vadRafRef.current = requestAnimationFrame(tick)
  }, [sendVoiceMessage])

  const openVoiceMode = useCallback(async () => {
    if (voiceOpen) return
    setMicError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const ctx = new AudioContext()
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      source.connect(analyser)
      vadStreamRef.current = stream; vadAnalyserRef.current = analyser; vadActiveRef.current = true; vadSpeakingRef.current = false; vadProcessingRef.current = false
      setVoicePhase('waiting'); setLastTranscript(''); setVoiceOpen(true)
      startVADLoop(stream, analyser)
    } catch { setMicError('Нет доступа к микрофону') }
  }, [voiceOpen, startVADLoop])

  const closeVoiceMode = useCallback(() => {
    vadActiveRef.current = false; cancelAnimationFrame(vadRafRef.current); clearTimeout(vadSilenceTimer.current); vadSilenceTimer.current = null
    if (vadRecRef.current && vadRecRef.current.state === 'recording') vadRecRef.current.stop(); vadRecRef.current = null
    vadStreamRef.current?.getTracks().forEach(t => t.stop()); vadStreamRef.current = null
    vadAudioRef.current?.pause(); vadAudioRef.current = null
    vadSpeakingRef.current = false; vadProcessingRef.current = false
    setVoiceOpen(false); setVoicePhase('waiting')
  }, [])

  useEffect(() => () => closeVoiceMode(), [closeVoiceMode])

  const fmtDate = (iso) => {
    const d = new Date(iso), today = new Date()
    if (d.toDateString() === today.toDateString()) return d.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('ru', { day: 'numeric', month: 'short' })
  }

  const titledSessions = sessions.filter(s => s.title)

  return (
    // Обертка: высота экрана минус Navbar. Relative важно для absolute позиционирования сайдбара!
    <div className="flex h-[calc(100dvh-3.5rem)] overflow-hidden relative w-full max-w-7xl mx-auto">
      
      {voiceOpen && <SoraOverlay voicePhase={voicePhase} lastTranscript={lastTranscript} onClose={closeVoiceMode} />}

      {/* Backdrop для мобильного сайдбара */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Сайдбар. На мобильных он absolute (поверх контента, но под шапкой), на десктопе relative */}
      <aside className={`
        absolute md:relative top-0 left-0 h-full z-50
        w-72 max-w-[85%] md:w-64 shrink-0
        bg-slate-50 border-r border-slate-200
        flex flex-col
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-slate-200 flex items-center gap-2 bg-white">
          <button onClick={newSession} className="flex-1 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-sm transition-all active:scale-95">
            + Новый диалог
          </button>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-3 text-slate-400 hover:bg-slate-100 rounded-xl">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto py-2 px-3">
          {titledSessions.length === 0 ? (
            <p className="text-xs text-slate-400 text-center mt-8">История пуста</p>
          ) : (
            titledSessions.map((s, i) => (
              <button key={s.id} onClick={() => openSession(s.id)}
                className={`w-full text-left px-3 py-3 rounded-xl mb-1 flex items-start gap-3 transition-colors ${s.id === sessionId ? 'bg-white shadow-sm border border-slate-100' : 'hover:bg-slate-200/50'}`}>
                <span className="text-slate-400 text-base leading-none mt-0.5">💬</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs truncate font-semibold leading-tight ${s.id === sessionId ? 'text-primary-700' : 'text-slate-700'}`}>
                    {s.title || `Диалог ${titledSessions.length - i}`}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">{fmtDate(s.created_at)}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        
        {/* Header чата */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-lg md:text-xl font-bold text-slate-800 truncate">{t('chat.title')}</h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">Ответы основаны на архивных документах</p>
          </div>

          <button onClick={openVoiceMode} title="ДОНАТЕЛЛО МИКИЛЯНДЖЕЛО" className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 transition-colors shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6a3 3 0 0 0-3 3v3a3 3 0 0 0 6 0V9a3 3 0 0 0-3-3z"/><path d="M8 15a5 5 0 0 0 8 0"/></svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center pb-20 opacity-80">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl mb-4">🗂</div>
              <p className="font-serif text-lg text-slate-600 mb-2">{t('chat.empty')}</p>
              <p className="text-xs text-slate-400 max-w-[260px]">Задайте вопрос об архивных документах или конкретных людях</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="shrink-0 w-8 h-8 rounded-xl bg-primary-800 flex items-center justify-center text-primary-200 text-xs font-serif font-bold">А</div>
              )}
              <div className={`max-w-[85%] md:max-w-[75%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-2xl px-4 py-3 text-[14px] md:text-sm leading-relaxed ${
                  msg.role === 'user' ? 'bg-primary-600 text-white rounded-tr-sm shadow-sm' : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-sm'
                }`}>
                  {msg.content || (msg._streaming && <span className="text-slate-400 italic text-xs">{t('chat.thinking')}</span>)}
                  {msg._streaming && msg.content && <span className="typing-cursor" />}
                </div>
                {msg.role === 'assistant' && !msg._streaming && msg.content && <SpeakButton text={msg.content} />}
                {msg.role === 'assistant' && <SourcesToggle sources={msg.sources} />}
              </div>
            </div>
          ))}
          <div ref={bottomRef} className="h-4" />
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-100 bg-white px-4 py-3 pb-6 md:p-6 md:pb-8 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.02)] z-20">
          <div className="max-w-4xl mx-auto flex items-end gap-2 sm:gap-3">
            
            <textarea
              ref={textareaRef}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all max-h-32 shadow-inner"
              rows={1}
              placeholder={t('chat.placeholder')}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={streaming}
            />

            <button
              onMouseDown={startRecording} onMouseUp={stopRecording} onTouchStart={e => { e.preventDefault(); startRecording() }} onTouchEnd={e => { e.preventDefault(); stopRecording() }}
              title="Удержите для записи" disabled={streaming}
              className={`w-12 h-12 flex items-center justify-center rounded-2xl shrink-0 transition-all ${
                recording 
                  ? 'bg-red-500 text-white scale-110 shadow-lg shadow-red-500/30' 
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
              }`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill={recording ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </button>

            <button onClick={sendMessage} disabled={streaming || !input.trim() || !sessionId}
              className="w-12 h-12 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-400 disabled:border-slate-200 border border-transparent text-white rounded-2xl flex items-center justify-center transition-all shrink-0 shadow-sm">
              {streaming ? (
                <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
              )}
            </button>

          </div>

          {/* Подсказка, которая создает дополнительный визуальный баланс снизу */}
          <p className="text-center text-[10px] text-slate-400 mt-3 md:mt-4 hidden sm:block">
            {recording 
              ? '🔴 Идёт запись — отпустите микрофон для отправки' 
              : 'Enter — отправить · Удержите микрофон для голосового ввода'
            }
          </p>
        </div>
      </div>
    </div>
  )
}