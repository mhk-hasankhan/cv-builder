import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { Sparkles, AlertCircle } from 'lucide-react'
import useAuthStore from '../store/authStore'
import { authApi } from '../utils/api'

export default function Login() {
  const { user, login } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionExpired = searchParams.get('session') === 'expired'

  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  async function handleSuccess(response) {
    try {
      const { token, user } = await authApi.googleSignIn(response.credential)
      login(token, user)
      navigate('/', { replace: true })
    } catch (e) {
      console.error('Sign-in failed', e)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="flex flex-col items-center gap-8 p-10 rounded-2xl border border-white/10 bg-surface-1 shadow-2xl w-full max-w-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-semibold text-zinc-100">CV Builder</h1>
          <p className="text-sm text-zinc-500 text-center">Sign in to create and manage your CVs and cover letters.</p>
        </div>

        {sessionExpired && (
          <div className="w-full flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2">
            <AlertCircle size={14} className="text-amber-400 shrink-0" />
            <p className="text-xs text-amber-300">Your session expired. Please sign in again.</p>
          </div>
        )}

        <div className="w-full flex flex-col items-center gap-3">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => console.error('Google login failed')}
            theme="filled_black"
            shape="rectangular"
            size="large"
            width="100%"
            text="signin_with"
          />
        </div>
      </div>
    </div>
  )
}
