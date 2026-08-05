import { Route, Routes } from 'react-router'
import AppLayout from './layouts/AppLayout.jsx'
import ApplicationDetailsPage from './pages/ApplicationDetailsPage.jsx'
import ApplicationsPage from './pages/ApplicationsPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import EditApplicationPage from './pages/EditApplicationPage.jsx'
import NewApplicationPage from './pages/NewApplicationPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="applications/new" element={<NewApplicationPage />} />
        <Route
          path="applications/:id/edit"
          element={<EditApplicationPage />}
        />
        <Route
          path="applications/:id"
          element={<ApplicationDetailsPage />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
