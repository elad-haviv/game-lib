import { useEffect, useRef, useState } from 'react'
import { LETTERS, BRUSH_COLORS } from './data'

type Pt = [number, number]

// מהדורת האותיות: מציירים מעל גליף אמיתי מהפונט, ומייצאים JSON להכנסה ל-data.ts
export default function StrokeEditor() {
  const [char, setChar] = useState('א')
  const [color, setColor] = useState('#e74c3c')
  const [strokes, setStrokes] = useState<string[]>([])
  const [cur, setCur] = useState<Pt[]>([])
  const [copied, setCopied] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)
  const drawing = useRef(false)

  // ניקוי בעת החלפת אות
  useEffect(() => { setStrokes([]); setCur([]) }, [char])

  function toSvg(e: React.PointerEvent): Pt {
    const el = svgRef.current!
    const r = el.getBoundingClientRect()
    const k = Math.min(r.width, r.height) / 114
    const ox = (r.width - 114 * k) / 2
    const oy = (r.height - 114 * k) / 2
    return [(e.clientX - r.left - ox) / k - 7, (e.clientY - r.top - oy) / k - 7]
  }

  // דחיסה: נקודה כל 2.5 יחידות בערך + עיגול לעשירית
  function simplify(pts: Pt[]): Pt[] {
    const out: Pt[] = [pts[0]]
    for (const p of pts) {
      const l = out[out.length - 1]
      if (Math.hypot(p[0] - l[0], p[1] - l[1]) >= 2.5) out.push(p)
    }
    return out.map(([x, y]) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10] as Pt)
  }

  function fmt(pts: Pt[]): string {
    return 'M' + pts.map(([x, y]) => `${x},${y}`).join(' L')
  }

  function onDown(e: React.PointerEvent) {
    const el = svgRef.current!
    try { el.setPointerCapture(e.pointerId) } catch { /* ignore */ }
    drawing.current = true
    setCur([toSvg(e)])
  }
  function onMove(e: React.PointerEvent) {
    if (!drawing.current) return
    setCur((c) => [...c, toSvg(e)])
  }
  function onUp() {
    if (!drawing.current) return
    drawing.current = false
    if (cur.length > 2) setStrokes((s) => [...s, fmt(simplify(cur))])
    setCur([])
  }

  const output = JSON.stringify(
    Object.fromEntries(
      LETTERS.map((l) => [l.char, l.char === char ? strokes : l.strokes]),
    ),
  )

  return (
    <>
      <div className="letter-toolbar" style={{ flexWrap: 'wrap' }}>
        <button className="tool-btn" onClick={() => setStrokes((s) => s.slice(0, -1))}>↩️ בטל קו</button>
        <button className="tool-btn" onClick={() => setStrokes([])}>🗑️ נקה הכל</button>
        <button className="tool-btn" onClick={async () => {
          await navigator.clipboard?.writeText(output)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        }}>{copied ? '✅ הועתק!' : '📋 העתק JSON'}</button>
      </div>
      <div className="palette">
        {BRUSH_COLORS.map((c) => (
          <button key={c} className={`palette-btn ${c === color ? 'active' : ''}`} style={{ background: c }} onClick={() => setColor(c)} aria-label="צבע" />
        ))}
      </div>
      <div className="trace-wrap">
        <svg ref={svgRef} viewBox="-7 -7 114 114" className="trace-svg"
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
          <text x="50" y="88" textAnchor="middle" fontSize="120" fill="#d8d3e8" style={{ fontWeight: 900, fontFamily: 'Heebo, sans-serif' }}>{char}</text>
          {strokes.map((d, i) => (
            <path key={i} d={d} fill="none" stroke={i === strokes.length - 1 ? color : '#ffffffaa'} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          ))}
          <polyline points={cur.map((p) => p.join(',')).join(' ')} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="letter-toolbar" style={{ flexWrap: 'wrap' }}>
        {LETTERS.map((l) => (
          <button key={l.char} className={`tool-btn ${l.char === char ? 'sel' : ''}`} style={{ minWidth: 44, padding: '8px 0' }}
            onClick={() => setChar(l.char)}>{l.char}</button>
        ))}
      </div>
      <div className="trace-hint">ציירו את הקווים מעל האות, לפי סדר הכתיבה. סיימתם? העתיקו ושלחו לאבא 📋</div>
      {copied && <div className="trace-hint" style={{ color: 'var(--win)', fontWeight: 900 }}>הועתק ללוח — שלחו אותו לאבא!</div>}
    </>
  )
}