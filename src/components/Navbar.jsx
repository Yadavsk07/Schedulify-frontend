import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const schoolId = localStorage.getItem("schoolId");
  const teacherId = localStorage.getItem("teacherId");
  const jwt = localStorage.getItem("jwt");

  const logout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("schoolId");
    localStorage.removeItem("teacherId");
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-blue-600">Schedulify</h1>
        <Link to="/" className="text-sm text-gray-600">Home</Link>
      </div>

      <div className="flex items-center gap-4">
        {schoolId && jwt && <Link to="/dashboard" className="text-sm">Dashboard</Link>}
        {teacherId && <Link to="/teacher/timetable" className="text-sm">My Timetable</Link>}
        {!jwt && !teacherId && (
          <>
            <Link to="/school/login" className="text-sm">School Login</Link>
            <Link to="/teacher/login" className="text-sm">Teacher Login</Link>
          </>
        )}
        {(jwt || teacherId) && (
          <button onClick={logout} className="text-sm bg-red-500 text-white px-3 py-1 rounded">Logout</button>
        )}
      </div>
    </nav>
  );
}
