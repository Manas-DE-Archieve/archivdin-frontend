import { useState, useRef, useEffect } from 'react'
import { voiceApi, chatApi } from '../api'
import { useAuth } from '../hooks/useAuth'

const STATES = {
  IDLE: 'idle',
  RECORDING: 'recording',
  THINKING: 'thinking',
  SPEAKING: 'speaking',
}

function SoraBall({ state }) {
  return (
    <div className="sora-wrapper">
      <div className={`sora-ring sora-ring2 ${state !== STATES.IDLE ? 'ring-active' : ''} ${state === STATES.THINKING ? 'ring-thinking' : ''}`} />
      <div className={`sora-ring sora-ring1 ${state !== STATES.IDLE ? 'ring-active' : ''} ${state === STATES.THINKING ? 'ring-thinking ring-thinking-reverse' : ''}`} />
      <div className={`sora-ball sora-ball--${state}`} />

      <style>{`
        .sora-wrapper {
          position: relative;
          width: 200px;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .sora-ball {
          width: 130px;
          height: 130px;
          border-radius: 50%;
          background: radial-gradient(circle at 36% 34%, #c4b5fd, #7c3aed 52%, #3b0764);
          position: relative;
          z-index: 2;
          transition: filter 0.4s ease;
        }
        .sora-ball::after {
          content: '';
          position: absolute;
          top: 16px; left: 20px;
          width: 30px; height: 18px;
          background: rgba(255,255,255,0.25);
          border-radius: 50%;
          transform: rotate(-28deg);
        }
        .sora-ball--idle {
          animation: soraIdle 3.5s ease-in-out infinite;
        }
        .sora-ball--recording {
          animation: soraRecording 0.38s ease-in-out infinite;
          filter: brightness(1.15) saturate(1.2);
        }
        .sora-ball--thinking {
          animation: soraIdle 1.1s ease-in-out infinite;
          filter: brightness(0.75) saturate(0.8);
        }
        .sora-ball--speaking {
          animation: soraSpeaking 0.45s ease-in-out infinite;
          filter: brightness(1.2) saturate(1.3);
        }

        @keyframes soraIdle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.055); }
        }
        @keyframes soraRecording {
          0%, 100% { transform: scale(1.04) translateY(-2px); }
          50% { transform: scale(0.97) translateY(2px); }
        }
        @keyframes soraSpeaking {
          0%, 100% { transform: scale(1.05) translateY(-3px); }
          50% { transform: scale(0.96) translateY(3px); }
        }

        .sora-ring {
          position: absolute;
          border-radius: 50%;
          border: 1.5px solid transparent;
        }
        .sora-ring1 { width: 160px; height: 160px; }
        .sora-ring2 { width: 190px; height: 190px; }

        .ring-active.sora-ring1 {
          border-color: rgba(167, 139, 250, 0.45);
          animation: soraWave 1.1s ease-out infinite;
        }
        .ring-active.sora-ring2 {
          border-color: rgba(167, 139, 250, 0.22);
          animation: soraWave 1.1s ease-out 0.38s infinite;
        }
        @keyframes soraWave {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.35); opacity: 0; }
        }

        .ring-thinking.sora-ring1 {
          border-color: rgba(167, 139, 250, 0.45);
          border-top-color: transparent;
          animation: soraThink 1.0s linear infinite !important;
        }
        .ring-thinking.sora-ring2 {
          border-color: rgba(167, 139, 250, 0.22);
          border-bottom-color: transparent;
          animation: soraThink 1.6s linear infinite !important;
        }
        .ring-thinking-reverse {
          animation-direction: reverse !important;
        }
        @keyframes soraThink {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

const STATE_LABELS = {
  [STATES.IDLE]: 'Нажмите и удержите микрофон',
  [STATES.RECORDING]: '🔴 Запись... отпустите чтобы отправить',
  [STATES.THINKING]: 'Думаю...',
  [STATES.SPEAKING]: 'Говорю... нажмите чтобы остановить',
}

export default function VoiceChatPage() {
  const { user } = useAuth()
  const [appState, setAppState] = useState(STATES.IDLE)
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const [error, setError] = useState('')

  const mediaRecRef = useRef(null)
  const chunksRef = useRef([])
  const audioRef = useRef(null)

  const startRecording = async () => {
    if (appState !== STATES.IDLE) return
    setError('')
    setTranscript('')
    setResponse('')
    chunksRef.current = []
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        await processAudio(blob)
      }
      mr.start()
      mediaRecRef.current = mr
      setAppState(STATES.RECORDING)
    } catch {
      setError('Нет доступа к микрофону')
    }
  }

  const stopRecording = () => {
    if (appState !== STATES.RECORDING || !mediaRecRef.current) return
    mediaRecRef.current.stop()
    mediaRecRef.current = null
    setAppState(STATES.THINKING)
  }

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setAppState(STATES.IDLE)
  }

  const processAudio = async (blob) => {
    setAppState(STATES.THINKING)
    try {
      // 1. Speech → Text
      const text = await voiceApi.transcribe(blob)
      if (!text) { setAppState(STATES.IDLE); return }
      setTranscript(text)

      // 2. Chat
      const { data: session } = await chatApi.createSession()
      const token = localStorage.getItem('access_token') || ''
      const res = await fetch(`/api/chat/sessions/${session.id}/message`, {
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
            if (p.type === 'token') { answer += p.data; setResponse(answer) }
          } catch {}
        }
      }

      // 3. Text → Speech
      const audioUrl = await voiceApi.synthesize(answer)
      const audio = new Audio(audioUrl)
      audioRef.current = audio
      audio.onplay = () => setAppState(STATES.SPEAKING)
      audio.onended = () => { audioRef.current = null; setAppState(STATES.IDLE) }
      audio.onerror = () => { audioRef.current = null; setAppState(STATES.IDLE) }
      await audio.play()
    } catch (e) {
      setError('Ошибка: ' + e.message)
      setAppState(STATES.IDLE)
    }
  }

  const handleMicClick = () => {
    if (appState === STATES.SPEAKING) { stopSpeaking(); return }
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 3.5rem)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '2rem',
      padding: '2rem 1rem',
      background: 'var(--color-bg, #f8fafc)',
    }}>

      <SoraBall state={appState} />

      <p style={{
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        minHeight: 24,
        letterSpacing: '0.02em',
      }}>
        {STATE_LABELS[appState]}
      </p>

      {/* Transcript */}
      {transcript && (
        <div style={{
          maxWidth: 420,
          width: '100%',
          background: '#f1f5f9',
          borderRadius: 14,
          padding: '0.75rem 1.1rem',
          fontSize: 14,
          color: '#334155',
          lineHeight: 1.6,
          textAlign: 'center',
          border: '0.5px solid #e2e8f0',
        }}>
          <span style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>ВЫ</span>
          {transcript}
        </div>
      )}

      {/* Mic button */}
      <button
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onTouchStart={e => { e.preventDefault(); startRecording() }}
        onTouchEnd={e => { e.preventDefault(); stopRecording() }}
        onClick={handleMicClick}
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          border: appState === STATES.RECORDING ? '2px solid #7c3aed' : '0.5px solid #cbd5e1',
          background: appState === STATES.RECORDING
            ? '#7c3aed'
            : appState === STATES.SPEAKING
            ? '#fef3c7'
            : '#ffffff',
          color: appState === STATES.RECORDING ? '#fff' : '#7c3aed',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          boxShadow: appState === STATES.RECORDING
            ? '0 0 0 10px rgba(124,58,237,0.12)'
            : 'none',
          flexShrink: 0,
        }}
        title="Удержите для записи"
      >
        {appState === STATES.SPEAKING ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <rect x="5" y="4" width="5" height="16" rx="1"/>
            <rect x="14" y="4" width="5" height="16" rx="1"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        )}
      </button>

      {/* Response */}
      {response && (
        <div style={{
          maxWidth: 420,
          width: '100%',
          background: '#ffffff',
          borderRadius: 14,
          padding: '0.85rem 1.1rem',
          fontSize: 14,
          color: '#1e293b',
          lineHeight: 1.7,
          border: '0.5px solid #e2e8f0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          <span style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>ОТВЕТ</span>
          {response}
        </div>
      )}

      {error && (
        <p style={{ fontSize: 13, color: '#ef4444', textAlign: 'center' }}>{error}</p>
      )}

      {!user && (
        <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
          Войдите в аккаунт для использования чата
        </p>
      )}
    </div>
  )
}