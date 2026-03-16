import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie,
  Cell, Legend,
} from 'recharts';
import API from '../api/axios';
import { useAuth } from '../api/context/AuthContext';

const StatCard = ({ title, value, sub, color }) => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
    <p className="text-sm text-gray-500 font-medium">{title}</p>
    <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
    <p className="text-xs text-gray-400 mt-1">{sub}</p>
  </div>
);

const COLORS = ['#3b82f6', '#f59e0b', '#10b981'];

const Dashboard = () => {
  const { user }                        = useAuth();
  const [projects,  setProjects]        = useState([]);
  const [tasks,     setTasks]           = useState([]);
  const [activity,  setActivity]        = useState([]);
  const [loading,   setLoading]         = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, actRes] = await Promise.all([
          API.get('/projects'),
          API.get('/activity'),
        ]);

        const allProjects = projRes.data.projects;
        setProjects(allProjects);
        setActivity(actRes.data.logs);

        // Fetch tasks for all projects
        const taskPromises = allProjects.map((p) =>
          API.get(`/tasks?projectId=${p._id}`).then((r) => r.data.tasks)
        );
        const taskArrays = await Promise.all(taskPromises);
        setTasks(taskArrays.flat());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Stats
  const totalProjects  = projects.length;
  const totalTasks     = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const pendingTasks   = tasks.filter((t) => t.status === 'pending').length;

  // Pie chart data — project status
  const projectStatusData = [
    { name: 'Active',    value: projects.filter((p) => p.status === 'active').length },
    { name: 'On Hold',   value: projects.filter((p) => p.status === 'on_hold').length },
    { name: 'Completed', value: projects.filter((p) => p.status === 'completed').length },
  ].filter((d) => d.value > 0);

  // Bar chart data — tasks per project (max 6)
  const taskBarData = projects.slice(0, 6).map((p) => ({
    name:      p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name,
    tasks:     tasks.filter((t) => t.projectId === p._id || t.projectId?._id === p._id).length,
  }));

  // Task status pie
  const taskStatusData = [
    { name: 'Pending',     value: pendingTasks },
    { name: 'In Progress', value: tasks.filter((t) => t.status === 'in_progress').length },
    { name: 'Completed',   value: completedTasks },
  ].filter((d) => d.value > 0);

  const TASK_COLORS = ['#f59e0b', '#3b82f6', '#10b981'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"/>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Welcome */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Good day, {user?.name?.split(' ')[0]} 👋
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Projects"
          value={totalProjects}
          sub="All time"
          color="text-blue-600"
        />
        <StatCard
          title="Total Tasks"
          value={totalTasks}
          sub="Across all projects"
          color="text-gray-900"
        />
        <StatCard
          title="Completed"
          value={completedTasks}
          sub="Tasks done"
          color="text-green-600"
        />
        <StatCard
          title="Pending"
          value={pendingTasks}
          sub="Tasks remaining"
          color="text-amber-500"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Bar chart — tasks per project */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Tasks per project</h3>
          {taskBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={taskBarData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false}/>
                <Tooltip />
                <Bar dataKey="tasks" fill="#3b82f6" radius={[6, 6, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">
              No projects yet
            </div>
          )}
        </div>

        {/* Pie chart — project status */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Project status</h3>
          {projectStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {projectStatusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]}/>
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={8}/>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">
              No projects yet
            </div>
          )}
        </div>
      </div>

      {/* Task status pie + Recent activity row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Task status pie */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Task status breakdown</h3>
          {taskStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {taskStatusData.map((_, i) => (
                    <Cell key={i} fill={TASK_COLORS[i % TASK_COLORS.length]}/>
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={8}/>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">
              No tasks yet
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Recent activity</h3>
          {activity.length > 0 ? (
            <div className="space-y-3 overflow-y-auto max-h-52">
              {activity.slice(0, 8).map((log) => (
                <div key={log._id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"/>
                  <div>
                    <p className="text-sm text-gray-700">{log.description}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">
              No activity yet
            </div>
          )}
        </div>
      </div>

      {/* Recent projects */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">Recent projects</h3>
          <Link to="/projects" className="text-xs text-blue-600 hover:underline font-medium">
            View all
          </Link>
        </div>

        {projects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-xs border-b border-gray-100">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium hidden sm:table-cell">Status</th>
                  <th className="pb-3 font-medium hidden md:table-cell">Created</th>
                  <th className="pb-3 font-medium">Tasks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {projects.slice(0, 5).map((p) => {
                  const pTasks = tasks.filter(
                    (t) => t.projectId === p._id || t.projectId?._id === p._id
                  );
                  return (
                    <tr key={p._id} className="hover:bg-gray-50 transition">
                      <td className="py-3 pr-4">
                        <Link
                          to={`/projects/${p._id}`}
                          className="font-medium text-gray-800 hover:text-blue-600 transition"
                        >
                          {p.name}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 hidden sm:table-cell">
                        <span className={`
                          inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                          ${p.status === 'active'    ? 'bg-green-100 text-green-700'  : ''}
                          ${p.status === 'on_hold'   ? 'bg-amber-100 text-amber-700'  : ''}
                          ${p.status === 'completed' ? 'bg-blue-100  text-blue-700'   : ''}
                        `}>
                          {p.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-gray-400 hidden md:table-cell">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-gray-600">
                        {pTasks.length} task{pTasks.length !== 1 ? 's' : ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-400 text-sm">No projects yet</p>
            <Link
              to="/projects"
              className="mt-3 inline-block text-sm bg-blue-600 text-white
                         px-4 py-2 rounded-xl hover:bg-blue-700 transition"
            >
              Create your first project
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;