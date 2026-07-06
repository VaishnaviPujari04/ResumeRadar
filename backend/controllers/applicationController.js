import Application from "../models/Application.js";

// POST /api/applications
export async function addApplication(req, res) {
  const { companyName, jobTitle, status, jobUrl, notes, appliedDate } = req.body;

  if (!companyName?.trim() || !jobTitle?.trim()) {
    return res.status(400).json({ message: "Company name and job title are required" });
  }

  try {
    const app = await Application.create({
      userId: req.user.id,
      companyName,
      jobTitle,
      status: status || "Applied",
      jobUrl: jobUrl || "",
      notes: notes || "",
      appliedDate: appliedDate || new Date(),
    });

    res.status(201).json({ message: "Application added", application: app });
  } catch (err) {
    res.status(500).json({ message: "Failed to add application", error: err.message });
  }
}

// GET /api/applications
export async function getApplications(req, res) {
  try {
    const apps = await Application.find({ userId: req.user.id })
      .sort({ appliedDate: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch applications" });
  }
}

// PATCH /api/applications/:id
export async function updateApplication(req, res) {
  try {
    const app = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: req.body },
      { new: true }
    );
    if (!app) return res.status(404).json({ message: "Application not found" });
    res.json({ message: "Updated", application: app });
  } catch (err) {
    res.status(500).json({ message: "Failed to update application" });
  }
}

// DELETE /api/applications/:id
export async function deleteApplication(req, res) {
  try {
    await Application.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete application" });
  }
}

// GET /api/applications/stats
export async function getApplicationStats(req, res) {
  try {
    const apps = await Application.find({ userId: req.user.id });

    const total = apps.length;
    const byStatus = {
      Applied: 0, "In Review": 0, Interview: 0, Offer: 0, Rejected: 0,
    };
    apps.forEach((a) => { byStatus[a.status] = (byStatus[a.status] || 0) + 1; });

    // Weekly applications — last 7 days
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const thisWeek = apps.filter((a) => new Date(a.appliedDate) >= weekAgo).length;

    // Response rate — Interview + Offer / Total
    const responseRate = total > 0
      ? Math.round(((byStatus.Interview + byStatus.Offer) / total) * 100)
      : 0;

    res.json({ total, byStatus, thisWeek, responseRate });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
}