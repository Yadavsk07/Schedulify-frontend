import Sidebar from "../components/Sidebar";
import api from "../api/axiosClient";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";

export default function GenerateTimetable() {
  const schoolId = localStorage.getItem("schoolId");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const generate = async () => {
    if (!schoolId) {
      setError("School ID not found. Please login again.");
      return;
    }

    if (
      !confirm(
        "This will generate timetables for all classes. This may take a few minutes. Continue?"
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await api.post(`/timetable/generate/school/${schoolId}`);

      setSuccess(res.data || "Timetable generated successfully!");

      // ✅ Redirect to dashboard after short delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

    } catch (e) {
      setError(
        e?.response?.data?.error ||
          e?.message ||
          "Generation failed. Please check your data and settings."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-50 min-h-screen ml-64">
        <PageHeader
          title="Generate Timetable"
          subtitle="Generate optimized timetables for all classes and teachers"
        />

        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
              {success}
              <div className="text-sm mt-1">Redirecting to dashboard...</div>
            </div>
          )}

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                Before Generating:
              </h3>
              <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                <li>
                  Ensure all teachers, subjects, classes, and lab rooms are added
                </li>
                <li>Configure school settings (periods, working days, etc.)</li>
                <li>Verify subject requirements and teacher assignments</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">
                Generation Process:
              </h3>
              <p className="text-sm text-yellow-800">
                The system will generate timetables for all classes, ensuring no
                teacher clashes, no lab conflicts, and balanced workloads. This
                process may take 1-5 minutes depending on the size of your school.
              </p>
            </div>

            <button
              onClick={generate}
              disabled={loading}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generating Timetable...
                </span>
              ) : (
                "Generate Full School Timetable"
              )}
            </button>

            <div className="text-sm text-gray-600 pt-4 border-t">
              <p className="font-medium mb-2">After generation, you can:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>View class timetables from the Classes page</li>
                <li>View teacher timetables from the Teachers page</li>
                <li>Download PDFs for any class or teacher</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
