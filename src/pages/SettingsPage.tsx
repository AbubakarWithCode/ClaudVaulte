import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useStorage } from '../context/StorageContext';
import StorageProgressBar from '../components/common/StorageProgressBar';
import { formatBytes } from '../lib/utils';
import {
  User,
  Mail,
  Shield,
  KeyRound,
  HardDrive,
  Moon,
  Sun,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
} from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { DashboardOutletContext } from './DashboardLayout';

export default function SettingsPage() {
  const { user, userProfile, updateUserProfileData, resetPassword, logOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { totalStorageUsed, totalStorageLimit, totalFilesCount, totalFoldersCount } = useStorage();
  const navigate = useNavigate();
  const { openUpgradeModal } = useOutletContext<DashboardOutletContext>();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(userProfile?.photoURL || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [isSendingReset, setIsSendingReset] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setProfileMsg({ type: 'error', text: 'Display name cannot be blank.' });
      return;
    }

    setIsSavingProfile(true);
    setProfileMsg(null);

    try {
      await updateUserProfileData(displayName.trim(), photoURL.trim() || undefined);
      setIsSavingProfile(false);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setIsSavingProfile(false);
      setProfileMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update profile.',
      });
    }
  };

  const handleSendResetEmail = async () => {
    if (!user?.email) return;

    setIsSendingReset(true);
    setPasswordMsg(null);

    try {
      await resetPassword(user.email);
      setIsSendingReset(false);
      setPasswordMsg({
        type: 'success',
        text: `A password reset link has been dispatched to ${user.email}. Please check your inbox.`,
      });
    } catch (err) {
      setIsSendingReset(false);
      setPasswordMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Could not send password reset email.',
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-6 h-6 text-blue-600" />
          <span>Account Settings</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your personal profile, storage quota, security, and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-blue-500/25 mb-4">
              {displayName ? displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {displayName || 'CloudVault User'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-full mt-0.5">
              {user?.email}
            </p>

            <div className="w-full mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs text-left">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Files</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{totalFilesCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Folders</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{totalFoldersCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Account Tier</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">5 GB Free Starter</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full mt-6 py-2.5 px-4 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Right Column: Settings Sections */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Form */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Personal Information</span>
            </h3>

            {profileMsg && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
                  profileMsg.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}
              >
                {profileMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Display Name
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Email cannot be edited directly as it is bound to your Firebase Authentication profile.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Storage Quota Info */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-blue-600" />
              <span>Storage Quota Breakdown</span>
            </h3>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <StorageProgressBar
                usedBytes={totalStorageUsed}
                limitBytes={totalStorageLimit}
                showLabels={true}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Consumed:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {formatBytes(totalStorageUsed)}
                </p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Free Remaining:</span>
                <p className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {formatBytes(Math.max(0, totalStorageLimit - totalStorageUsed))}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => openUpgradeModal('pro')}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Upgrade Storage Plan (100 GB / 1 TB)</span>
              </button>
            </div>
          </div>

          {/* Security & Password Reset */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Security & Password</span>
            </h3>

            {passwordMsg && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
                  passwordMsg.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}
              >
                {passwordMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Password Reset Email
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Receive a secure Firebase password reset token in your email.
                </p>
              </div>

              <button
                onClick={handleSendResetEmail}
                disabled={isSendingReset}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                {isSendingReset ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Send Reset Email</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Theme & Display Mode */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-blue-600" /> : <Sun className="w-4 h-4 text-amber-500" />}
              <span>Interface Theme</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => theme === 'dark' && toggleTheme()}
                className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                  theme === 'light'
                    ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-semibold shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Sun className="w-5 h-5 text-amber-500" />
                <div className="text-left text-xs">
                  <p>Light Mode</p>
                  <p className="text-[10px] text-slate-400">Clean, crisp daytime view</p>
                </div>
              </button>

              <button
                onClick={() => theme === 'light' && toggleTheme()}
                className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                  theme === 'dark'
                    ? 'border-blue-500 bg-blue-950/40 text-blue-200 font-semibold shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Moon className="w-5 h-5 text-blue-400" />
                <div className="text-left text-xs">
                  <p>Dark Mode</p>
                  <p className="text-[10px] text-slate-400">Midnight high contrast</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
