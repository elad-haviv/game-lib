import { useMemo, useRef, useState } from 'react'
import { LETTERS, BRUSH_COLORS } from './data'

type Pt = [number, number]

const TOL = 14          // סטייה מותרת מהמסלול (יחידות SVG)
const START_TOL = 17    // רדיוס התחלה מהנקודה הירוקה
const RESUME_TOL = 18   // המשך מקו קיים אחרי הרמת אצבע

function dist(a: Pt, b: Pt) {
  return Math.hypot(a[0] - b[0], a[1] - b[1])
}

// דגימת מסלול לנקודות צפופות
function samplePath(points: Pt[], step = 1.5): Pt[] {
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

// המרת מיקום מסך (clientX/Y) לקואורדינטות ה-viewBox (0-100, כולל שוליים של 10)
function toSvg(e: React.PointerEvent, el: SVGSVGElement): Pt {
  const r = el.getBoundingClientRect()
  const k = Math.min(r.width, r.height) / 120 // קנה מידה של ה-viewBox המרובע
  const ox = (r.width - 120 * k) / 2
  const oy = (r.height - 120 * k) / 2
  return [
    (e.clientX - r.left - ox) / k - 10,
    (e.clientY - r.top - oy) / k - 10,
  ]
}

export default function TraceLetters() {
  const [letterIdx, setLetterIdx] = useState(0)
  const [strokeIdx, setStrokeIdx] = useState(0)
  const [color, setColor] = useState(BRUSH_COLORS[3])
  const [trace, setTrace] = useState<Pt[]>([])
  const [progress, setProgress] = useState(0) // 0..1 התקדמות בקו הנוכחי
  const [shake, setShake] = useState(false)
  const [celebrate, setCelebrate] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)
  const tracing = useRef(false)
  const progressRef = useRef(0)

  const letter = LETTERS[letterIdx]
  const stroke = letter.strokes[strokeIdx]
  const dense = useMemo(() => samplePath(stroke), [letterIdx, strokeIdx])

  function resetStroke() {
    setTrace([])
    progressRef.current = 0
    setProgress(0)
    tracing.current = false
    setShake(true)
    setTimeout(() => setShake(false), 350)
  }

  function gotoLetter(idx: number) {
    setLetterIdx(((idx % LETTERS.length) + LETTERS.length) % LETTERS.length)
    setStrokeIdx(0)
    setTrace([])
    progressRef.current = 0
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
    progressRef.current = 0
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
    // המשך מקו קיים אחרי הרמת אצבע — ליד הנקודה האחרונה שצוירה
    if (trace.length > 1 && dist(p, trace[trace.length - 1]) <= RESUME_TOL) {
      tracing.current = true
      return
    }
    // התחלה חדשה — ליד העיגול הירוק
    if (trace.length === 0 && dist(p, stroke[0]) <= START_TOL) {
      try { el.setPointerCapture(e.pointerId) } catch { /* synthetic pointer */ }
      tracing.current = true
      setTrace([stroke[0]])
      progressRef.current = 0
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
    const from = Math.max(0, Math.floor(progressRef.current * dense.length) - 10)
    for (let i = from; i < dense.length; i++) {
      const d = dist(p, dense[i])
      if (d < best) { best = d; bestIdx = i }
    }
    if (best > TOL) { resetStroke(); return }
    setTrace((t) => [...t, p])
    progressRef.current = Math.max(progressRef.current, bestIdx / (dense.length - 1))
    setProgress(progressRef.current)
    if (bestIdx >= dense.length - 3 && dist(p, stroke[stroke.length - 1]) <= TOL) completeStroke()
  }

  function onUp() {
    tracing.current = false // אפשר להרים את האצבע ולהמשיך מאיפה שהפסיקו
  }

  const strokeNum = strokeIdx + 1

  return (
    <>
      <div className="letter-toolbar">
        <button className="tool-btn" onClick={() => gotoLetter(letterIdx - 1)}>➡️</button>
        <button className="tool-btn" onClick={speak}>🔊</button>
        <button className="tool-btn" onClick={() => gotoLetter(letterIdx + 1)}>⬅️</button>
      </div>
      <div className="palette">
        {BRUSH_COLORS.map((c) => (
          <button key={c} className={`palette-btn ${c === color ? 'active' : ''}`} style={{ background: c }} onClick={() => setColor(c)} aria-label="צבע" />
        ))}
      </div>
      <div className={`trace-wrap ${shake ? 'shake' : ''}`}>
        <svg ref={svgRef} viewBox="-7 -7 114 114" className="trace-svg"
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
          {letter.strokes.map((s, i) => (
            <polyline key={i} points={s.map((p) => p.join(',')).join(' ')}
              fill="none" stroke="#ddd0f0" strokeWidth="17" strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {letter.strokes.slice(0, strokeIdx).map((s, i) => (
            <polyline key={`done-${i}`} points={s.map((p) => p.join(',')).join(' ')}
              fill="none" stroke={color} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
          ))}
          <polyline points={letter.strokes[strokeIdx].map((p) => p.join(',')).join(' ')}
            fill="none" stroke="#8e44ad" strokeWidth="7" strokeLinecap="round" strokeDasharray="6 8" opacity="0.9" />
          <polyline points={trace.map((p) => p.join(',')).join(' ')} fill="none" stroke={color} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={stroke[0][0]} cy={stroke[0][1]} r="7" fill="#2ecc40" />
          <circle cx={stroke[stroke.length - 1][0]} cy={stroke[stroke.length - 1][1]} r="7" fill="#ff3b30" />
        </svg>
        <div className="trace-progress"><div style={{ width: `${progress * 100}%` }} /></div>
      </div>
      <div className="trace-hint">
        קו {strokeNum} מתוך {letter.strokes.length} — התחילו מהעיגול הירוק 🟢 וגמרו באדום 🔴
      </div>
      {celebrate && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-emoji">🌟🎉</div>
            <div className="modal-title">כל הכבוד!</div>
            <div className="modal-score">כתבת את האות {letter.char} ({letter.name})</div>
            <button className="modal-play" onClick={() => gotoLetter(letterIdx + 1)}>➡️ האות הבאה</button>
          </div>
        </div>
      )}
    </>
  )
}