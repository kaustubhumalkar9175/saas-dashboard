const Project = require('../models/Project');
const logActivity = require('../utils/activityLogger');
// GET /api/projects
// Get all projects for logged-in user
exports.getProjects = async (req, res) => {
    try {
        const { status, search } = req.query;

        const filter = { userId: req.user._id };

        if (status) {
            filter.status = status;
        }

        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

        const projects = await Project.find(filter).sort({ createdAt: -1 });

        res.json({
            count: projects.length,
            projects,
        });
    } catch (err) {
        console.error('GET PROJECTS ERROR:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// GET /api/projects/:id
// Get single project by ID
exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Make sure the project belongs to the logged-in user
        if (project.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json({ project });
    } catch (err) {
        console.error('GET PROJECT ERROR:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// POST /api/projects
// Create a new project
exports.createProject = async (req, res) => {
    try {
        const { name, description, status, startDate, endDate } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Project name is required' });
        }

        const project = await Project.create({
            userId: req.user._id,
            name,
            description,
            status,
            startDate,
            endDate,
        });

        await logActivity({
            userId: req.user._id,
            action: 'project_created',
            entityType: 'project',
            entityId: project._id,
            description: `Project "${project.name}" was created`,
        });

        res.status(201).json({ project });
    } catch (err) {
        console.error('CREATE PROJECT ERROR:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// PUT /api/projects/:id
// Update a project
exports.updateProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { name, description, status, startDate, endDate } = req.body;

        if (name) project.name = name;
        if (description !== undefined) project.description = description;
        if (status) project.status = status;
        if (startDate) project.startDate = startDate;
        if (endDate) project.endDate = endDate;

        const updated = await project.save();

        res.json({ project: updated });
    } catch (err) {
        console.error('UPDATE PROJECT ERROR:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// DELETE /api/projects/:id
// Delete a project
exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await project.deleteOne();

        res.json({ message: 'Project deleted successfully' });
    } catch (err) {
        console.error('DELETE PROJECT ERROR:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};