import Sidebar from "../components/Sidebar";
import api from "../api/axiosClient";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";

export default function GenerateTimetable() {
  const schoolId = localStorage.getItem("schoolId");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [warnings, setWarnings] = useState([]);
  const [validation, setValidation] = useState(null);
  const [generationFailure, setGenerationFailure] = useState(null);

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
      setWarnings([]);
      setGenerationFailure(null);

      const res = await api.post(`/timetable/generate/school/${schoolId}`);
      const data = res?.data;
      if (typeof data === "string") {
        setSuccess(data);
      } else {
        setSuccess(data?.message || "Timetable generated successfully!");
        setWarnings(Array.isArray(data?.warnings) ? data.warnings : []);
      }

      // ✅ Redirect to dashboard after short delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

    } catch (e) {
      const data = e?.response?.data;
      setError(
        data?.error ||
          e?.message ||
          "Generation failed. Please check your data and settings."
      );
      if (data?.validation) {
        setGenerationFailure({
          reason: data?.reason || "",
          validation: data.validation,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const validateBeforeGenerate = async () => {
    if (!schoolId) {
      setError("School ID not found. Please login again.");
      return;
    }
    try {
      setValidating(true);
      setError("");
      const res = await api.get(`/timetable/validate/school/${schoolId}`);
      setValidation(res?.data || null);
    } catch (e) {
      setError(
        e?.response?.data?.error ||
          e?.message ||
          "Validation failed. Please try again."
      );
    } finally {
      setValidating(false);
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
          {generationFailure?.validation && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
              <p className="font-semibold mb-1">Generation failed with feasibility errors.</p>
              {generationFailure.reason && (
                <p className="text-sm mb-2">{generationFailure.reason}</p>
              )}
              <p className="text-sm mb-2">
                Issues: {generationFailure.validation?.summary?.issueCount ?? 0} | Warnings:{" "}
                {generationFailure.validation?.summary?.warningCount ?? 0}
              </p>
              {Array.isArray(generationFailure.validation?.issues) &&
                generationFailure.validation.issues.length > 0 && (
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {generationFailure.validation.issues.slice(0, 12).map((it, idx) => (
                      <li key={`gen-fail-${idx}`}>{it.detail || it.type}</li>
                    ))}
                  </ul>
                )}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
              {success}
              <div className="text-sm mt-1">Redirecting to dashboard...</div>
            </div>
          )}
          {warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
              <p className="font-medium mb-1">Generation warnings:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                {warnings.slice(0, 10).map((w, idx) => (
                  <li key={`${idx}-${w}`}>{w}</li>
                ))}
              </ul>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={validateBeforeGenerate}
                disabled={validating || loading}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition ${
                  validating || loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                }`}
              >
                {validating ? "Validating..." : "Validate Before Generate"}
              </button>

              <button
                onClick={generate}
                disabled={loading || validating}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition ${
                  loading || validating
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
            </div>

            {validation && (
              <div
                className={`rounded-lg border p-4 ${
                  validation.feasible
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <h3
                  className={`font-semibold mb-2 ${
                    validation.feasible ? "text-green-900" : "text-red-900"
                  }`}
                >
                  Validation Report: {validation.feasible ? "Feasible" : "Not Feasible"}
                </h3>
                <p className="text-sm mb-2">
                  Issues: {validation?.summary?.issueCount ?? 0} | Warnings:{" "}
                  {validation?.summary?.warningCount ?? 0}
                </p>

                {Array.isArray(validation.issues) && validation.issues.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium mb-1">Top Issues</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {validation.issues.slice(0, 8).map((i, idx) => (
                        <li key={`issue-${idx}`}>{i.detail || i.type}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {Array.isArray(validation.warnings) && validation.warnings.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Top Warnings</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {validation.warnings.slice(0, 6).map((w, idx) => (
                        <li key={`warn-${idx}`}>{w.detail || w.type}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

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
