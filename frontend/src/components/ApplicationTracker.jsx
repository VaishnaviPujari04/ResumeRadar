import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Plus, Trash2, ExternalLink, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch } from "../utils/api.js";

const STATUS_COLORS = {
  Applied: "bg-blue-900/30 border-blue-800 text-blue-400",
  "In Review": "bg-yellow-900/30 border-yellow-800 text-yellow-400",
  Interview: "bg-purple-900/30 border-purple-800 text-purple-400",
  Offer: "bg-green-900/30 border-green-800 text-green-400",
  Rejected: "bg-red-900/30 border-red-800 text-red-400",
};

const STATUSES = ["Applied", "In Review", "Interview", "Offer", "Rejected"];

export default function ApplicationTracker() {
  const [applications, setApplications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    jobTitle: "",
    status: "Applied",
    jobUrl: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    try {
      const res = await apiFetch("/api/applications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setApplications(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAdd() {
    if (!form.companyName.trim() || !form.jobTitle.trim()) {
      toast.error("Company name and job title are required");
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setApplications([data.application, ...applications]);
      setForm({
        companyName: "",
        jobTitle: "",
        status: "Applied",
        jobUrl: "",
        notes: "",
      });
      setShowForm(false);
      toast.success("Application added!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id, status) {
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      setApplications(
        applications.map((a) => (a._id === id ? data.application : a)),
      );
      toast.success("Status updated!");
    } catch (err) {
      toast.error("Failed to update");
    }
  }

  async function handleDelete(id) {
    try {
      await fetch(`/api/applications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications(applications.filter((a) => a._id !== id));
      toast.success("Removed");
    } catch (err) {
      toast.error("Failed to delete");
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-white font-semibold">Application Tracker</h3>
          <p className="text-slate-500 text-xs mt-0.5">
            Track every job you've applied to
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-3 py-2 rounded-xl transition-colors"
        >
          <Plus size={13} /> Add Application
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-slate-800 rounded-xl p-4 mb-4 flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Company Name *"
              value={form.companyName}
              onChange={(e) =>
                setForm({ ...form, companyName: e.target.value })
              }
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500 placeholder-slate-600"
            />
            <input
              type="text"
              placeholder="Job Title *"
              value={form.jobTitle}
              onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500 placeholder-slate-600"
            />
            <input
              type="url"
              placeholder="Job URL (optional)"
              value={form.jobUrl}
              onChange={(e) => setForm({ ...form, jobUrl: e.target.value })}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500 placeholder-slate-600"
            />
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
            >
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <textarea
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500 placeholder-slate-600 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {loading ? "Adding..." : "Add"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-white text-sm px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-600 text-sm">No applications tracked yet</p>
          <p className="text-slate-700 text-xs mt-1">
            Click "Add Application" to start tracking
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {applications.slice(0, 5).map((app) => (
            <div
              key={app._id}
              className="flex items-center justify-between gap-3 py-2.5 border-b border-slate-800 last:border-0"
            >
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white text-sm font-medium truncate">
                    {app.companyName}
                  </p>
                  {app.jobUrl && (
                    <a
                      href={app.jobUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-600 hover:text-blue-400 transition-colors shrink-0"
                    >
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
                <p className="text-slate-500 text-xs truncate">
                  {app.jobTitle}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={app.status}
                  onChange={(e) => handleStatusChange(app._id, e.target.value)}
                  className={`text-xs border px-2 py-1 rounded-lg outline-none cursor-pointer ${STATUS_COLORS[app.status]} bg-transparent`}
                >
                  {STATUSES.map((s) => (
                    <option key={s} className="bg-slate-900 text-white">
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleDelete(app._id)}
                  className="text-slate-700 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
          {applications.length > 5 && (
            <p className="text-slate-600 text-xs text-center pt-1">
              +{applications.length - 5} more — view all in{" "}
              <a href="/applications" className="text-blue-400 hover:underline">
                Applications
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
