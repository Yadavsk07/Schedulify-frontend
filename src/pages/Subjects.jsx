import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api/axiosClient";
import PageHeader from "../components/PageHeader";

export default function Subjects() {
  const schoolId = localStorage.getItem("schoolId");
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    code: "",
    requiresConsecutive: false,
    consecutiveSize: 2,
    roomType: "CLASSROOM",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (schoolId) loadSubjects();
  }, [schoolId]);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/subjects/${schoolId}`);
      setSubjects(res.data || []);
    } catch (err) {
      setError("Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      setError("Subject name is required");
      return;
    }

    try {
      setError("");

      const payload = {
        id: formData.id || undefined,
        name: formData.name,
        code: formData.code,
        roomType: formData.roomType,
        requiresConsecutive: formData.requiresConsecutive,
        consecutiveSize: formData.requiresConsecutive
          ? formData.consecutiveSize
          : 0,
      };

      if (editingSubject) {
        await api.put(
          `/subjects/${schoolId}/${editingSubject.id}`,
          payload
        );
        setSuccess("Subject updated successfully!");
      } else {
        await api.post(`/subjects/${schoolId}`, payload);
        setSuccess("Subject created successfully!");
      }

      setShowModal(false);
      resetForm();
      loadSubjects();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err?.response?.data?.error || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(`Delete subject ${id}?`)) return;

    try {
      await api.delete(`/subjects/${schoolId}/${id}`);
      setSuccess("Subject deleted successfully!");
      loadSubjects();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err?.response?.data?.error || "Delete failed");
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({
      id: subject.id || "",
      name: subject.name || "",
      code: subject.code || "",
      requiresConsecutive: subject.requiresConsecutive || false,
      consecutiveSize: subject.consecutiveSize || 2,
      roomType: subject.roomType || "CLASSROOM",
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      code: "",
      requiresConsecutive: false,
      consecutiveSize: 2,
      roomType: "CLASSROOM",
    });
    setEditingSubject(null);
    setError("");
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-50 min-h-screen ml-64">
        <PageHeader title="Subjects" subtitle="Manage subject master data" />

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

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg mb-4"
        >
          + Add Subject
        </button>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Code</th>
                <th className="px-6 py-3">Room Type</th>
                <th className="px-6 py-3">Consecutive</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500">
                    No subjects found
                  </td>
                </tr>
              ) : (
                subjects.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">{s.id}</td>
                    <td className="px-6 py-3">{s.name}</td>
                    <td className="px-6 py-3">{s.code || "—"}</td>
                    <td className="px-6 py-3">{s.roomType}</td>
                    <td className="px-6 py-3">
                      {s.requiresConsecutive
                        ? `Yes (${s.consecutiveSize})`
                        : "No"}
                    </td>
                    <td className="px-6 py-3 space-x-2">
                      <button
                        onClick={() => handleEdit(s)}
                        className="text-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="text-red-600"
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

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-xl">
              <h3 className="text-lg font-bold mb-4">
                {editingSubject ? "Edit Subject" : "Add Subject"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  placeholder="Subject Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded"
                  required
                />

                <input
                  placeholder="Code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded"
                />

                <select
                  value={formData.roomType}
                  onChange={(e) =>
                    setFormData({ ...formData, roomType: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="CLASSROOM">Classroom</option>
                  <option value="LAB">Lab</option>
                </select>

                <select
                  value={formData.requiresConsecutive}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requiresConsecutive: e.target.value === "true",
                    })
                  }
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value={false}>No consecutive</option>
                  <option value={true}>Requires consecutive</option>
                </select>

                {formData.requiresConsecutive && (
                  <input
                    type="number"
                    min="2"
                    max="4"
                    value={formData.consecutiveSize}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        consecutiveSize: Number(e.target.value),
                      })
                    }
                    className="w-full border px-3 py-2 rounded"
                  />
                )}

                <div className="flex gap-3">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded flex-1">
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-gray-300 px-4 py-2 rounded flex-1"
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
