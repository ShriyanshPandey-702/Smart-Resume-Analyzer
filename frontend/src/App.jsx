import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import Dashboard from "./pages/Dashboard";
import Compare from "./pages/Compare";
import History from "./pages/History";
import Profile from "./pages/Profile";
import Setting from "./pages/Setting";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public landing page — first thing visitors see */}
      <Route path="/" element={<Landing />} />

      {/* Clerk auth (email/password + Google + GitHub) */}
      <Route path="/sign-in/*" element={<SignInPage />} />
      <Route path="/sign-up/*" element={<SignUpPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/compare"
        element={
          <ProtectedRoute>
            <Compare />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <History />
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
        path="/settings"
        element={
          <ProtectedRoute>
            <Setting />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
