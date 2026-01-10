import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api/axiosClient";
import PageHeader from "../components/PageHeader";

export default function Settings() {
  const schoolId = localStorage.getItem("schoolId");

  // timetable settings
  const [settings, setSettings] = useState({
    periodDuration: 45,
    periodsPerDay: 8,
    workingDays: 5,
    morningAssemblyPeriod: 0,
    startTime: "08:00",
  });

  // ✅ separate state for school info
  const [schoolInfo, setSchoolInfo] = useState({
    schoolName: "",
    email: ""
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!schoolId) return;
    loadSettings();
    loadSchoolInfo(); // ✅ fetch school name + email separately
  }, [schoolId]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/settings/${schoolId}`);
      if (res.data) {
        setSettings({
          periodDuration: res.data.periodDuration || 45,
          periodsPerDay: res.data.periodsPerDay || 8,
          workingDays: res.data.workingDays || 5,
          morningAssemblyPeriod: res.data.morningAssemblyPeriod || 0,
          startTime: res.data.startTime || "08:00",
        });
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const loadSchoolInfo = async () => {
    try {
      const res = await api.get(`/schools/${schoolId}`);
      if (res.data) {
        setSchoolInfo({
          schoolName: res.data.name || "",
          email: res.data.adminEmail || ""
        });
      }
    } catch (err) {
      console.error("Failed to load school info:", err);
    }
  };

  const handleSave = async () => {
    if (!schoolId) {
      setError("School ID not found. Please login again.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");
      await api.put(`/settings/${schoolId}`, settings);
      setSuccess("Settings saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset settings to defaults?")) return;

    try {
      setSaving(true);
      await api.post(`/settings/${schoolId}/reset`);
      await loadSettings();
      setSuccess("Settings reset to defaults!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to reset settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-50 min-h-screen ml-64">
        <PageHeader title="School Settings" subtitle="Configure your school timetable settings" />

        {loading ? (
          <div className="text-center py-12">Loading settings...</div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                {success}
              </div>
            )}

            <div className="space-y-6">
              {/* ✅ Display school info (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Name
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100"
                  value={schoolInfo.schoolName}
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100"
                  value={schoolInfo.email}
                  disabled
                />
              </div>

              {/* Editable timetable settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Period Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="60"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={settings.periodDuration}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        periodDuration: parseInt(e.target.value) || 45,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Periods Per Day
                  </label>
                  <input
                    type="number"
                    min="4"
                    max="10"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={settings.periodsPerDay}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        periodsPerDay: parseInt(e.target.value) || 8,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Working Days per Week
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="6"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={settings.workingDays}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        workingDays: parseInt(e.target.value) || 5,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Morning Assembly Period
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={settings.periodsPerDay - 1}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={settings.morningAssemblyPeriod}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        morningAssemblyPeriod: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Start Time
                </label>
                <input
                  type="time"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={settings.startTime}
                  onChange={(e) =>
                    setSettings({ ...settings, startTime: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Settings"}
                </button>
                <button
                  onClick={handleReset}
                  disabled={saving}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Reset to Defaults
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}