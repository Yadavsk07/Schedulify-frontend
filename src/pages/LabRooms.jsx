import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api/axiosClient";
import PageHeader from "../components/PageHeader";

export default function LabRooms() {
  const schoolId = localStorage.getItem("schoolId");
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingLab, setEditingLab] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    capacity: 30,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (schoolId) loadLabs();
  }, [schoolId]);

  const loadLabs = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/labs/${schoolId}`);
      setLabs(res.data || []);
    } catch (err) {
      setError("Failed to load lab rooms");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      setError("Lab room name is required");
      return;
    }

    try {
      setError("");
      const payload = { ...formData };

      if (editingLab) {
        await api.put(`/labs/${schoolId}/${editingLab.id}`, payload);
        setSuccess("Lab room updated successfully!");
      } else {
        await api.post(`/labs/${schoolId}`, payload);
        setSuccess("Lab room created successfully!");
      }
      
      setShowModal(false);
      resetForm();
      loadLabs();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err?.response?.data?.error || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(`Delete lab room ${id}?`)) return;
    
    try {
      await api.delete(`/labs/${schoolId}/${id}`);
      setSuccess("Lab room deleted successfully!");
      loadLabs();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err?.response?.data?.error || "Delete failed");
    }
  };

  const handleEdit = (lab) => {
    setEditingLab(lab);
    setFormData({
      id: lab.id || "",
      name: lab.name || "",
      capacity: lab.capacity || 30,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      capacity: 30,
    });
    setEditingLab(null);
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
        <PageHeader title="Lab Rooms" subtitle="Manage your school laboratory rooms" />
        
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
            + Add Lab Room
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading lab rooms...</div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {labs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                      No lab rooms found. Add your first lab room!
                    </td>
                  </tr>
                ) : (
                  labs.map((lab) => (
                    <tr key={lab.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {lab.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lab.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lab.capacity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(lab)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(lab.id)}
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

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">
                {editingLab ? "Edit Lab Room" : "Add Lab Room"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lab Room ID
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    placeholder="Auto-generated if empty"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Physics Lab 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 30 })}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    {editingLab ? "Update" : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
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

