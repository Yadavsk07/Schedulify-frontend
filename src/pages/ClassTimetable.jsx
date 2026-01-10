import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../api/axiosClient";
import PageHeader from "../components/PageHeader";
import { downloadBlob } from "../utils/downloadFile";

export default function ClassTimetable() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const schoolId = localStorage.getItem("schoolId");

  const [sections, setSections] = useState([]);
  const [timetables, setTimetables] = useState({});
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const maxPeriods = 8;

  useEffect(() => {
    if (schoolId && classId) {
      loadSections();
      loadMeta();
    }
  }, [schoolId, classId]);

  const loadSections = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/classes/${schoolId}/${classId}`);
      const secs = res.data?.sections || [];
      setSections(secs);

      const timetableData = {};
      for (const sec of secs) {
        const ttRes = await api.get(
          `/timetable/class/${schoolId}/${classId}/${sec}`
        );
        timetableData[sec] = ttRes.data?.timetable || {};
      }
      setTimetables(timetableData);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to load timetables");
    } finally {
      setLoading(false);
    }
  };

  const loadMeta = async () => {
    try {
      const res = await api.get(`/meta/${schoolId}`);
      setMeta(res.data || {});
    } catch (err) {
      console.error("Failed to load metadata:", err);
    }
  };

  const downloadPdf = async (sectionId) => {
    try {
      const res = await api.get(
        `/pdf/class/${schoolId}/${classId}/${sectionId}`,
        { responseType: "blob" }
      );
      downloadBlob(res, `Class_${classId}_${sectionId}.pdf`);
    } catch {
      alert("PDF download failed");
    }
  };

  const getSlotForPeriod = (tt, day, period) => {
    if (!tt || !tt[day]) return null;
    return tt[day].find(s => s.period === period) || null;
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8 bg-gray-50 min-h-screen ml-64">
          <div className="text-center py-12">Loading timetables...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8 bg-gray-50 min-h-screen ml-64">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-50 min-h-screen ml-64">
        <PageHeader
          title={`Class Timetables - ${classId}`}
          subtitle="View and download timetables for all sections"
        />

        <button
          onClick={() => navigate("/dashboard/classes")}
          className="mb-6 text-blue-600 hover:underline"
        >
          ← Back to Classes
        </button>

        {sections.map((sec) => {
          const tt = timetables[sec] || {};
          return (
            <div key={sec} className="mb-12">
              <h3 className="text-lg font-bold mb-2">Section {sec}</h3>
              <button
                onClick={() => downloadPdf(sec)}
                className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Download PDF
              </button>

              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3">Period</th>
                        {days.map(day => (
                          <th key={day} className="px-4 py-3">{day}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Array.from({ length: maxPeriods }, (_, period) => (
                        <tr key={period}>
                          <td className="px-4 py-3 font-medium">{period + 1}</td>
                          {days.map(day => {
                            const slot = getSlotForPeriod(tt, day, period);
                            if (!slot) {
                              return (
                                <td key={day} className="px-4 py-3 text-gray-400">
                                  Free
                                </td>
                              );
                            }
                            return (
                              <td key={day} className="px-4 py-3">
                                <div className="font-medium">
                                  {meta.subjects?.[slot.subjectId] ?? slot.subjectId}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {meta.teachers?.[slot.teacherId] ?? slot.teacherId}
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
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
