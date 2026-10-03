import TicTacToe from './games/tictactoe/TicTacToe'

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
  // משחקים חדשים מתווספים כאן
]