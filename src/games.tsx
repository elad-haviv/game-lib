import TicTacToe from './games/tictactoe/TicTacToe'
import TraceLetters from './games/letters/TraceLetters'
// עורך האותיות מוסתר — לשחזור: import StrokeEditor from './games/letters/StrokeEditor'

// איורי SVG למסך הבית — ציור צבעוני לכל משחק
function TicTacToeArt() {
  return (
    <svg viewBox="0 0 120 90" className="card-art">
      <rect x="8" y="10" width="104" height="72" rx="12" fill="#fff" opacity="0.9" />
      <line x1="42" y1="18" x2="42" y2="74" stroke="#8e44ad" strokeWidth="4" strokeLinecap="round" opacity="0.4" />
      <line x1="76" y1="18" x2="76" y2="74" stroke="#8e44ad" strokeWidth="4" strokeLinecap="round" opacity="0.4" />
      <line x1="16" y1="34" x2="104" y2="34" stroke="#8e44ad" strokeWidth="4" strokeLinecap="round" opacity="0.4" />
      <line x1="16" y1="58" x2="104" y2="58" stroke="#8e44ad" strokeWidth="4" strokeLinecap="round" opacity="0.4" />
      <path d="M20,20 L32,30 M32,20 L20,30" stroke="#e74c3c" strokeWidth="6" strokeLinecap="round" className="art-wiggle" />
      <circle cx="59" cy="46" r="8" fill="none" stroke="#2979ff" strokeWidth="6" className="art-wiggle2" />
      <path d="M88,64 L100,74 M100,64 L88,74" stroke="#e74c3c" strokeWidth="6" strokeLinecap="round" className="art-wiggle2" />
      <circle cx="25" cy="66" r="8" fill="none" stroke="#2979ff" strokeWidth="6" className="art-wiggle" />
      <path d="M86,20 L98,30 M98,20 L86,30" stroke="#e74c3c" strokeWidth="6" strokeLinecap="round" className="art-wiggle" />
      <circle cx="59" cy="22" r="8" fill="none" stroke="#2979ff" strokeWidth="6" className="art-wiggle2" />
      <text x="104" y="18" fontSize="16">✨</text>
    </svg>
  )
}

function LettersArt() {
  return (
    <svg viewBox="0 0 120 90" className="card-art">
      <rect x="8" y="10" width="104" height="72" rx="12" fill="#fff" opacity="0.9" />
      <path d="M20,70 C22,50 24,38 22,30 L34,26 C36,38 36,54 38,68 Z" fill="#ffd600" className="art-wiggle" />
      <path d="M22,30 L34,26 L36,30 L24,34 Z" fill="#e67e22" />
      <path d="M20,70 L26,76 L38,68 Z" fill="#555" />
      <text x="60" y="66" fontSize="46" textAnchor="middle" fill="#8e44ad" style={{ fontWeight: 900, fontFamily: 'Heebo, sans-serif' }} className="art-wiggle2">א</text>
      <path d="M84,30 L100,46 M96,26 L102,32" stroke="#4caf50" strokeWidth="5" strokeLinecap="round" />
      <path d="M100,46 L104,50 L98,50 Z" fill="#4caf50" />
      <circle cx="90" cy="66" r="4" fill="#e74c3c" opacity="0.7" className="art-wiggle2" />
      <circle cx="98" cy="72" r="3" fill="#2979ff" opacity="0.7" className="art-wiggle" />
      <text x="14" y="22" fontSize="14">✨</text>
    </svg>
  )
}

export interface GameMeta {
  id: string
  title: string
  subtitle: string
  emoji: string
  path: string
  element: React.ReactNode
  art: React.ReactNode
}

export const games: GameMeta[] = [
  {
    id: 'tictactoe',
    title: 'איקס עיגול',
    subtitle: 'נגד המחשב או חבר',
    emoji: '❌⭕',
    path: '/game/tictactoe',
    element: <TicTacToe />,
    art: <TicTacToeArt />,
  },
  {
    id: 'trace-letters',
    title: 'כתיבת אותיות',
    subtitle: 'עקבו אחרי האותיות באצבע',
    emoji: '✍️',
    path: '/game/trace-letters',
    element: <TraceLetters />,
    art: <LettersArt />,
  },
  // עורך האותיות (StrokeEditor) מוסתר מהילדים — לשחזור הוסיפו רישום חזרה לכאן
  // {
  //   id: 'stroke-editor',
  //   title: 'עורך אותיות (לאבא)',
  //   subtitle: 'ציירו קווי אות וייצאו',
  //   emoji: '🛠️',
  //   path: '/game/stroke-editor',
  //   element: <StrokeEditor />,
  // },
  // משחקים חדשים מתווספים כאן
]