import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import './App.css';

// ✅ Ensure file names match these exact imports
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminEvents from './pages/AdminEvents';
import AdminUsers from './pages/AdminUsers';
import AdminRegistrations from './pages/AdminRegistrations';
import ReportProblem from './pages/ReportProblem';
import AdminProblems from './pages/AdminProblems';
import ReportProblemList from './pages/ReportProblemList';
import CreateEvent from './pages/CreateEvent';
import ViewVolunteers from './pages/ViewVolunteers';
import EditEvent from './pages/EditEvent';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Volunteer Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events"
                element={
                  <ProtectedRoute>
                    <Events />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/report-problem"
                element={
                  <ProtectedRoute>
                    <ReportProblem />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-reports"
                element={
                  <ProtectedRoute>
                    <ReportProblemList />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/events"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminEvents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/create-event"
                element={
                  <ProtectedRoute adminOnly>
                    <CreateEvent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/edit-event/:eventId"
                element={
                  <ProtectedRoute adminOnly>
                    <EditEvent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/view-volunteers/:eventId"
                element={
                  <ProtectedRoute adminOnly>
                    <ViewVolunteers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/registrations"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminRegistrations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/problems"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminProblems />
                  </ProtectedRoute>
                }
              />

              {/* 404 - Page Not Found */}
              <Route path="*" element={<h1>404 - Page Not Found</h1>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
