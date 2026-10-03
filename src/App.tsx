import { Link, Route, Routes } from 'react-router-dom'
import { games } from './games'

function Library() {
  return (
    <>
      <div className="screen">
        <div className="library-header">בחרו משחק</div>
        {games.map((g) => (
          <Link key={g.id} to={g.path} className="game-card">
            <div className="emoji">{g.emoji}</div>
            <div className="info">
              <h2>{g.title}</h2>
              <p>{g.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Library />} />
        {games.map((g) => (
          <Route key={g.id} path={g.path} element={<GamePage title={g.title}>{g.element}</GamePage>} />
        ))}
      </Routes>
    </>
  )
}

function GamePage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <header>
        <h1>{title}</h1>
        <Link to="/" className="home-btn">🏠</Link>
      </header>
      <div className="screen">{children}</div>
    </>
  )
}