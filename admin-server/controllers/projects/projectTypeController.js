import ProjectType from '../../models/projects/ProjectType.js';

export const getAllProjectTypes = async (req, res, next) => {
    try {
        const { status } = req.query;
        const query = {};
        if (status !== undefined) query.status = status === 'true';

        const types = await ProjectType.find(query).sort({ createdAt: -1 });
        res.json({ success: true, count: types.length, data: types });
    } catch (err) {
        next(err);
    }
};

export const createProjectType = async (req, res, next) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

        const type = await ProjectType.create({
            name,
            createdBy: req.user?.id
        });

        res.status(201).json({ success: true, message: 'Project Type created successfully', data: type });
    } catch (err) {
        next(err);
    }
};

export const updateProjectType = async (req, res, next) => {
    try {
        const { name, status } = req.body;

        const type = await ProjectType.findByIdAndUpdate(
            req.params.id,
            { name, status, updatedBy: req.user?.id },
            { new: true, runValidators: true }
        );

        if (!type) return res.status(404).json({ success: false, message: 'Project Type not found' });

        res.json({ success: true, message: 'Project Type updated successfully', data: type });
    } catch (err) {
        next(err);
    }
};

export const deleteProjectType = async (req, res, next) => {
    try {
        const type = await ProjectType.findByIdAndDelete(req.params.id);
        if (!type) return res.status(404).json({ success: false, message: 'Project Type not found' });
        res.json({ success: true, message: 'Project Type deleted successfully' });
    } catch (err) {
        next(err);
    }
}
