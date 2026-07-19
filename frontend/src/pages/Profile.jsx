import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Save, Lock, Loader2, AlertCircle, CheckCircle, LogOut } from 'lucide-react';
import { api } from '../api';
import { getApiError } from '../utils/errorHandler';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Profile() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form state
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    // Password change
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [pwSaving, setPwSaving] = useState(false);
    const [pwError, setPwError] = useState('');
    const [pwSuccess, setPwSuccess] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get('/api/users/profile');
                const user = res.data?.user;
                setProfile(user);
                setName(user?.name || '');
                setPhone(user?.phone || '');
            } catch (err) {
                setError(getApiError(err, 'Failed to load profile.'));
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const res = await api.put('/api/users/profile', { name, phone });
            setProfile(res.data?.user);
            // Update localStorage so Navbar reflects new name immediately
            const stored = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...stored, name }));
            setSuccess('Profile updated successfully.');
        } catch (err) {
            setError(getApiError(err, 'Failed to save profile.'));
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPwSaving(true);
        setPwError('');
        setPwSuccess('');
        try {
            await api.put('/api/users/change-password', { currentPassword, newPassword });
            setPwSuccess('Password changed successfully.');
            setCurrentPassword('');
            setNewPassword('');
        } catch (err) {
            setPwError(getApiError(err, 'Failed to change password.'));
        } finally {
            setPwSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black text-[#0B1E36] flex items-center gap-3">
                        <User className="w-7 h-7 text-indigo-500" /> My Profile
                    </h1>
                    <p className="text-slate-500 mt-1">Manage your account details and preferences.</p>
                </div>

                {/* Profile info card */}
                <motion.form
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSave}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5"
                >
                    <h2 className="text-lg font-bold text-slate-800">Account Details</h2>

                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 font-semibold">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                        </div>
                    )}
                    {success && (
                        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-3 font-semibold">
                            <CheckCircle className="w-4 h-4 flex-shrink-0" /> {success}
                        </div>
                    )}

                    {/* Email (read-only) */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Email</label>
                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium">{profile?.email}</span>
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Display Name</label>
                        <div className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                            <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="flex-1 text-sm font-medium text-slate-800 outline-none bg-transparent"
                                placeholder="Your name"
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Phone (optional)</label>
                        <div className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                            <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <input
                                type="tel"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                className="flex-1 text-sm font-medium text-slate-800 outline-none bg-transparent"
                                placeholder="+91 98765 43210"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#0B1E36] text-white rounded-xl hover:bg-indigo-700 transition-colors font-bold text-sm disabled:opacity-60"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </motion.form>

                {/* Change Password */}
                <motion.form
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    onSubmit={handleChangePassword}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5"
                >
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-slate-400" /> Change Password
                    </h2>

                    {pwError && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 font-semibold">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {pwError}
                        </div>
                    )}
                    {pwSuccess && (
                        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-3 font-semibold">
                            <CheckCircle className="w-4 h-4 flex-shrink-0" /> {pwSuccess}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Current Password</label>
                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                            placeholder="••••••••" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">New Password</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                            placeholder="Min 8 chars, 1 uppercase, 1 number, 1 special" />
                    </div>
                    <button type="submit" disabled={pwSaving || !currentPassword || !newPassword}
                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors font-bold text-sm disabled:opacity-50">
                        {pwSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                        {pwSaving ? 'Updating...' : 'Update Password'}
                    </button>
                </motion.form>

                {/* Account info */}
                <div className="text-xs text-slate-400 text-center">
                    Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }) : '—'}
                    {' · '}Role: {profile?.role || 'user'}
                </div>
            </div>
        </div>
    );
}
