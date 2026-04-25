import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Sparkles, LogOut } from 'lucide-react'
import useAuthStore from '../../store/authStore'

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-16 flex flex-col items-center py-6 gap-6 border-r border-white/5 bg-surface-1 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Sparkles size={16} className="text-white" />
        </div>
        <nav className="flex flex-col gap-2 flex-1">
          <SideLink to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
        </nav>
        <div className="flex flex-col items-center gap-3">
          {user?.photo_url && (
            <img
              src={user.photo_url}
              alt={user.name}
              title={user.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10"
            />
          )}
          <button
            onClick={handleLogout}
            title="Sign out"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-all"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

function SideLink({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 group relative
        ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'}`
      }
      title={label}
    >
      {icon}
    </NavLink>
  )
}
