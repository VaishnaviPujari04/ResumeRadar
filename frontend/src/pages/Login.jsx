import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function Login() {

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      login(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 flex flex-col gap-5">
          {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-400 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-50-500 transition-colors placeholder-gray-600"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500 transition-colors placeholder-gray-600"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors mt-1"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-400 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
