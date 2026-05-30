import ProjectDescription from '../../models/projects/ProjectDescription.js';

// ✅ GET ALL
export const getAll = async (req, res) => {
  try {
    const data = await ProjectDescription.find()
      .populate('projectTypeId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ CREATE
export const create = async (req, res) => {
  try {
    const { description, projectTypeId } = req.body;

    const newItem = await ProjectDescription.create({
      description,
      projectTypeId,
    });

    res.json({ success: true, data: newItem });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ UPDATE
export const update = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await ProjectDescription.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ DELETE
export const remove = async (req, res) => {
  try {
    const { id } = req.params;

    await ProjectDescription.findByIdAndDelete(id);

    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};