import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api/axiosClient";
import PageHeader from "../components/PageHeader";
import { downloadBlob } from "../utils/downloadFile";
import { useNavigate } from "react-router-dom";


export default function Classes() {
  const schoolId = localStorage.getItem("schoolId");
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    sections: "",
    subjectIds: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (schoolId) loadClasses();
  }, [schoolId]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/classes/${schoolId}`);
      setClasses(res.data || []);
    } catch (err) {
      setError("Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      setError("Class name is required");
      return;
    }

    try {
      setError("");
      const payload = {
        name: formData.name,
        sectionIds: formData.sections 
          ? formData.sections.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        subjectIds: formData.subjectIds 
          ? formData.subjectIds.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      };

      if (editingClass) {
        await api.put(`/classes/${schoolId}/${editingClass.id}`, payload);
        setSuccess("Class updated successfully!");
      } else {
        await api.post(`/classes/${schoolId}`, payload);
        setSuccess("Class created successfully!");
      }
      
      setShowModal(false);
      resetForm();
      loadClasses();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err?.response?.data?.error || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(`Delete class ${id}?`)) return;
    
    try {
      await api.delete(`/classes/${schoolId}/${id}`);
      setSuccess("Class deleted successfully!");
      loadClasses();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err?.response?.data?.error || "Delete failed");
    }
  };

  const handleEdit = (classItem) => {
    setEditingClass(classItem);
    setFormData({
      id: classItem.id || "",
      name: classItem.name || "",
      sections: Array.isArray(classItem.sections) ? classItem.sections.map(s => s.sectionId || s).join(", ") : "",
      subjectIds: Array.isArray(classItem.subjectIds) ? classItem.subjectIds.join(", ") : "",
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      sections: "",
      subjectIds: "",
    });
    setEditingClass(null);
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

  const downloadClassPdf = async (classId, sectionId) => {
    try {
      const res = await api.get(`/pdf/class/${schoolId}/${classId}/${sectionId}`, {
        responseType: "blob"
      });
      downloadBlob(res, `Class_${classId}_${sectionId}.pdf`);
    } catch (e) {
      alert("PDF download failed");
    }
  };

  const viewTimetable = (classId) => {
  navigate(`/dashboard/class-timetable/${classId}`);
};


  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-50 min-h-screen ml-64">
        <PageHeader title="Classes" subtitle="Manage your school classes and sections" />
        
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
            + Add Class
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading classes...</div>
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
                    Sections
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subjects
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {classes.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No classes found. Add your first class!
                    </td>
                  </tr>
                ) : (
                  classes.map((classItem) => {
                    const sections = Array.isArray(classItem.sections) 
                      ? classItem.sections.map(s => s.sectionId || s) 
                      : [];
                    return (
                      <tr key={classItem.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {classItem.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {classItem.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {sections.length > 0 ? sections.join(", ") : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {Array.isArray(classItem.subjectIds) ? classItem.subjectIds.join(", ") : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEdit(classItem)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          {sections.length > 0 && (
                            <>
                              <button
                                onClick={() => viewTimetable(classItem.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                View TT
                              </button>
                              
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(classItem.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
              <h3 className="text-xl font-bold mb-4">
                {editingClass ? "Edit Class" : "Add Class"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class ID
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
                    Class Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Class 10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sections (comma-separated)
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="A, B, C"
                    value={formData.sections}
                    onChange={(e) => setFormData({ ...formData, sections: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject IDs (comma-separated)
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="S01, S02, S03"
                    value={formData.subjectIds}
                    onChange={(e) => setFormData({ ...formData, subjectIds: e.target.value })}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    {editingClass ? "Update" : "Create"}
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

