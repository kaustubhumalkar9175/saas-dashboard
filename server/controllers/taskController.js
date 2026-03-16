const Task = require('../models/Task');
const Project = require('../models/Project');
const logActivity = require('../utils/activityLogger');
// Helper - check project belongs to user
const verifyProjectOwner = async (projectId, userId) => {
    const project = await Project.findById(projectId);
    if (!project) return { error: 'Project not found', status: 404 };
    if (project.userId.toString() !== userId.toString()) {
        return { error: 'Not authorized', status: 403 };
    }
    return { project };
};

// GET /api/tasks?projectId=&status=&priority=&search=
exports.getTasks = async (req, res) => {
    try {
        const { projectId, status, priority, search } = req.query;

        if (!projectId) {
            return res.status(400).json({ message: 'projectId is required' });
        }

        const { error, status: errStatus } = await verifyProjectOwner(
            projectId,
            req.user._id
        );
        if (error) return res.status(errStatus).json({ message: error });

        const filter = { projectId };
        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (search) filter.title = { $regex: search, $options: 'i' };

        const tasks = await Task.find(filter)
            .populate('assignedTo', 'name email avatar')
            .sort({ createdAt: -1 });

        res.json({ count: tasks.length, tasks });
    } catch (err) {
        console.error('GET TASKS ERROR:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// GET /api/tasks/:id
exports.getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('assignedTo', 'name email avatar')
            .populate('projectId', 'name status');

        if (!task) return res.status(404).json({ message: 'Task not found' });

        const { error, status } = await verifyProjectOwner(
            task.projectId,
            req.user._id
        );
        if (error) return res.status(status).json({ message: error });

        res.json({ task });
    } catch (err) {
        console.error('GET TASK ERROR:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// POST /api/tasks
exports.createTask = async (req, res) => {
    try {
        const { projectId, title, description, status, priority, assignedTo, dueDate } = req.body;

        if (!projectId) return res.status(400).json({ message: 'projectId is required' });
        if (!title) return res.status(400).json({ message: 'Title is required' });

        const { error, status: errStatus } = await verifyProjectOwner(
            projectId,
            req.user._id
        );
        if (error) return res.status(errStatus).json({ message: error });

        const task = await Task.create({
            projectId,
            title,
            description,
            status,
            priority,
            assignedTo,
            dueDate,
        });

        res.status(201).json({ task });
    } catch (err) {
        console.error('CREATE TASK ERROR:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const { error, status } = await verifyProjectOwner(
            task.projectId,
            req.user._id
        );
        if (error) return res.status(status).json({ message: error });

        const { title, description, status: taskStatus, priority, assignedTo, dueDate } = req.body;

        if (title) task.title = title;
        if (description !== undefined) task.description = description;
        if (taskStatus) task.status = taskStatus;
        if (priority) task.priority = priority;
        if (assignedTo !== undefined) task.assignedTo = assignedTo;
        if (dueDate) task.dueDate = dueDate;

        const updated = await task.save();
        res.json({ task: updated });
    } catch (err) {
        console.error('UPDATE TASK ERROR:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// PATCH /api/tasks/:id/status
exports.updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const allowed = ['pending', 'in_progress', 'completed'];
        if (!allowed.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const { error, status: errStatus } = await verifyProjectOwner(
            task.projectId,
            req.user._id
        );
        if (error) return res.status(errStatus).json({ message: error });

        task.status = status;
        const updated = await task.save();
        if (status === 'completed') {
            await logActivity({
                userId: req.user._id,
                action: 'task_completed',
                entityType: 'task',
                entityId: task._id,
                description: `Task "${task.title}" was marked completed`,
            });
        }
        res.json({ task: updated });
    } catch (err) {
        console.error('UPDATE STATUS ERROR:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const { error, status } = await verifyProjectOwner(
            task.projectId,
            req.user._id
        );
        if (error) return res.status(status).json({ message: error });

        await task.deleteOne();
        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        console.error('DELETE TASK ERROR:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};