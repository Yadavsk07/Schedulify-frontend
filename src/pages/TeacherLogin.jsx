import api from "../api/axiosClient";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function TeacherLogin() {
  const [schoolCode, setSchoolCode] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();

    if (!schoolCode || !teacherId) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.post("/auth/teacher/login", {
        schoolCode,
        teacherId,
      });

      const { token, schoolId } = res.data;

      localStorage.setItem("jwt", token);
      localStorage.setItem("schoolId", schoolId);
      localStorage.setItem("teacherId", teacherId);

      navigate("/teacher/timetable");
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Teacher Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            View your personal timetable
          </p>

          <form className="mt-8 space-y-6" onSubmit={login}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">
                School Code
              </label>
              <input
                type="text"
                placeholder="ABC_SCHOOL"
                value={schoolCode}
                onChange={(e) => setSchoolCode(e.target.value)}
                className="w-full border p-2 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Teacher ID
              </label>
              <input
                type="text"
                placeholder="T1001"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className="w-full border p-2 rounded-lg"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
