import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import CVBuilder from './pages/CVBuilder.jsx'
import CoverLetterBuilder from './pages/CoverLetterBuilder.jsx'
import SharedCV from './pages/SharedCV.jsx'
import Login from './pages/Login.jsx'
import Layout from './components/ui/Layout.jsx'
import ProtectedRoute from './components/ui/ProtectedRoute.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="share/:token" element={<SharedCV />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="cv/:id" element={<CVBuilder />} />
        <Route path="cover-letter/:id" element={<CoverLetterBuilder />} />
      </Route>
    </Routes>
  )
}
