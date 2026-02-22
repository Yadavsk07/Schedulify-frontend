import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api/axiosClient";
import PageHeader from "../components/PageHeader";

export default function Subjects() {
  const schoolId = localStorage.getItem("schoolId");
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classSubjects, setClassSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [formData, setFormData] = useState({
    classGroupId: "",
    subjectId: "",
    name: "",
    code: "",
    periodsPerWeek: 4,
    roomType: "CLASSROOM",
    requiresConsecutive: false,
    consecutiveSize: 2,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (schoolId) loadAll();
  }, [schoolId]);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [subjectsRes, classesRes, classSubjectsRes] = await Promise.all([
        api.get(`/subjects/${schoolId}`),
        api.get(`/classes/${schoolId}`),
        api.get(`/class-subjects/${schoolId}`),
      ]);
      setSubjects(subjectsRes.data || []);
      setClasses(classesRes.data || []);
      setClassSubjects(classSubjectsRes.data || []);
    } catch {
      setError("Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  const getClassNumber = (classItem) => {
    const fromName = String(classItem?.name || "").match(/(\d{1,2})/);
    if (fromName) return Number(fromName[1]);
    const fromId = String(classItem?.id || "").match(/(\d{1,2})/);
    if (fromId) return Number(fromId[1]);
    return 999;
  };

  const toRoman = (n) => {
    const map = [
      [10, "X"],
      [9, "IX"],
      [5, "V"],
      [4, "IV"],
      [1, "I"],
    ];
    let num = Number(n || 0);
    if (!num || num < 1 || num > 20) return String(n || "");
    let out = "";
    for (const [v, s] of map) {
      while (num >= v) {
        out += s;
        num -= v;
      }
    }
    return out;
  };

  const subjectsById = useMemo(
    () => new Map(subjects.map((s) => [s.id, s])),
    [subjects]
  );

  const classRows = useMemo(
    () =>
      classes
        .map((c) => {
          const rows = classSubjects
            .filter((cs) => cs.classGroupId === c.id)
            .map((cs) => {
              const s = subjectsById.get(cs.subjectId) || {};
              return {
                mappingId: cs.id || cs._id,
                classGroupId: cs.classGroupId,
                subjectId: cs.subjectId,
                name: s.name || cs.subjectId,
                code: s.code || "",
                periodsPerWeek: cs.periodsPerWeek ?? s.periodsPerWeek ?? 4,
                roomType: cs.roomType || s.roomType || "CLASSROOM",
                requiresConsecutive: Boolean(cs.requiresConsecutive),
                consecutiveSize: cs.consecutiveSize || 2,
              };
            })
            .sort((a, b) => String(a.subjectId).localeCompare(String(b.subjectId)));
          return { ...c, rows, classNo: getClassNumber(c) };
        })
        .sort((a, b) => a.classNo - b.classNo),
    [classes, classSubjects, subjectsById]
  );

  const resetForm = () => {
    setFormData({
      classGroupId: classes[0]?.id || "",
      subjectId: "",
      name: "",
      code: "",
      periodsPerWeek: 4,
      roomType: "CLASSROOM",
      requiresConsecutive: false,
      consecutiveSize: 2,
    });
    setEditingRow(null);
    setError("");
  };

  const openAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (row) => {
    setEditingRow(row);
    setFormData({
      classGroupId: row.classGroupId || "",
      subjectId: row.subjectId || "",
      name: row.name || "",
      code: row.code || "",
      periodsPerWeek: Number(row.periodsPerWeek || 4),
      roomType: row.roomType || "CLASSROOM",
      requiresConsecutive: Boolean(row.requiresConsecutive),
      consecutiveSize: Number(row.consecutiveSize || 2),
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.classGroupId) {
      setError("Please select a class");
      return;
    }
    if (!formData.name) {
      setError("Subject name is required");
      return;
    }

    try {
      setError("");
      const subjectPayload = {
        id: formData.subjectId || undefined,
        name: formData.name,
        code: formData.code,
        periodsPerWeek: Number(formData.periodsPerWeek || 4),
        roomType: formData.roomType,
        requiresConsecutive: Boolean(formData.requiresConsecutive),
        consecutiveSize: formData.requiresConsecutive
          ? Number(formData.consecutiveSize || 2)
          : 2,
      };

      let finalSubjectId = formData.subjectId;
      if (editingRow) {
        await api.put(`/subjects/${schoolId}/${formData.subjectId}`, subjectPayload);
      } else {
        const subjectRes = await api.post(`/subjects/${schoolId}`, subjectPayload);
        finalSubjectId = subjectRes?.data?.id || subjectRes?.data?.subjectId || formData.subjectId;
      }

      const mappingPayload = {
        classGroupId: formData.classGroupId,
        subjectId: finalSubjectId,
        periodsPerWeek: Number(formData.periodsPerWeek || 4),
        roomType: formData.roomType,
        requiresConsecutive: Boolean(formData.requiresConsecutive),
        consecutiveSize: formData.requiresConsecutive
          ? Number(formData.consecutiveSize || 2)
          : 2,
      };

      if (editingRow) {
        await api.put(
          `/class-subjects/${schoolId}/${editingRow.mappingId}`,
          mappingPayload
        );
        setSuccess("Class subject updated successfully!");
      } else {
        await api.post(`/class-subjects/${schoolId}`, mappingPayload);
        setSuccess("Subject added to class successfully!");
      }

      closeModal();
      loadAll();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err?.response?.data?.error || "Operation failed");
    }
  };

  const handleDelete = async (mappingId) => {
    if (!confirm("Delete this subject from the class?")) return;
    try {
      await api.delete(`/class-subjects/${schoolId}/${mappingId}`);
      setSuccess("Subject removed from class successfully!");
      loadAll();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err?.response?.data?.error || "Delete failed");
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-50 min-h-screen ml-64">
        <PageHeader
          title="Subjects"
          subtitle="Manage subjects class-wise with periods and constraints"
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

        <button
          onClick={openAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg mb-4"
        >
          + Add Subject
        </button>

        <div className="space-y-8">
          {loading ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              Loading class-wise subjects...
            </div>
          ) : classRows.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              No class-subject data found.
            </div>
          ) : (
            classRows.map((cls) => (
              <div key={cls.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50">
                  <h3 className="font-semibold text-gray-900">
                    {`STD - ${toRoman(cls.classNo)}`}{" "}
                    <span className="text-gray-500 text-sm">{`(${cls.name})`}</span>
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">Code</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">Periods/Week</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">Room Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">Requires Consecutive</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">Consecutive Size</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {cls.rows.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="px-4 py-4 text-center text-gray-500">
                            No subject mappings for this class
                          </td>
                        </tr>
                      ) : (
                        cls.rows.map((row) => (
                          <tr key={`${cls.id}-${row.mappingId}`} className="hover:bg-gray-50">
                            <td className="px-4 py-3">{row.subjectId}</td>
                            <td className="px-4 py-3">{row.name}</td>
                            <td className="px-4 py-3">{row.code || "—"}</td>
                            <td className="px-4 py-3">{row.periodsPerWeek}</td>
                            <td className="px-4 py-3">{row.roomType}</td>
                            <td className="px-4 py-3">{row.requiresConsecutive ? "Yes" : "No"}</td>
                            <td className="px-4 py-3">{row.requiresConsecutive ? row.consecutiveSize : "—"}</td>
                            <td className="px-4 py-3 space-x-3">
                              <button
                                onClick={() => openEdit(row)}
                                className="text-blue-600 hover:underline"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(row.mappingId)}
                                className="text-red-600 hover:underline"
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
              </div>
            ))
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-xl">
              <h3 className="text-lg font-bold mb-4">
                {editingRow ? "Edit Class Subject" : "Add Subject to Class"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <select
                  value={formData.classGroupId}
                  onChange={(e) =>
                    setFormData({ ...formData, classGroupId: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded"
                  required
                  disabled={!!editingRow}
                >
                  <option value="">Select Class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id})
                    </option>
                  ))}
                </select>

                <input
                  placeholder="Subject ID (e.g., S16)"
                  value={formData.subjectId}
                  onChange={(e) =>
                    setFormData({ ...formData, subjectId: e.target.value.trim() })
                  }
                  className="w-full border px-3 py-2 rounded"
                  disabled={!!editingRow}
                  required
                />

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

                <input
                  type="number"
                  min="1"
                  max="12"
                  placeholder="Periods/Week"
                  value={formData.periodsPerWeek}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      periodsPerWeek: Number(e.target.value || 1),
                    })
                  }
                  className="w-full border px-3 py-2 rounded"
                  required
                />

                <select
                  value={formData.roomType}
                  onChange={(e) =>
                    setFormData({ ...formData, roomType: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="CLASSROOM">CLASSROOM</option>
                  <option value="LAB">LAB</option>
                  <option value="LABROOM">LABROOM</option>
                </select>

                <select
                  value={String(formData.requiresConsecutive)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requiresConsecutive: e.target.value === "true",
                    })
                  }
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="false">No consecutive</option>
                  <option value="true">Requires consecutive</option>
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
                        consecutiveSize: Number(e.target.value || 2),
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
                    onClick={closeModal}
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
