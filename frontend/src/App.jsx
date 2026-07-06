import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Analyze from "./pages/Analyze";
import History from "./pages/History";
import CoverLetter from "./pages/CoverLetter";
import Rewriter from "./pages/Rewriter";
import InterviewPrep from "./pages/InterviewPrep";
import AtsSimulator from "./pages/AtsSimulator";
import Compare from "./pages/Compare";
import SharedReport from "./pages/SharedReport";
import Landing from "./pages/Landing";
import Navbar from "./components/Navbar";


function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
}

// Pages that should NOT show the main app Navbar
const NO_NAVBAR_PATHS = ["/", "/login", "/signup"];

function AppLayout() {
  const location = useLocation();
  const showNavbar = !NO_NAVBAR_PATHS.includes(location.pathname)
    && !location.pathname.startsWith("/report");

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {showNavbar && <Navbar />}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1f2937",
            color: "#f9fafb",
            border: "1px solid #374151",
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/report/:shareId" element={<SharedReport />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/analyze" element={<PrivateRoute><Analyze /></PrivateRoute>} />
        <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
        <Route path="/cover-letter" element={<PrivateRoute><CoverLetter /></PrivateRoute>} />
        <Route path="/rewriter" element={<PrivateRoute><Rewriter /></PrivateRoute>} />
        <Route path="/interview-prep" element={<PrivateRoute><InterviewPrep /></PrivateRoute>} />
        <Route path="/ats" element={<PrivateRoute><AtsSimulator /></PrivateRoute>} />
        <Route path="/compare" element={<PrivateRoute><Compare /></PrivateRoute>} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;