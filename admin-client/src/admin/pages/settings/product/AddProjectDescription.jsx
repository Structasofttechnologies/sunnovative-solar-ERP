import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Check, X, CheckCircle, AlertCircle } from 'lucide-react';
import { productApi } from '../../../../api/productApi';

const AddProjectDescription = () => {
  const [projectTypes, setProjectTypes] = useState([]);
  const [descriptions, setDescriptions] = useState([]);

  const [selectedProjectType, setSelectedProjectType] = useState('');
  const [descriptionText, setDescriptionText] = useState('');

  const [editingItem, setEditingItem] = useState(null);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const fetchData = async () => {
    try {
      const [ptRes, descRes] = await Promise.all([
        productApi.getProjectTypes(),
        productApi.getProjectDescriptions()
      ]);

      const pts = ptRes?.data?.data || [];
      setProjectTypes(pts);
      setDescriptions(descRes?.data?.data || []);

      if (pts.length > 0) setSelectedProjectType(pts[0]._id);
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch data', 'error');
    }
  };

  // ✅ ADD
  const handleAdd = async () => {
    if (!descriptionText.trim()) return showToast('Enter description', 'error');

    try {
      await productApi.createProjectDescription({
        description: descriptionText,
        projectTypeId: selectedProjectType
      });

      showToast('Description added');
      setDescriptionText('');
      fetchData();
    } catch (err) {
      showToast('Add failed', 'error');
    }
  };

  // ✅ DELETE
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this?')) return;

    try {
      await productApi.deleteProjectDescription(id);
      showToast('Deleted');
      fetchData();
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  // ✅ EDIT START
  const handleEditStart = (item) => {
    setEditingItem({
      id: item._id,
      description: item.description,
      projectTypeId: item.projectTypeId?._id
    });
  };

  // ✅ SAVE
  const handleEditSave = async () => {
    try {
      await productApi.updateProjectDescription(editingItem.id, editingItem);
      showToast('Updated');
      setEditingItem(null);
      fetchData();
    } catch {
      showToast('Update failed', 'error');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Toast */}
      <div className="fixed top-4 right-4 space-y-2">
        {toasts.map(t => (
          <div key={t.id} className={`p-3 rounded text-white ${t.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {t.msg}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="bg-blue-600 text-white text-center py-2 font-bold rounded">
        Add Project Description
      </div>

      {/* Form */}
      <div className="bg-white p-4 shadow mt-4 rounded">

        {/* Dropdown */}
        <select
          value={selectedProjectType}
          onChange={(e) => setSelectedProjectType(e.target.value)}
          className="border p-2 w-full mb-3"
        >
          {projectTypes.map(pt => (
            <option key={pt._id} value={pt._id}>
              {pt.name}
            </option>
          ))}
        </select>

        {/* Input */}
        <textarea
          placeholder="Enter Description"
          value={descriptionText}
          onChange={(e) => setDescriptionText(e.target.value)}
          className="border p-2 w-full mb-3"
        />

        <button
          onClick={handleAdd}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          + Add
        </button>
      </div>

      {/* List */}
      <div className="mt-6 bg-white p-4 shadow rounded">

        {descriptions.map((item, i) => (
          <div key={item._id} className="border-b py-3 flex justify-between">

            {editingItem?.id === item._id ? (
              <div className="flex-1 mr-4">
                <select
                  value={editingItem.projectTypeId}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, projectTypeId: e.target.value })
                  }
                  className="border p-1 mb-1 w-full"
                >
                  {projectTypes.map(pt => (
                    <option key={pt._id} value={pt._id}>{pt.name}</option>
                  ))}
                </select>

                <textarea
                  value={editingItem.description}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, description: e.target.value })
                  }
                  className="border p-1 w-full"
                />
              </div>
            ) : (
              <div>
                <p className="font-semibold">
                  {item.projectTypeId?.name}
                </p>
                <p className="text-sm text-gray-600">
                  {item.description}
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-2">
              {editingItem?.id === item._id ? (
                <>
                  <button onClick={handleEditSave} className="text-green-500">
                    <Check size={18} />
                  </button>
                  <button onClick={() => setEditingItem(null)} className="text-gray-500">
                    <X size={18} />
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => handleEditStart(item)} className="text-orange-500">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(item._id)} className="text-red-500">
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default AddProjectDescription;