import Sidebar from "../components/Sidebar";
import api from "../api/axiosClient";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const schoolId = localStorage.getItem("schoolId");
  const jwt = localStorage.getItem("jwt");
  const teacherId = localStorage.getItem("teacherId");

  useEffect(() => {
    if (!jwt || !schoolId) {
      navigate("/school/login");
      return;
    }

    if (teacherId) {
      localStorage.clear();
      navigate("/school/login");
      return;
    }

    setLoading(true);
    setError("");

    api
      .get(`/admin/stats/${schoolId}`)
      .then((res) => {
        setStats(res.data);
      })
      .catch((err) => {
        setStats(null);
        if (err?.response?.status === 403) {
          setError(
            "Access denied. Please log out and log back in as a school administrator."
          );
        } else if (err?.response?.status === 401) {
          localStorage.clear();
          navigate("/school/login");
        } else {
          setError("Failed to load dashboard statistics.");
        }
      })
      .finally(() => setLoading(false));
  }, [schoolId, jwt, teacherId, navigate]);

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-8 bg-gray-50 min-h-screen ml-64">
        <PageHeader
          title="School Dashboard"
          subtitle="Overview & quick actions for your school"
        />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-medium">{error}</p>
            {error.includes("Access denied") && (
              <button
                onClick={() => {
                  localStorage.clear();
                  navigate("/school/login");
                }}
                className="mt-2 text-sm underline"
              >
                Clear session and log in again
              </button>
            )}
          </div>
        )}

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Teachers */}
          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
            <h3 className="text-sm text-gray-500 uppercase">Teachers</h3>
            <p className="text-3xl font-bold mt-2">
              {loading ? "..." : stats?.teachers ?? 0}
            </p>
            <Link
              to="/dashboard/teachers"
              className="text-blue-600 text-sm hover:underline"
            >
              Manage →
            </Link>
          </div>

          {/* Subjects */}
          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500">
            <h3 className="text-sm text-gray-500 uppercase">Subjects</h3>
            <p className="text-3xl font-bold mt-2">
              {loading ? "..." : stats?.subjects ?? 0}
            </p>
            <Link
              to="/dashboard/subjects"
              className="text-green-600 text-sm hover:underline"
            >
              Manage →
            </Link>
          </div>

          {/* Class Subjects */}
          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-indigo-500">
            <h3 className="text-sm text-gray-500 uppercase">Class Subjects</h3>
            <p className="text-3xl font-bold mt-2">
              {loading ? "..." : stats?.classSubjects ?? 0}
            </p>
            <Link
              to="/dashboard/class-subjects"
              className="text-indigo-600 text-sm hover:underline"
            >
              Manage →
            </Link>
          </div>

          {/* Classes */}
          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-purple-500">
            <h3 className="text-sm text-gray-500 uppercase">Classes</h3>
            <p className="text-3xl font-bold mt-2">
              {loading ? "..." : stats?.classes ?? 0}
            </p>
            <Link
              to="/dashboard/classes"
              className="text-purple-600 text-sm hover:underline"
            >
              Manage →
            </Link>
          </div>

          {/* Labs */}
          <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-orange-500">
            <h3 className="text-sm text-gray-500 uppercase">Lab Rooms</h3>
            <p className="text-3xl font-bold mt-2">
              {loading ? "..." : stats?.labs ?? 0}
            </p>
            <Link
              to="/dashboard/labs"
              className="text-orange-600 text-sm hover:underline"
            >
              Manage →
            </Link>
          </div>
        </div>

        {/* ================= ACTIONS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/dashboard/upload"
                className="block bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 text-center"
              >
                📥 Upload Excel Data
              </Link>

              <Link
                to="/dashboard/class-subjects"
                className="block bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 text-center"
              >
                🧩 Configure Class Subjects
              </Link>

              <Link
                to="/dashboard/generate"
                className="block bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 text-center"
              >
                🎯 Generate Timetable
              </Link>

              <Link
                to="/dashboard/settings"
                className="block bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 text-center"
              >
                ⚙️ School Settings
              </Link>
            </div>
          </div>

          {/* Management */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Management</h3>
            <div className="space-y-2">
              <Link
                to="/dashboard/teachers"
                className="block hover:text-blue-600"
              >
                👨‍🏫 Manage Teachers
              </Link>

              <Link
                to="/dashboard/subjects"
                className="block hover:text-green-600"
              >
                📚 Manage Subjects
              </Link>

              <Link
                to="/dashboard/class-subjects"
                className="block hover:text-indigo-600"
              >
                🧩 Manage Class Subjects
              </Link>

              <Link
                to="/dashboard/classes"
                className="block hover:text-purple-600"
              >
                🏫 Manage Classes
              </Link>

              <Link
                to="/dashboard/labs"
                className="block hover:text-orange-600"
              >
                🧪 Manage Lab Rooms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
