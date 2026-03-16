import { useState, useEffect } from 'react';
import { useAuth } from '../api/context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, login, token } = useAuth();

    const [profileForm, setProfileForm] = useState({ name: '', email: '' });
    const [passForm, setPassForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [profileLoading, setProfileLoading] = useState(false);
    const [passLoading, setPassLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        if (user) {
            setProfileForm({ name: user.name || '', email: user.email || '' });
        }
    }, [user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        if (!profileForm.name.trim()) return toast.error('Name is required');
        setProfileLoading(true);
        try {
            const res = await API.put('/users/profile', { name: profileForm.name });
            // Update auth context with new name
            login(res.data.user, token);
            toast.success('Profile updated successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passForm.newPassword.length < 6) {
            return toast.error('New password must be at least 6 characters');
        }
        if (passForm.newPassword !== passForm.confirmPassword) {
            return toast.error('Passwords do not match');
        }
        setPassLoading(true);
        try {
            await API.put('/users/change-password', {
                currentPassword: passForm.currentPassword,
                newPassword: passForm.newPassword,
            });
            toast.success('Password changed successfully');
            setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to change password');
        } finally {
            setPassLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-5">

            {/* Profile card header */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center
                          justify-center shrink-0">
                        <span className="text-blue-600 text-2xl font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                        <span className={`mt-1 inline-block text-xs px-2.5 py-0.5 rounded-full
                             font-medium
              ${user?.role === 'admin'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700'}`}>
                            {user?.role}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                {['profile', 'password'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition
              ${activeTab === tab
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {tab === 'profile' ? 'Edit Profile' : 'Change Password'}
                    </button>
                ))}
            </div>

            {/* Edit profile tab */}
            {activeTab === 'profile' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-5">Profile information</h3>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full name
                            </label>
                            <input
                                type="text"
                                value={profileForm.name}
                                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                placeholder="Your full name"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email address
                            </label>
                            <input
                                type="email"
                                value={profileForm.email}
                                disabled
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
                           bg-gray-50 text-gray-400 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Role
                            </label>
                            <input
                                type="text"
                                value={user?.role}
                                disabled
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
                           bg-gray-50 text-gray-400 cursor-not-allowed capitalize"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={profileLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
                         text-white font-medium py-2.5 rounded-xl transition text-sm"
                        >
                            {profileLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10"
                                            stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor"
                                            d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Saving...
                                </span>
                            ) : 'Save changes'}
                        </button>
                    </form>
                </div>
            )}

            {/* Change password tab */}
            {activeTab === 'password' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-5">Change password</h3>
                    <form onSubmit={handlePasswordChange} className="space-y-4">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Current password
                            </label>
                            <input
                                type="password"
                                value={passForm.currentPassword}
                                onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                New password
                            </label>
                            <input
                                type="password"
                                value={passForm.newPassword}
                                onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                                placeholder="Min 6 characters"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm new password
                            </label>
                            <input
                                type="password"
                                value={passForm.confirmPassword}
                                onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                                placeholder="Repeat new password"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            />
                            {/* Password match indicator */}
                            {passForm.confirmPassword && (
                                <p className={`text-xs mt-1 ${passForm.newPassword === passForm.confirmPassword
                                        ? 'text-green-600'
                                        : 'text-red-500'
                                    }`}>
                                    {passForm.newPassword === passForm.confirmPassword
                                        ? 'Passwords match'
                                        : 'Passwords do not match'}
                                </p>
                            )}
                        </div>

                        {/* Password strength */}
                        {passForm.newPassword.length > 0 && (
                            <div className="space-y-1">
                                <div className="flex gap-1">
                                    {[1, 2, 3].map((level) => (
                                        <div
                                            key={level}
                                            className={`h-1 flex-1 rounded-full transition-all ${passForm.newPassword.length >= level * 3
                                                    ? level === 1 ? 'bg-red-400'
                                                        : level === 2 ? 'bg-yellow-400'
                                                            : 'bg-green-500'
                                                    : 'bg-gray-200'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-gray-400">
                                    {passForm.newPassword.length < 4
                                        ? 'Weak'
                                        : passForm.newPassword.length < 7
                                            ? 'Fair'
                                            : 'Strong'} password
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={passLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
                         text-white font-medium py-2.5 rounded-xl transition text-sm"
                        >
                            {passLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10"
                                            stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor"
                                            d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Updating...
                                </span>
                            ) : 'Change password'}
                        </button>
                    </form>
                </div>
            )}

            {/* Account info card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Account details</h3>
                <div className="space-y-3">
                    {[
                        { label: 'Account ID', value: user?._id || user?.id },
                        {
                            label: 'Member since', value: new Date(user?.createdAt || Date.now())
                                .toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })
                        },
                        { label: 'Role', value: user?.role },
                    ].map((item) => (
                        <div key={item.label}
                            className="flex flex-col sm:flex-row sm:items-center
                         sm:justify-between py-2 border-b border-gray-50 last:border-0">
                            <span className="text-sm text-gray-500">{item.label}</span>
                            <span className="text-sm font-medium text-gray-900 mt-0.5 sm:mt-0
                               break-all sm:text-right sm:max-w-xs">
                                {item.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Profile;