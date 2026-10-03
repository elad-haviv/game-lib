import { useEffect, useRef, useState } from 'react'
import { LETTERS, BRUSH_COLORS } from './data'

type Pt = [number, number]
const STORE_KEY = 'letter-strokes-v1'

// עורך האותיות: מציירים מעל גליף אמיתי, העריכות נשמרות במכשיר (localStorage),
// והייצוא כולל את כל 22 האותיות — כולל העריכות שנשמרו
function loadSaved(): Record<string, string[]> {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || '{}')
  } catch { return {} }
}

export default function StrokeEditor() {
  const [char, setChar] = useState('א')
  const [color, setColor] = useState('#e74c3c')
  const [strokes, setStrokes] = useState<string[]>([])
  const [cur, setCur] = useState<Pt[]>([])
  const [copied, setCopied] = useState(false)
  const [savedMap, setSavedMap] = useState<Record<string, string[]>>(loadSaved)
  const [glyphOn, setGlyphOn] = useState(true)
  const svgRef = useRef<SVGSVGElement>(null)
  const drawing = useRef(false)

  // בעת החלפת אות: טעינת השרטוט השמור אם יש, אחרת המקורי
  useEffect(() => {
    setStrokes(savedMap[char] ?? LETTERS.find((l) => l.char === char)!.strokes)
    setCur([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [char])

  function saveCurrent(next: string[]) {
    const m = { ...savedMap, [char]: next }
    setSavedMap(m)
    try { localStorage.setItem(STORE_KEY, JSON.stringify(m)) } catch { /* אין מקום */ }
  }

  function toSvg(e: React.PointerEvent): Pt {
    const el = svgRef.current!
    const r = el.getBoundingClientRect()
    const k = Math.min(r.width, r.height) / 114
    const ox = (r.width - 114 * k) / 2
    const oy = (r.height - 114 * k) / 2
    return [(e.clientX - r.left - ox) / k - 7, (e.clientY - r.top - oy) / k - 7]
  }

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
    if (cur.length > 2) {
      const next = [...strokes, fmt(simplify(cur))]
      setStrokes(next)
      saveCurrent(next)
    }
    setCur([])
  }

  function undo() {
    const next = strokes.slice(0, -1)
    setStrokes(next)
    saveCurrent(next)
  }

  function clearAll() {
    setStrokes([])
    saveCurrent([])
  }

  function resetToOriginal() {
    const orig = LETTERS.find((l) => l.char === char)!.strokes
    setStrokes(orig)
    const m = { ...savedMap }
    delete m[char]
    setSavedMap(m)
    try { localStorage.setItem(STORE_KEY, JSON.stringify(m)) } catch { /* ignore */ }
  }

  // הייצוא: כל האותיות — ערוכות מהמכשיר אם קיימות, אחרת המקור
  const output = JSON.stringify(
    Object.fromEntries(
      LETTERS.map((l) => [l.char, savedMap[l.char] ?? l.strokes]),
    ),
  )

  const editedCount = LETTERS.filter((l) => savedMap[l.char]?.length).length
  const isEdited = !!savedMap[char]?.length

  return (
    <>
      <div className="letter-toolbar" style={{ flexWrap: 'wrap' }}>
        <button className="tool-btn" onClick={undo}>↩️ בטל קו</button>
        <button className="tool-btn" onClick={clearAll}>🗑️ נקה</button>
        <button className="tool-btn" onClick={resetToOriginal}>🔄 מקורי</button>
        <button className="tool-btn" onClick={() => setGlyphOn((g) => !g)}>{glyphOn ? '🙈 הסתר רקע' : '👁️ הצג רקע'}</button>
        <button className="tool-btn" onClick={async () => {
          try { await navigator.clipboard.writeText(output) } catch { /* fallback */ }
          setCopied(true)
          setTimeout(() => setCopied(false), 2500)
        }}>{copied ? '✅ הועתק!' : `📋 העתק (${editedCount}/22 נערכו)`}</button>
      </div>
      <div className="palette">
        {BRUSH_COLORS.map((c) => (
          <button key={c} className={`palette-btn ${c === color ? 'active' : ''}`} style={{ background: c }} onClick={() => setColor(c)} aria-label="צבע" />
        ))}
      </div>
      <div className="trace-wrap">
        <svg ref={svgRef} viewBox="-7 -7 114 114" className="trace-svg"
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
          {glyphOn && (
            <text x="50" y="88" textAnchor="middle" fontSize="120" fill="#d8d3e8" style={{ fontWeight: 900, fontFamily: 'Heebo, sans-serif' }}>{char}</text>
          )}
          {strokes.map((d, i) => (
            <path key={i} d={d} fill="none" stroke={i === strokes.length - 1 ? color : '#ffffffcc'} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          ))}
          <polyline points={cur.map((p) => p.join(',')).join(' ')} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="letter-toolbar" style={{ flexWrap: 'wrap' }}>
        {LETTERS.map((l) => (
          <button key={l.char}
            className={`tool-btn ${l.char === char ? 'sel' : ''} ${savedMap[l.char]?.length ? 'edited' : ''}`}
            style={{ minWidth: 44, padding: '8px 0', position: 'relative' }}
            onClick={() => setChar(l.char)}>
            {l.char}
            {savedMap[l.char]?.length ? <span className="edited-dot" /> : null}
          </button>
        ))}
      </div>
      <div className="trace-hint">ציירו מעל האות לפי סדר הכתיבה • העריכות נשמרות אוטומטית במכשיר {isEdited ? '• ✏️ אות זו נערכה' : ''}</div>
      {copied && <div className="trace-hint" style={{ color: 'var(--win)', fontWeight: 900 }}>הועתק! שלחו לאבא את כל ה-JSON 📋</div>}
    </>
  )
}