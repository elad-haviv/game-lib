import { useMemo, useRef, useState } from 'react'
import { LETTERS, BRUSH_COLORS } from './data'

type Pt = [number, number]

const TOL = 13          // סטייה מותרת מהמסלול (יחידות SVG)
const START_TOL = 16    // רדיוס התחלה מהנקודה הירוקה

function dist(a: Pt, b: Pt) {
  return Math.hypot(a[0] - b[0], a[1] - b[1])
}

// דגימת מסלול לנקודות צפופות
function samplePath(points: Pt[], step = 1.2): Pt[] {
  const out: Pt[] = [points[0]]
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1]
    const [x1, y1] = points[i]
    const d = Math.hypot(x1 - x0, y1 - y0)
    const n = Math.max(1, Math.ceil(d / step))
    for (let j = 1; j <= n; j++) out.push([x0 + ((x1 - x0) * j) / n, y0 + ((y1 - y0) * j) / n])
  }
  return out
}

function toSvg(e: React.PointerEvent, el: SVGSVGElement): Pt {
  const r = el.getBoundingClientRect()
  const s = 100 / Math.min(r.width, r.height)
  return [
    ((e.clientX - r.left) - (r.width - r.height) / 2) * s,
    (e.clientY - r.top) * s,
  ]
}

export default function TraceLetters() {
  const [letterIdx, setLetterIdx] = useState(0)
  const [strokeIdx, setStrokeIdx] = useState(0)
  const [color, setColor] = useState(BRUSH_COLORS[3])
  const [trace, setTrace] = useState<Pt[]>([])
  const [progress, setProgress] = useState(0) // 0..1 התקדמות באות הנוכחית
  const [shake, setShake] = useState(false)
  const [celebrate, setCelebrate] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)
  const tracing = useRef(false)

  const letter = LETTERS[letterIdx]
  const stroke = letter.strokes[strokeIdx]
  const dense = useMemo(() => samplePath(stroke), [letterIdx, strokeIdx])

  function resetStroke() {
    setTrace([])
    setProgress(0)
    tracing.current = false
    setShake(true)
    setTimeout(() => setShake(false), 350)
  }

  function nextLetter() {
    setLetterIdx((i) => (i + 1) % LETTERS.length)
    setStrokeIdx(0)
    setTrace([])
    setProgress(0)
    setCelebrate(false)
  }

  function speak() {
    try {
      const u = new SpeechSynthesisUtterance(letter.name)
      u.lang = 'he-IL'
      speechSynthesis.cancel()
      speechSynthesis.speak(u)
    } catch { /* אין קול */ }
  }

  function completeStroke() {
    tracing.current = false
    setTrace([])
    setProgress(0)
    if (strokeIdx + 1 < letter.strokes.length) {
      setStrokeIdx((s) => s + 1)
    } else {
      setCelebrate(true)
      speak()
    }
  }

  function onDown(e: React.PointerEvent) {
    if (celebrate) return
    const el = svgRef.current
    if (!el) return
    const p = toSvg(e, el)
    if (dist(p, stroke[0]) <= START_TOL) {
      el.setPointerCapture(e.pointerId)
      tracing.current = true
      setTrace([stroke[0]])
      setProgress(0)
    }
  }

  function onMove(e: React.PointerEvent) {
    if (!tracing.current || celebrate) return
    const el = svgRef.current
    if (!el) return
    const p = toSvg(e, el)
    // מרחק מהמסלול — רק מנקודת ההתקדמות והלאה
    let best = Infinity
    let bestIdx = 0
    for (let i = Math.max(0, Math.floor(progress * dense.length) - 8); i < dense.length; i++) {
      const d = dist(p, dense[i])
      if (d < best) { best = d; bestIdx = i }
    }
    if (best > TOL) { resetStroke(); return }
    setTrace((t) => [...t, p])
    setProgress(Math.max(progress, bestIdx / (dense.length - 1)))
    if (bestIdx >= dense.length - 2 && dist(p, stroke[stroke.length - 1]) <= TOL) completeStroke()
  }

  function onUp() {
    if (tracing.current && trace.length > 0) resetStroke() // עזיבת המסלול באמצע = מתחילים מחדש
  }

  const showStart = strokeIdx < letter.strokes.length

  return (
    <>
      <div className="letter-toolbar">
        <button className="tool-btn" onClick={() => { setLetterIdx((letterIdx + LETTERS.length - 1) % LETTERS.length); setStrokeIdx(0); setTrace([]); setProgress(0); setCelebrate(false) }}>➡️</button>
        <button className="tool-btn" onClick={speak}>🔊</button>
        <button className="tool-btn" onClick={() => { setLetterIdx((letterIdx + 1) % LETTERS.length); setStrokeIdx(0); setTrace([]); setProgress(0); setCelebrate(false) }}>⬅️</button>
      </div>
      <div className="palette">
        {BRUSH_COLORS.map((c) => (
          <button key={c} className={`palette-btn ${c === color ? 'active' : ''}`} style={{ background: c }} onClick={() => setColor(c)} aria-label="צבע" />
        ))}
      </div>
      <div className={`trace-wrap ${shake ? 'shake' : ''}`}>
        <svg ref={svgRef} viewBox="-10 -10 120 120" className="trace-svg"
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
          <text x="50" y="86" textAnchor="middle" fontSize="110" fill="#ececf3" style={{ fontWeight: 900 }}>{letter.char}</text>
          {letter.strokes.map((s, i) => (
            <polyline key={i} points={s.map((p) => p.join(',')).join(' ')}
              fill="none" stroke={i === strokeIdx ? '#b9a8d8' : 'transparent'}
              strokeWidth="7" strokeLinecap="round" strokeDasharray="5 7" opacity={i === strokeIdx ? 0.9 : 0} />
          ))}
          <polyline points={trace.map((p) => p.join(',')).join(' ')} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          {showStart && (
            <>
              <circle cx={stroke[0][0]} cy={stroke[0][1]} r="7" fill="#2ecc40" />
              <circle cx={stroke[stroke.length - 1][0]} cy={stroke[stroke.length - 1][1]} r="7" fill="#ff3b30" />
            </>
          )}
        </svg>
        <div className="trace-progress"><div style={{ width: `${progress * 100}%` }} /></div>
      </div>
      <div className="trace-hint">התחילו מהעיגול הירוק 🟢 וגמרו באדום 🔴</div>
      {celebrate && (
        <div className="modal-overlay" onClick={nextLetter}>
          <div className="modal-card">
            <div className="modal-emoji">🌟🎉</div>
            <div className="modal-title">כל הכבוד!</div>
            <div className="modal-score">כתבת את האות {letter.char} ({letter.name})</div>
            <button className="modal-play" onClick={nextLetter}>➡️ האות הבאה</button>
          </div>
        </div>
      )}
    </>
  )
}