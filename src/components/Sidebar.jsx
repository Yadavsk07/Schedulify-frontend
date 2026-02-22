import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path) => {
    return location.pathname === path
      ? "bg-blue-50 text-blue-600 font-semibold"
      : "text-gray-700 hover:bg-gray-50";
  };

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("schoolId");
    localStorage.removeItem("teacherId");
    localStorage.removeItem("role");
    navigate("/school/login");
  };

  return (
    <aside className="w-64 bg-white h-screen shadow-lg p-5 fixed left-0 top-0 overflow-y-auto flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-blue-600">Schedulify</h2>
        <p className="text-xs text-gray-500 mt-1">Admin Portal</p>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        <Link 
          to="/dashboard" 
          className={`px-4 py-2 rounded-lg transition ${isActive("/dashboard")}`}
        >
          📊 Overview
        </Link>

        <Link 
          to="/dashboard/teachers" 
          className={`px-4 py-2 rounded-lg transition ${isActive("/dashboard/teachers")}`}
        >
          👨‍🏫 Teachers
        </Link>

        <Link 
          to="/dashboard/subjects" 
          className={`px-4 py-2 rounded-lg transition ${isActive("/dashboard/subjects")}`}
        >
          📚 Subjects
        </Link>

        {/* ⭐ NEW */}
        <Link 
          to="/dashboard/class-subjects" 
          className={`px-4 py-2 rounded-lg transition ${isActive("/dashboard/class-subjects")}`}
        >
          🧩 Class Subjects
        </Link>

        <Link 
          to="/dashboard/classes" 
          className={`px-4 py-2 rounded-lg transition ${isActive("/dashboard/classes")}`}
        >
          🏫 Classes
        </Link>

        <Link 
          to="/dashboard/labs" 
          className={`px-4 py-2 rounded-lg transition ${isActive("/dashboard/labs")}`}
        >
          🧪 Lab Rooms
        </Link>

        <Link 
          to="/dashboard/upload" 
          className={`px-4 py-2 rounded-lg transition ${isActive("/dashboard/upload")}`}
        >
          📥 Upload Data
        </Link>

        <Link 
          to="/dashboard/settings" 
          className={`px-4 py-2 rounded-lg transition ${isActive("/dashboard/settings")}`}
        >
          ⚙️ Settings
        </Link>

        <Link 
          to="/dashboard/generate" 
          className={`px-4 py-2 rounded-lg transition ${isActive("/dashboard/generate")}`}
        >
          🎯 Generate Timetable
        </Link>
      </nav>

      <button
        onClick={handleLogout}
        className="mt-4 w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
      >
        Logout
      </button>
    </aside>
  );
}
