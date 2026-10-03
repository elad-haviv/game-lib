import { useEffect, useState } from 'react'

type Cell = 'X' | 'O' | ''
type Mode = 'comp' | '2p'

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]

export default function TicTacToe() {
  const [mode, setMode] = useState<Mode | null>(null)
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(''))
  const [turn, setTurn] = useState<Cell>('X')
  const [winner, setWinner] = useState<{ player: Cell; line: number[] } | null>(null)
  const [draw, setDraw] = useState(false)
  const [score, setScore] = useState({ x: 0, o: 0 })

  function newRound(m: Mode = mode!) {
    setMode(m)
    setBoard(Array(9).fill(''))
    setTurn('X')
    setWinner(null)
    setDraw(false)
  }

  function findWin(b: Cell[]): { player: Cell; line: number[] } | null {
    for (const line of WIN_LINES) {
      const [a, c, d] = line
      if (b[a] && b[a] === b[c] && b[a] === b[d]) return { player: b[a], line }
    }
    return null
  }

  function play(i: number, b: Cell[], t: Cell) {
    const nb = [...b]
    nb[i] = t
    setBoard(nb)
    const w = findWin(nb)
    if (w) {
      setWinner(w)
      setScore((s) => (w.player === 'X' ? { ...s, x: s.x + 1 } : { ...s, o: s.o + 1 }))
    } else if (nb.every((c) => c)) {
      setDraw(true)
    } else {
      setTurn(t === 'X' ? 'O' : 'X')
    }
  }

  function onCellClick(i: number) {
    if (board[i] || winner || draw) return
    if (mode === 'comp' && turn === 'O') return
    play(i, board, turn)
  }

  useEffect(() => {
    if (mode !== 'comp' || turn !== 'O' || winner || draw) return
    const empty = board.map((v, i) => (v === '' ? i : null)).filter((i) => i !== null) as number[]
    if (empty.length === 0) return
    const timer = setTimeout(() => play(empty[Math.floor(Math.random() * empty.length)], board, 'O'), 450)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, mode, board, winner, draw])

  if (!mode) {
    return (
      <div className="mode-card">
        <button className="vs-comp" onClick={() => newRound('comp')}>🤖 נגד המחשב</button>
        <button className="two-player" onClick={() => newRound('2p')}>👥 שני שחקנים</button>
      </div>
    )
  }

  const status = winner ? (
    <span style={{ color: 'var(--win)', fontWeight: 900 }}>{winner.player} ניצח!</span>
  ) : draw ? (
    <span style={{ color: '#888' }}>תיקו!</span>
  ) : (
    <>תור שחקן <span className={`dot ${turn.toLowerCase()}`} /> {turn}</>
  )

  return (
    <>
      <div className="status">{status}</div>
      <div className="score">
        <span>❌ {score.x}</span>
        <span>·</span>
        <span>⭕ {score.o}</span>
      </div>
      <div className="board">
        {board.map((c, i) => (
          <button
            key={i}
            onClick={() => onCellClick(i)}
            className={`${c ? `filled ${c.toLowerCase()}` : ''} ${winner?.line.includes(i) ? 'win-cell' : ''}`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="bottom">
        <button onClick={() => setMode(null)}>🔄 בחירת מצב</button>
        <button onClick={() => newRound()}>▶ משחק חדש</button>
      </div>
      {(winner || draw) && (
        <div className="modal-overlay" onClick={() => newRound()}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <img src="/mascot.png" alt="" style={{ width: 90, mixBlendMode: 'multiply' }} />
            <div className="modal-emoji">{winner ? (winner.player === 'X' ? '🎉' : '🤖') : '🤝'}</div>
            <div className="modal-title">
              {winner ? `${winner.player} ניצח!` : 'תיקו!'}
            </div>
            <div className="modal-score">❌ {score.x} · ⭕ {score.o}</div>
            <button className="modal-play" onClick={() => newRound()}>▶ שחק שוב</button>
          </div>
        </div>
      )}
    </>
  )
}