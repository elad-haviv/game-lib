import TicTacToe from './games/tictactoe/TicTacToe'
import TraceLetters from './games/letters/TraceLetters'
import StrokeEditor from './games/letters/StrokeEditor'

export interface GameMeta {
  id: string
  title: string
  subtitle: string
  emoji: string
  path: string
  element: React.ReactNode
}

export const games: GameMeta[] = [
  {
    id: 'tictactoe',
    title: 'איקס עיגול',
    subtitle: 'נגד המחשב או חבר',
    emoji: '❌⭕',
    path: '/game/tictactoe',
    element: <TicTacToe />,
  },
  {
    id: 'trace-letters',
    title: 'כתיבת אותיות',
    subtitle: 'עקבו אחרי האותיות באצבע',
    emoji: '✍️',
    path: '/game/trace-letters',
    element: <TraceLetters />,
  },
  {
    id: 'stroke-editor',
    title: 'עורך אותיות (לאבא)',
    subtitle: 'ציירו קווי אות וייצאו',
    emoji: '🛠️',
    path: '/game/stroke-editor',
    element: <StrokeEditor />,
  },
  // משחקים חדשים מתווספים כאן
]