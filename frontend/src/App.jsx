import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useThemeStore, applyTheme } from './store/themeStore.js'
import GetStarted from './pages/GetStarted.jsx'
import Dashboard from './pages/Dashboard.jsx'
import CVBuilder from './pages/CVBuilder.jsx'
import CoverLetterBuilder from './pages/CoverLetterBuilder.jsx'
import SharedCV from './pages/SharedCV.jsx'
import Login from './pages/Login.jsx'
import JobMatcher from './pages/JobMatcher.jsx'
import Layout from './components/ui/Layout.jsx'
import ProtectedRoute from './components/ui/ProtectedRoute.jsx'

export default function App() {
  const { mode, accentColor } = useThemeStore()

  useEffect(() => {
    applyTheme(mode, accentColor)
  }, [mode, accentColor])

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<GetStarted />} />
      <Route path="/login" element={<Login />} />
      <Route path="/share/:token" element={<SharedCV />} />

      {/* Protected */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cv/:id" element={<CVBuilder />} />
        <Route path="/cover-letter/:id" element={<CoverLetterBuilder />} />
        <Route path="/job-match" element={<JobMatcher />} />
      </Route>
    </Routes>
  )
}
