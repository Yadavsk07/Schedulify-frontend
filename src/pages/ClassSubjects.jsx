import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/PageHeader";
import api from "../api/axiosClient";

export default function ClassSubjects() {
  const schoolId = localStorage.getItem("schoolId");

  const [data, setData] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    classGroupId: "",
    subjectId: "",
    teacherId: "",
    periodsPerWeek: 4,
    roomType: "CLASSROOM",
    requiresConsecutive: false,
    consecutiveSize: 2,
  });

  // ================= LOAD DATA =================
  useEffect(() => {
    if (schoolId) {
      loadAll();
    }
  }, [schoolId]);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [cs, cls, sub, tch] = await Promise.all([
        api.get(`/class-subjects/${schoolId}`),
        api.get(`/classes/${schoolId}`),
        api.get(`/subjects/${schoolId}`),
        api.get(`/teachers/${schoolId}`),
      ]);

      setData(cs.data || []);
      setClasses(cls.data || []);
      setSubjects(sub.data || []);
      setTeachers(tch.data || []);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.classGroupId || !formData.subjectId) {
      setError("Class and Subject are required");
      return;
    }

    try {
      await api.post(`/class-subjects/${schoolId}`, {
        ...formData,
        requiresConsecutive: !!formData.requiresConsecutive,
      });

      setSuccess("Class subject assigned successfully!");
      setShowModal(false);
      resetForm();
      loadAll();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err?.response?.data?.error || "Operation failed");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!confirm("Delete this mapping?")) return;

    try {
      await api.delete(`/class-subjects/${schoolId}/${id}`);
      setSuccess("Deleted successfully!");
      loadAll();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Delete failed");
    }
  };

  const resetForm = () => {
    setFormData({
      classGroupId: "",
      subjectId: "",
      teacherId: "",
      periodsPerWeek: 4,
      roomType: "CLASSROOM",
      requiresConsecutive: false,
      consecutiveSize: 2,
    });
    setError("");
  };

  const classNameById = new Map(classes.map((c) => [c.id, c.name]));
  const subjectNameById = new Map(subjects.map((s) => [s.id, s.name]));
  const teacherNameById = new Map(teachers.map((t) => [t.id, t.name]));
  const classById = new Map(classes.map((c) => [c.id, c]));

  const getClassSortValue = (classItem) => {
    const raw = `${classItem?.name || ""} ${classItem?.id || ""}`;
    const m = raw.match(/(\d{1,3})/);
    return m ? Number(m[1]) : Number.MAX_SAFE_INTEGER;
  };

  const getSubjectSortValue = (subjectId) => {
    const m = String(subjectId || "").match(/(\d{1,3})/);
    return m ? Number(m[1]) : Number.MAX_SAFE_INTEGER;
  };

  const sortedData = useMemo(() => {
    const arr = [...data];
    arr.sort((a, b) => {
      const aClass = classById.get(a.classGroupId);
      const bClass = classById.get(b.classGroupId);
      const aClassNum = getClassSortValue(aClass || { id: a.classGroupId });
      const bClassNum = getClassSortValue(bClass || { id: b.classGroupId });
      if (aClassNum !== bClassNum) return aClassNum - bClassNum;

      const aClassName = classNameById.get(a.classGroupId) || a.classGroupId || "";
      const bClassName = classNameById.get(b.classGroupId) || b.classGroupId || "";
      const classCmp = String(aClassName).localeCompare(String(bClassName));
      if (classCmp !== 0) return classCmp;

      const aSubNum = getSubjectSortValue(a.subjectId);
      const bSubNum = getSubjectSortValue(b.subjectId);
      if (aSubNum !== bSubNum) return aSubNum - bSubNum;

      return String(a.subjectId || "").localeCompare(String(b.subjectId || ""));
    });
    return arr;
  }, [data, classById, classNameById]);

  // ================= UI =================
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-50 min-h-screen ml-64">
        <PageHeader
          title="Class Subjects"
          subtitle="Assign subjects to classes with weekly periods"
        />

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

        <div className="mb-4">
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Assign Subject to Class
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Periods/Week
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Consecutive
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-6 text-gray-500">
                      No class-subject mappings found
                    </td>
                  </tr>
                ) : (
                  sortedData.map((row) => (
                    <tr key={row.id || row._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        {classNameById.get(row.classGroupId) || row.classGroupId}
                        <span className="text-xs text-gray-500 ml-1">({row.classGroupId})</span>
                      </td>
                      <td className="px-6 py-4">
                        {subjectNameById.get(row.subjectId) || row.subjectId}
                        <span className="text-xs text-gray-500 ml-1">({row.subjectId})</span>
                      </td>
                      <td className="px-6 py-4">
                        {row.teacherId
                          ? `${teacherNameById.get(row.teacherId) || row.teacherId} (${row.teacherId})`
                          : "—"}
                      </td>
                      <td className="px-6 py-4">{row.periodsPerWeek}</td>
                      <td className="px-6 py-4">{row.roomType}</td>
                      <td className="px-6 py-4">
                        {row.requiresConsecutive
                          ? `Yes (${row.consecutiveSize})`
                          : "No"}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDelete(row.id || row._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= MODAL ================= */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
              <h3 className="text-xl font-bold mb-4">Assign Subject</h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <select
                    className="border rounded-lg px-3 py-2"
                    value={formData.classGroupId}
                    onChange={(e) =>
                      setFormData({ ...formData, classGroupId: e.target.value })
                    }
                  >
                    <option value="">Select Class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.id})
                      </option>
                    ))}
                  </select>

                  <select
                    className="border rounded-lg px-3 py-2"
                    value={formData.subjectId}
                    onChange={(e) =>
                      setFormData({ ...formData, subjectId: e.target.value })
                    }
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <select
                    className="border rounded-lg px-3 py-2"
                    value={formData.teacherId}
                    onChange={(e) =>
                      setFormData({ ...formData, teacherId: e.target.value })
                    }
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.id})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    max="10"
                    className="border rounded-lg px-3 py-2"
                    value={formData.periodsPerWeek}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        periodsPerWeek: parseInt(e.target.value || "0", 10),
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <select
                    className="border rounded-lg px-3 py-2"
                    value={formData.roomType}
                    onChange={(e) =>
                      setFormData({ ...formData, roomType: e.target.value })
                    }
                  >
                    <option value="CLASSROOM">CLASSROOM</option>
                    <option value="LABROOM">LABROOM</option>
                  </select>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.requiresConsecutive}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            requiresConsecutive: e.target.checked,
                          })
                        }
                      />
                      <span>Requires consecutive</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="8"
                      className="border rounded-lg px-3 py-2 w-24"
                      value={formData.consecutiveSize}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          consecutiveSize: parseInt(e.target.value || "0", 10),
                        })
                      }
                      disabled={!formData.requiresConsecutive}
                      title="Consecutive block size"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-300 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
