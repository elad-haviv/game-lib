import { Link, Route, Routes } from 'react-router-dom'
import { games } from './games'

function Library() {
  return (
    <>
      <div className="floating-deco" aria-hidden>🎈</div>
      <div className="floating-deco f2" aria-hidden>⭐</div>
      <div className="floating-deco f3" aria-hidden>🌈</div>
      <div className="floating-deco f4" aria-hidden>🎈</div>
      <img src="/mascot.png" alt="" className="mascot" aria-hidden />
      <div className="screen">
        <div className="library-hero">
          <span className="hero-emoji h1">🎉</span>
          <h1 className="library-title">ספריית משחקים</h1>
          <span className="hero-emoji h2">🎈</span>
        </div>
        <div className="library-header">בחרו משחק!</div>
        {games.map((g, i) => (
          <Link key={g.id} to={g.path} className={`game-card g${i % 3}`} style={{ animationDelay: `${i * 0.15}s` }}>
            <div className="card-banner">{g.art}</div>
            <div className="info">
              <h2>{g.emoji} {g.title}</h2>
              <p>{g.subtitle}</p>
              <span className="play-badge">שחקו ▶</span>
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