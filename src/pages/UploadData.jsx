import api from "../api/axiosClient";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/PageHeader";

export default function UploadData() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const schoolId = localStorage.getItem("schoolId");
  const teacherId = localStorage.getItem("teacherId");
  const jwt = localStorage.getItem("jwt");

  // Check if user is logged in and is an admin (not a teacher)
  useEffect(() => {
    if (!jwt || !schoolId) {
      navigate("/school/login");
      return;
    }
    // If teacherId exists, user is a teacher, not an admin - clear it and redirect
    if (teacherId) {
      // Clear teacher session data
      localStorage.removeItem("teacherId");
      setError("Access denied. This page is only available to school administrators. Please log in as a school administrator.");
      // Redirect after a moment
      setTimeout(() => {
        localStorage.clear();
        navigate("/school/login");
      }, 2000);
    }
  }, [jwt, schoolId, teacherId, navigate]);

  const upload = async () => {
    if (!file) {
      setError("Please choose a file");
      return;
    }
    
    // Verify authentication
    const currentJwt = localStorage.getItem("jwt");
    const currentSchoolId = localStorage.getItem("schoolId");
    const currentTeacherId = localStorage.getItem("teacherId");
    
    if (!currentJwt || !currentSchoolId) {
      setError("Please login as school admin");
      localStorage.clear();
      navigate("/school/login");
      return;
    }
    
    if (currentTeacherId) {
      setError("Access denied. You are logged in as a teacher. Please log out and log in as a school administrator.");
      return;
    }

    const form = new FormData();
    form.append("file", file);

    try {
      setUploading(true);
      setError("");
      setSuccess("");
      const res = await api.post(`/upload/${schoolId}/master`, form, {
        onUploadProgress: (evt) => setProgress(Math.round((evt.loaded / evt.total) * 100)),
      });
      setSuccess(res.data.message || "Upload successful! Data has been imported.");
      setFile(null);
      setTimeout(() => setSuccess(""), 5000);
    } catch (e) {
      let errorMessage = e?.response?.data?.error || 
                        e?.response?.data?.message || 
                        e?.message || 
                        "Upload failed";
      
      // Provide more helpful message for 403 errors
      if (e?.response?.status === 403) {
        errorMessage = "Access denied. This operation requires administrator permissions. Please clear your browser's localStorage (or log out completely) and log back in as a school administrator using the School Login page.";
        
        // Suggest clearing localStorage if token might be invalid
        console.error("403 Forbidden - Token may not have admin permissions. Consider clearing localStorage and re-logging in.");
        console.log("Current localStorage values:", {
          hasJwt: !!localStorage.getItem("jwt"),
          schoolId: localStorage.getItem("schoolId"),
          teacherId: localStorage.getItem("teacherId"),
        });
      }
      
      setError(errorMessage);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-50 min-h-screen ml-64">
        <PageHeader 
          title="Upload School Data" 
          subtitle="Bulk import teachers, subjects, classes, and lab rooms from Excel"
        />

        <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium">{error}</p>
                  {error.includes("Access denied") && (
                    <button
                      onClick={() => {
                        localStorage.clear();
                        navigate("/school/login");
                      }}
                      className="mt-2 text-sm text-red-800 underline hover:text-red-900"
                    >
                      Clear session and log in as admin
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Excel File (.xlsx, .xls)
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => {
                    setFile(e.target.files[0]);
                    setError("");
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              {file && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: <span className="font-medium">{file.name}</span>
                </p>
              )}
            </div>

            {uploading && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}

            <button
              onClick={upload}
              disabled={uploading || !file}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition ${
                uploading || !file
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              }`}
            >
              {uploading ? `Uploading... ${progress}%` : "Upload File"}
            </button>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <h3 className="font-semibold text-blue-900 mb-3">Excel File Format Requirements:</h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p><strong>Sheet Names (exact):</strong> Teachers, Subjects, Classes, LabRooms</p>
                
                <div className="mt-3">
                  <p className="font-semibold mb-1">Teachers Sheet Columns:</p>
                  <ul className="list-disc list-inside ml-2">
                    <li>teacherId (required)</li>
                    <li>name (required)</li>
                    <li>subjectIds (comma-separated, optional)</li>
                    <li>maxPeriodsPerWeek (optional, default: 20)</li>
                  </ul>
                </div>

                <div className="mt-3">
                  <p className="font-semibold mb-1">Subjects Sheet Columns:</p>
                  <ul className="list-disc list-inside ml-2">
                    <li>id (optional, auto-generated if empty)</li>
                    <li>name (required)</li>
                    <li>code (optional)</li>
                    <li>periodsPerWeek (required)</li>
                    <li>requiresConsecutive (true/false, optional)</li>
                    <li>consecutiveSize (optional, default: 2)</li>
                    <li>roomType (CLASSROOM/LAB, optional)</li>
                  </ul>
                </div>

                <div className="mt-3">
                  <p className="font-semibold mb-1">Classes Sheet Columns:</p>
                  <ul className="list-disc list-inside ml-2">
                    <li>id (optional, auto-generated if empty)</li>
                    <li>name (required)</li>
                    <li>sections (comma-separated, e.g., "A, B, C")</li>
                    <li>subjectIds (comma-separated, optional)</li>
                  </ul>
                </div>

                <div className="mt-3">
                  <p className="font-semibold mb-1">LabRooms Sheet Columns:</p>
                  <ul className="list-disc list-inside ml-2">
                    <li>id (optional, auto-generated if empty)</li>
                    <li>name (required)</li>
                    <li>capacity (optional, default: 30)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
