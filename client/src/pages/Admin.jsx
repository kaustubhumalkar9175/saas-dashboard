import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';

const tabs = ['Users', 'Activity'];

const Admin = () => {
  const [activeTab,  setActiveTab]  = useState('Users');
  const [users,      setUsers]      = useState([]);
  const [activity,   setActivity]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [deleting,   setDeleting]   = useState(null);
  const [search,     setSearch]     = useState('');

  const fetchUsers = async () => {
    try {
      const res = await API.get('/users');
      setUsers(res.data.users);
    } catch {
      toast.error('Failed to load users');
    }
  };

  const fetchActivity = async () => {
    try {
      const res = await API.get('/activity/all');
      setActivity(res.data.logs);
    } catch {
      toast.error('Failed to load activity');
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchActivity()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await API.delete(`/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch {
      toast.error('Failed to delete user');
    } finally {
      setDeleting(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const totalUsers  = users.length;
  const adminCount  = users.filter((u) => u.role === 'admin').length;
  const userCount   = users.filter((u) => u.role === 'user').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"/>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage users and monitor system activity
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">Total users</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{totalUsers}</p>
          <p className="text-xs text-gray-400 mt-1">Registered accounts</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500">Admins</p>
          <p className="text-3xl font-bold text-purple-600 mt-1">{adminCount}</p>
          <p className="text-xs text-gray-400 mt-1">Admin role</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm
                        col-span-2 sm:col-span-1">
          <p className="text-sm text-gray-500">Regular users</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{userCount}</p>
          <p className="text-xs text-gray-400 mt-1">User role</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-full sm:w-64">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition
              ${activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Users tab */}
      {activeTab === 'Users' && (
        <div className="space-y-4">

          {/* Search */}
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:max-w-sm px-4 py-2.5 rounded-xl border border-gray-200
                       text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />

          {/* Desktop table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
                          overflow-hidden hidden sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">
                    User
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">
                    Role
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">
                    Joined
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3"/>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-gray-400 text-sm">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center
                                          justify-center shrink-0">
                            <span className="text-blue-600 text-xs font-semibold">
                              {u.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{u.name}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium
                          ${u.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {new Date(u.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium
                                         bg-green-100 text-green-700">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            disabled={deleting === u._id}
                            className="text-xs text-red-500 hover:text-red-700
                                       hover:bg-red-50 px-3 py-1.5 rounded-lg
                                       transition disabled:opacity-50"
                          >
                            {deleting === u._id ? 'Deleting...' : 'Delete'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl
                              border border-gray-100 text-gray-400 text-sm">
                No users found
              </div>
            ) : (
              filteredUsers.map((u) => (
                <div key={u._id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center
                                      justify-center shrink-0">
                        <span className="text-blue-600 font-semibold">
                          {u.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleDeleteUser(u._id, u.name)}
                        disabled={deleting === u._id}
                        className="text-xs text-red-500 hover:bg-red-50
                                   px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                      >
                        {deleting === u._id ? '...' : 'Delete'}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium
                      ${u.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'}`}>
                      {u.role}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium
                                     bg-green-100 text-green-700">
                      Active
                    </span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Activity tab */}
      {activeTab === 'Activity' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {activity.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">
              No activity recorded yet
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {activity.map((log) => (
                <div key={log._id}
                  className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition">

                  {/* Icon */}
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center
                                   justify-center mt-0.5
                    ${log.action === 'user_login'       ? 'bg-blue-100'   : ''}
                    ${log.action === 'project_created'  ? 'bg-green-100'  : ''}
                    ${log.action === 'task_completed'   ? 'bg-amber-100'  : ''}
                    ${!['user_login','project_created','task_completed']
                        .includes(log.action)           ? 'bg-gray-100'   : ''}
                  `}>
                    {log.action === 'user_login' && (
                      <svg className="w-4 h-4 text-blue-600" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3
                             3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                      </svg>
                    )}
                    {log.action === 'project_created' && (
                      <svg className="w-4 h-4 text-green-600" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2
                             2H5a2 2 0 01-2-2V7z"/>
                      </svg>
                    )}
                    {log.action === 'task_completed' && (
                      <svg className="w-4 h-4 text-amber-600" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    )}
                    {!['user_login', 'project_created', 'task_completed']
                      .includes(log.action) && (
                      <svg className="w-4 h-4 text-gray-400" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center
                                    sm:justify-between gap-1">
                      <p className="text-sm text-gray-700">{log.description}</p>
                      <span className="text-xs text-gray-400 shrink-0">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">
                        by {log.userId?.name || 'Unknown'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                        ${log.action === 'user_login'      ? 'bg-blue-50  text-blue-600'  : ''}
                        ${log.action === 'project_created' ? 'bg-green-50 text-green-600' : ''}
                        ${log.action === 'task_completed'  ? 'bg-amber-50 text-amber-600' : ''}
                        ${!['user_login','project_created','task_completed']
                            .includes(log.action)          ? 'bg-gray-50  text-gray-500'  : ''}
                      `}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;