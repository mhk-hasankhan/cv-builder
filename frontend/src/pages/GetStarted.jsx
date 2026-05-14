import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import './GetStarted.css'

const TRACKS = [
  { id: 'cv',     num: 1, title: 'Start a new CV',           sub: '12 templates · ATS-checked',   time: '~8 min' },
  { id: 'cl',     num: 2, title: 'Write a cover letter',     sub: 'Paired to a job description',  time: '~4 min' },
  { id: 'import', num: 3, title: 'Import an existing résumé', sub: 'PDF, DOCX, LinkedIn · Coming soon', time: '~2 min', disabled: true },
]

export default function GetStarted() {
  const { user, logout, init } = useAuthStore()
  const navigate = useNavigate()
  const [activeTrack, setActiveTrack] = useState('cv')
  const [toast, setToast] = useState('')
  const toastTimer = useRef(null)

  // Hydrate auth from localStorage in case the user arrives at / directly.
  useEffect(() => { init() }, [init])

  // Cleanup any pending toast timer on unmount.
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current) }, [])

  function flash(msg) {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 1800)
  }

  function handleGetStarted() {
    if (!user) { navigate('/login'); return }
    navigate('/dashboard')
  }

  function handleLogout() {
    logout()
    flash('Logged out — see you soon.')
  }

  const displayName = user?.name || 'Welcome'
  const initials = user?.name
    ? user.name.split(/\s+/).filter(Boolean).slice(0, 2).map(s => s[0].toUpperCase()).join('')
    : 'CV'

  return (
    <div className="gs-page">
      <div className="gs-bg">
        <video autoPlay muted loop playsInline preload="auto" id="gs-bg-video">
          <source src="/assets/background.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="gs-grain" />

      <div className="gs-shell">
        {/* TOP BAR */}
        <header className="gs-header">
          <div className="gs-brand">
            <div className="gs-brand-mark">F</div>
            <div className="gs-brand-name">Folio<em>&amp;</em>Co</div>
          </div>

          <nav className="gs-top-nav" aria-label="Primary">
            <a href="#">Templates</a>
            <a href="#">Examples</a>
            <a href="#">Pricing</a>
            <a href="#">Help</a>
          </nav>

          <div className="gs-user-cluster">
            {user ? (
              <>
                <div className="gs-user-pill" title="Signed in">
                  <div className="gs-avatar">
                    {user.photo_url
                      ? <img src={user.photo_url} alt={user.name} />
                      : <span>{initials}</span>}
                  </div>
                  <span>{displayName}</span>
                </div>
                <button className="gs-btn-logout" type="button" onClick={handleLogout} aria-label="Log out">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M15 17l5-5-5-5" />
                    <path d="M20 12H9" />
                    <path d="M12 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6" />
                  </svg>
                  <span>Log out</span>
                </button>
              </>
            ) : (
              <button className="gs-btn-logout" type="button" onClick={() => navigate('/login')} aria-label="Sign in">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 17l-5-5 5-5" />
                  <path d="M4 12h11" />
                  <path d="M12 21h6a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-6" />
                </svg>
                <span>Sign in</span>
              </button>
            )}
          </div>
        </header>

        {/* HERO */}
        <main className="gs-main">
          <section className="gs-hero">
            <div className="gs-eyebrow">
              <span className="gs-dot" />
              <span>{user ? `Welcome back, ${user.name?.split(' ')[0] || 'friend'}` : 'Welcome to Folio & Co'}</span>
            </div>

            <h1 className="gs-headline">
              <span className="gs-line">A résumé that</span>
              <span className="gs-line"><span className="gs-serif">opens</span> doors,</span>
              <span className="gs-line">in minutes.</span>
            </h1>

            <p className="gs-lede">
              Build an ATS-ready CV and a cover letter tailored to the role —
              guided, drafted, and polished. Pick a track below or let us draft from your last document.
            </p>

            <div className="gs-cta-row">
              <button className="gs-btn-primary" type="button" onClick={handleGetStarted}>
                <span>Get started</span>
                <span className="gs-arrow" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="M13 5l7 7-7 7" />
                  </svg>
                </span>
              </button>

              <button className="gs-btn-ghost" type="button" onClick={() => flash('Tour video coming soon.')}>
                <span className="gs-play" aria-hidden="true">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                <span>Watch the 60s tour</span>
              </button>
            </div>
          </section>

          {/* RIGHT: starter card */}
          <aside className="gs-starter" aria-label="Choose a starting point">
            <div className="gs-starter-head">
              <span>Choose a track</span>
              <span className="gs-count">three ways in</span>
            </div>

            <div className="gs-tracks">
              {TRACKS.map(track => (
                <button
                  key={track.id}
                  type="button"
                  disabled={track.disabled}
                  className={`gs-track${activeTrack === track.id ? ' gs-active' : ''}`}
                  onClick={() => {
                    if (track.disabled) { flash('Résumé import is coming soon — pick another track.'); return }
                    setActiveTrack(track.id)
                  }}
                >
                  <span className="gs-num">{track.num}</span>
                  <span className="gs-label">
                    <span className="gs-t">{track.title}</span>
                    <span className="gs-s">{track.sub}</span>
                  </span>
                  <span className="gs-time">{track.time}</span>
                </button>
              ))}
            </div>

            <div className="gs-progress" aria-label="Profile completeness">
              <span className="gs-pct">Profile&nbsp;25%</span>
              <span className="gs-bar"><span className="gs-fill" /></span>
              <span className="gs-pct">Finish</span>
            </div>
          </aside>
        </main>

        {/* FOOTER */}
        <footer className="gs-footer">
          <div className="gs-meta">
            <span>Folio &amp; Co.</span>
            <span className="gs-sep" />
            <span>v 4.2 · 2026</span>
            <span className="gs-sep" />
            <span>Made for jobseekers</span>
          </div>

          <div className="gs-stats">
            <div className="gs-stat">
              <span className="gs-n">312k</span>
              <span className="gs-l">CVs built</span>
            </div>
            <div className="gs-stat">
              <span className="gs-n">98%</span>
              <span className="gs-l">ATS pass-rate</span>
            </div>
            <div className="gs-stat">
              <span className="gs-n">4.9★</span>
              <span className="gs-l">User rating</span>
            </div>
          </div>
        </footer>
      </div>

      <div className={`gs-toast${toast ? ' gs-toast-visible' : ''}`} role="status" aria-live="polite">
        {toast}
      </div>
    </div>
  )
}
