import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api/axiosClient";
import PageHeader from "../components/PageHeader";
import { useNavigate } from "react-router-dom";
import { isAdmin } from "../utils/auth";


export default function Teachers() {

  const navigate = useNavigate();

useEffect(() => {
  if (!isAdmin()) {
    navigate("/login"); // or /unauthorized
  }
}, [navigate]);


  const schoolId = localStorage.getItem("schoolId");

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    subjectIds: "",
    classGroupIds: "", // 🔥 NEW
    maxPeriodsPerWeek: 20,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (schoolId) loadTeachers();
  }, [schoolId]);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/teachers/${schoolId}`);
      setTeachers(res.data || []);
    } catch {
      setError("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.id || !formData.name) {
      setError("Teacher ID and Name are required");
      return;
    }

    try {
      setError("");

      const payload = {
        id: formData.id,
        name: formData.name,
        maxPeriodsPerWeek: formData.maxPeriodsPerWeek,
        subjectIds: formData.subjectIds
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),

        // 🔥 SEND CLASS GROUP IDS
        classGroupIds: formData.classGroupIds
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
      };

      if (editingTeacher) {
        await api.put(`/teachers/${schoolId}/${editingTeacher.id}`, payload);
        setSuccess("Teacher updated successfully!");
      } else {
        await api.post(`/teachers/${schoolId}`, payload);
        setSuccess("Teacher created successfully!");
      }

      closeModal();
      loadTeachers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err?.response?.data?.error || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete teacher ${id}?`)) return;

    try {
      await api.delete(`/teachers/${schoolId}/${id}`);
      setSuccess("Teacher deleted successfully!");
      loadTeachers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err?.response?.data?.error || "Delete failed");
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      id: teacher.id,
      name: teacher.name || "",
      subjectIds: Array.isArray(teacher.subjectIds)
        ? teacher.subjectIds.join(", ")
        : "",
      classGroupIds: Array.isArray(teacher.classGroupIds)
        ? teacher.classGroupIds.join(", ")
        : "", // 🔥
      maxPeriodsPerWeek: teacher.maxPeriodsPerWeek || 20,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      subjectIds: "",
      classGroupIds: "", // 🔥
      maxPeriodsPerWeek: 20,
    });
    setEditingTeacher(null);
    setError("");
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-50 min-h-screen ml-64">
        <PageHeader title="Teachers" subtitle="Manage your school teachers" />

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
            onClick={openModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Add Teacher
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading teachers...</div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Subjects</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Classes</th> {/* 🔥 */}
                  <th className="px-6 py-3 text-left text-xs font-medium">Max</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {teachers.map((t) => (
                  <tr key={t.id}>
                    <td className="px-6 py-4">{t.id}</td>
                    <td className="px-6 py-4">{t.name}</td>
                    <td className="px-6 py-4">{t.subjectIds?.join(", ")}</td>
                    <td className="px-6 py-4">
                      {t.classGroupIds?.join(", ") || "—"}
                    </td>
                    <td className="px-6 py-4">{t.maxPeriodsPerWeek}</td>
                    <td className="px-6 py-4 space-x-3">
                      <button
    onClick={() => handleEdit(t)}
    className="text-blue-600 hover:underline"
  >
    Edit
                      </button>

                     {/* 🔥 VIEW TEACHER TIMETABLE */}
                     {isAdmin() && (
    <button
      onClick={() => navigate(`/admin/teacher/${t.id}/timetable`)}
      className="text-green-600 hover:underline"
    >
      View TT
    </button>
  )}


  <button
    onClick={() => handleDelete(t.id)}
    className="text-red-600 hover:underline"
  >
    Delete
  </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">
                {editingTeacher ? "Edit Teacher" : "Add Teacher"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  placeholder="Teacher ID"
                  value={formData.id}
                  disabled={!!editingTeacher}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className="w-full border p-2 rounded"
                />

                <input
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border p-2 rounded"
                />

                <input
                  placeholder="Subject IDs (S01, S02)"
                  value={formData.subjectIds}
                  onChange={(e) =>
                    setFormData({ ...formData, subjectIds: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                />

                {/* 🔥 CLASS GROUP INPUT */}
                <input
                  placeholder="Class IDs (C9, C10)"
                  value={formData.classGroupIds}
                  onChange={(e) =>
                    setFormData({ ...formData, classGroupIds: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                />

                <input
                  type="number"
                  placeholder="Max Periods"
                  value={formData.maxPeriodsPerWeek}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxPeriodsPerWeek: Number(e.target.value),
                    })
                  }
                  className="w-full border p-2 rounded"
                />

                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-600 text-white p-2 rounded">
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-gray-300 p-2 rounded"
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
