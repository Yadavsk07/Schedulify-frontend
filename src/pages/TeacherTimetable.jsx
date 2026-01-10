import api from "../api/axiosClient";
import { useEffect, useState } from "react";
import { downloadBlob } from "../utils/downloadFile";
import Navbar from "../components/Navbar";
import { useParams } from "react-router-dom";
import { getAuth, isAdmin, isTeacher } from "../utils/auth";

export default function TeacherTimetable() {
  const { teacherId: paramTeacherId } = useParams();
  const auth = getAuth();

  // ✅ Only declare once
  const teacherId = isAdmin()
    ? paramTeacherId
    : isTeacher()
    ? auth.teacherId
    : localStorage.getItem("teacherId");

  const schoolId = localStorage.getItem("schoolId");

  if (!teacherId || !schoolId) {
    return <div>Unauthorized</div>;
  }

  const [timetable, setTimetable] = useState(null);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTimetable();
  }, [teacherId, schoolId]);

  const loadTimetable = async () => {
    try {
      setLoading(true);
      setError("");
      const [ttRes, metaRes] = await Promise.all([
        api.get(`/timetable/teacher/${schoolId}/${teacherId}`),
        api.get(`/meta/${schoolId}`)
      ]);
      setTimetable(ttRes.data.timetable || {});
      setMeta(metaRes.data || {});
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to load timetable");
    } finally {
      setLoading(false);
    }
  };

  const downloadTeacherPdf = async () => {
    try {
      const res = await api.get(`/pdf/teacher/${schoolId}/${teacherId}`, {
        responseType: "blob"
      });
      downloadBlob(res, `Teacher_${teacherId}.pdf`);
    } catch (e) {
      alert("PDF download failed: " + (e?.response?.data?.error || e.message));
    }
  };

  const downloadCsv = async () => {
    try {
      const res = await api.get(
        `/timetable/teacher/${schoolId}/${teacherId}/csv`,
        { responseType: "blob" }
      );
      downloadBlob(res, `Teacher_${teacherId}.csv`);
    } catch (e) {
      alert("CSV export failed: " + (e?.response?.data?.error || e.message));
    }
  };

  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const maxPeriods = 8;

  const getSlotForPeriod = (day, period) => {
    if (!timetable[day]) return null;
    return timetable[day].find((slot) => slot.period === period);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Timetable</h1>
            <p className="text-gray-600 mt-2">
              Teacher ID: {teacherId} | School ID: {schoolId}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="mb-4 flex gap-3">
            <button
              onClick={downloadTeacherPdf}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              📄 Download PDF
            </button>
            <button
              onClick={downloadCsv}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              📊 Export CSV
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading timetable...</p>
            </div>
          ) : timetable && Object.keys(timetable).length > 0 ? (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Period
                      </th>
                      {days.map((day) => (
                        <th
                          key={day}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.from({ length: maxPeriods }, (_, i) => i).map(
                      (period) => (
                        <tr key={period} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {period + 1}
                          </td>
                          {days.map((day) => {
                            const slot = getSlotForPeriod(day, period);
                            if (!slot) {
                              return (
                                <td
                                  key={day}
                                  className="px-4 py-3 text-sm text-gray-500"
                                >
                                  -
                                </td>
                              );
                            }
                            const subjectName =
                              meta.subjects?.[slot.subjectId] ||
                              slot.subjectId;
                            const className =
                              meta.classes?.[slot.classGroupId] ||
                              slot.classGroupId;
                            const sectionId = slot.sectionId || "";
                            return (
                              <td key={day} className="px-4 py-3 text-sm">
                                <div className="font-medium text-gray-900">
                                  {subjectName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {className} {sectionId}
                                </div>
                                {slot.labRoomId && (
                                  <div className="text-xs text-blue-600">
                                    Lab: {slot.labRoomId}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <p className="text-gray-500">
                No timetable found. Please contact your school administrator.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}