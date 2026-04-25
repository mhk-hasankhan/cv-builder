import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import CVBuilder from './pages/CVBuilder.jsx'
import CoverLetterBuilder from './pages/CoverLetterBuilder.jsx'
import SharedCV from './pages/SharedCV.jsx'
<<<<<<< HEAD
import Login from './pages/Login.jsx'
import Layout from './components/ui/Layout.jsx'
import ProtectedRoute from './components/ui/ProtectedRoute.jsx'
=======
import Layout from './components/ui/Layout.jsx'
>>>>>>> 1e0424acaade213ab31886d5ec68cede14bf7c9d

export default function App() {
  return (
    <Routes>
<<<<<<< HEAD
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
=======
      <Route path="/" element={<Layout />}>
>>>>>>> 1e0424acaade213ab31886d5ec68cede14bf7c9d
        <Route index element={<Dashboard />} />
        <Route path="cv/:id" element={<CVBuilder />} />
        <Route path="cover-letter/:id" element={<CoverLetterBuilder />} />
      </Route>
<<<<<<< HEAD
=======
      <Route path="share/:token" element={<SharedCV />} />
>>>>>>> 1e0424acaade213ab31886d5ec68cede14bf7c9d
    </Routes>
  )
}
