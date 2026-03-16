import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';

const statusStyles = {
  pending:     'bg-amber-100 text-amber-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed:   'bg-green-100 text-green-700',
};

const priorityStyles = {
  low:    'bg-gray-100 text-gray-600',
  medium: 'bg-purple-100 text-purple-700',
  high:   'bg-red-100 text-red-700',
};

const emptyTask = {
  title:       '',
  description: '',
  status:      'pending',
  priority:    'medium',
  dueDate:     '',
};

const ProjectDetail = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();

  const [project,    setProject]    = useState(null);
  const [tasks,      setTasks]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showModal,  setShowModal]  = useState(false);
  const [editTask,   setEditTask]   = useState(null);
  const [form,       setForm]       = useState(emptyTask);
  const [submitting, setSubmitting] = useState(false);
  const [filter,     setFilter]     = useState({ status: '', priority: '' });

  const fetchProject = async () => {
    try {
      const res = await API.get(`/projects/${id}`);
      setProject(res.data.project);
    } catch {
      toast.error('Project not found');
      navigate('/projects');
    }
  };

  const fetchTasks = async () => {
    try {
      const params = { projectId: id };
      if (filter.status)   params.status   = filter.status;
      if (filter.priority) params.priority = filter.priority;
      const res = await API.get('/tasks', { params });
      setTasks(res.data.tasks);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  fetchProject();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [id]);

useEffect(() => {
  fetchTasks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [id, filter]);

  const openCreate = () => {
    setEditTask(null);
    setForm(emptyTask);
    setShowModal(true);
  };

  const openEdit = (task) => {
    setEditTask(task);
    setForm({
      title:       task.title,
      description: task.description || '',
      status:      task.status,
      priority:    task.priority,
      dueDate:     task.dueDate?.slice(0, 10) || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditTask(null);
    setForm(emptyTask);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Task title is required');
    setSubmitting(true);
    try {
      if (editTask) {
        await API.put(`/tasks/${editTask._id}`, form);
        toast.success('Task updated');
      } else {
        await API.post('/tasks', { ...form, projectId: id });
        toast.success('Task created');
      }
      closeModal();
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await API.delete(`/tasks/${taskId}`);
      toast.success('Task deleted');
      fetchTasks();
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await API.patch(`/tasks/${taskId}/status`, { status: newStatus });
      toast.success('Status updated');
      fetchTasks();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Delete this entire project and all its tasks?')) return;
    try {
      await API.delete(`/projects/${id}`);
      toast.success('Project deleted');
      navigate('/projects');
    } catch {
      toast.error('Failed to delete project');
    }
  };

  // Task counts
  const counts = {
    total:       tasks.length,
    pending:     tasks.filter((t) => t.status === 'pending').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    completed:   tasks.filter((t) => t.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"/>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link to="/projects" className="hover:text-blue-600 transition">Projects</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium truncate">{project?.name}</span>
      </div>

      {/* Project header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900">{project?.name}</h2>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium
                ${project?.status === 'active'    ? 'bg-green-100 text-green-700' : ''}
                ${project?.status === 'on_hold'   ? 'bg-amber-100 text-amber-700' : ''}
                ${project?.status === 'completed' ? 'bg-blue-100  text-blue-700'  : ''}
              `}>
                {project?.status?.replace('_', ' ')}
              </span>
            </div>
            {project?.description && (
              <p className="text-sm text-gray-500 mt-2">{project.description}</p>
            )}
            {project?.startDate && (
              <p className="text-xs text-gray-400 mt-2">
                Started {new Date(project.startDate).toLocaleDateString()}
                {project.endDate && ` · Due ${new Date(project.endDate).toLocaleDateString()}`}
              </p>
            )}
          </div>
          <button
            onClick={handleDeleteProject}
            className="shrink-0 inline-flex items-center gap-2 text-sm text-red-500
                       hover:bg-red-50 border border-red-200 px-3 py-2 rounded-xl transition
                       self-start"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5
                   4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            Delete project
          </button>
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {[
            { label: 'Total',       value: counts.total,       color: 'text-gray-900' },
            { label: 'Pending',     value: counts.pending,     color: 'text-amber-600' },
            { label: 'In Progress', value: counts.in_progress, color: 'text-blue-600' },
            { label: 'Completed',   value: counts.completed,   color: 'text-green-600' },
          ].map((s) => (
            <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tasks header + filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                     text-white text-sm font-medium px-4 py-2.5 rounded-xl transition
                     self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          Add Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white
                     focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700
                     sm:w-44"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={filter.priority}
          onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white
                     focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700
                     sm:w-44"
        >
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {/* Tasks list */}
      {tasks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center
                          justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2
                   M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No tasks found</p>
          <p className="text-sm text-gray-400 mt-1">Add your first task to get started</p>
          <button
            onClick={openCreate}
            className="mt-4 bg-blue-600 text-white text-sm px-4 py-2
                       rounded-xl hover:bg-blue-700 transition"
          >
            Add Task
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4
                         sm:p-5 hover:shadow-md transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">

                {/* Left — title + badges */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${statusStyles[task.status]}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${priorityStyles[task.priority]}`}>
                      {task.priority}
                    </span>
                    {task.dueDate && (
                      <span className="text-xs text-gray-400">
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Right — status changer + actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5
                               bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
                               text-gray-700 cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <button
                    onClick={() => openEdit(task)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600
                               hover:bg-blue-50 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5
                           m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(task._id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600
                               hover:bg-red-50 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858
                           L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center
                        px-4 bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md
                          max-h-screen overflow-y-auto">

            <div className="flex items-center justify-between px-6 py-4
                            border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">
                {editTask ? 'Edit Task' : 'New Task'}
              </h3>
              <button onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Design login page"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Task details..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200
                               text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                               bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200
                               text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                               bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due date
                </label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200
                             text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700
                             disabled:bg-blue-400 text-white text-sm font-medium transition"
                >
                  {submitting ? 'Saving...' : editTask ? 'Save changes' : 'Add task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;