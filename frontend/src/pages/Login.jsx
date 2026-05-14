import { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { AlertCircle } from 'lucide-react'
import useAuthStore from '../store/authStore'
import { authApi } from '../utils/api'
import './GetStarted.css'

export default function Login() {
  const { user, login } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionExpired = searchParams.get('session') === 'expired'

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true })
  }, [user, navigate])

  async function handleSuccess(response) {
    try {
      const { token, user } = await authApi.googleSignIn(response.credential)
      login(token, user)
      navigate('/dashboard', { replace: true })
    } catch (e) {
      console.error('Sign-in failed', e)
    }
  }

  return (
    <div className="gs-page">
      <div className="gs-bg">
        <video autoPlay muted loop playsInline preload="auto">
          <source src="/assets/background.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="gs-grain" />

      <div className="gs-shell">
        {/* TOP BAR */}
        <header className="gs-header">
          <Link to="/" className="gs-brand-link" aria-label="Home">
            <div className="gs-brand-mark">F</div>
            <div className="gs-brand-name">Folio<em>&amp;</em>Co</div>
          </Link>

          <nav className="gs-top-nav" aria-label="Primary">
            <a href="#">Templates</a>
            <a href="#">Examples</a>
            <a href="#">Pricing</a>
            <a href="#">Help</a>
          </nav>

          <div className="gs-user-cluster">
            <Link to="/" className="gs-btn-logout" aria-label="Back to home">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </Link>
          </div>
        </header>

        {/* HERO */}
        <main className="gs-main">
          <section className="gs-hero">
            <div className="gs-eyebrow">
              <span className="gs-dot" />
              <span>Sign in</span>
            </div>

            <h1 className="gs-headline">
              <span className="gs-line">Pick up</span>
              <span className="gs-line"><span className="gs-serif">where you left</span></span>
              <span className="gs-line">off, in seconds.</span>
            </h1>

            <p className="gs-lede">
              Your CVs, cover letters, and tailored drafts are right where you parked them.
              Sign in to keep building — no passwords, no friction.
            </p>
          </section>

          {/* RIGHT: auth card */}
          <aside className="gs-auth-card" aria-label="Sign in to your account">
            <div className="gs-auth-head">
              <span className="gs-auth-kicker">Welcome back</span>
              <span className="gs-auth-title">Sign in to <em>Folio&amp;Co</em></span>
              <span className="gs-auth-sub">
                Use your Google account to continue. Your work is end-to-end private to you.
              </span>
            </div>

            {sessionExpired && (
              <div className="gs-auth-alert" role="alert">
                <AlertCircle size={14} />
                <span>Your session expired. Please sign in again to continue.</span>
              </div>
            )}

            <div className="gs-auth-google">
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => console.error('Google login failed')}
                theme="filled_black"
                shape="pill"
                size="large"
                width="360"
                text="signin_with"
              />
            </div>

            <div className="gs-auth-divider"><span>secure · oauth · no passwords</span></div>

            <p className="gs-auth-foot">
              By continuing you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
            </p>
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
    </div>
  )
}
