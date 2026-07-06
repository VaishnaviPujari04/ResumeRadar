import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, Zap, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function isActive(path) {
    return location.pathname === path;
  }

  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
      {/* Logo */}
      <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
        <Zap size={20} className="text-blue-400" />
        <span className="text-white font-bold text-lg">
          Resume<span className="text-blue-400">Radar</span>
        </span>
      </Link>

      {user && (
        <div className="flex items-center gap-1 overflow-x-auto">

          {/* Nav Links */}
          {[
            { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={13} /> },
            { to: "/analyze", label: "Analyze" },
            { to: "/cover-letter", label: "Cover Letter" },
            { to: "/rewriter", label: "Rewriter" },
            { to: "/interview-prep", label: "Interview Prep" },
            { to: "/compare", label: "Compare" },
            { to: "/ats", label: "ATS Scan" },
            { to: "/history", label: "History" },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                isActive(item.to)
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {item.icon && item.icon}
              {item.label}
            </Link>
          ))}

          {/* Divider */}
          <div className="w-px h-5 bg-slate-700 mx-2 shrink-0" />

          {/* User + Logout */}
          <span className="text-sm text-slate-400 whitespace-nowrap shrink-0">
            {user.name?.split(" ")[0]}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-400 transition-colors ml-1 shrink-0"
          >
            <LogOut size={13} /> Logout
          </button>
        </div>
      )}
    </nav>
  );
}