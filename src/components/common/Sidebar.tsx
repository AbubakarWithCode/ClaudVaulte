import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStorage } from '../../context/StorageContext';
import StorageProgressBar from './StorageProgressBar';
import {
  Cloud,
  LayoutDashboard,
  FolderOpen,
  Folder,
  Share2,
  Clock,
  Trash2,
  Settings,
  LogOut,
  UploadCloud,
  Zap,
  ShieldCheck,
  X,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenUpload?: () => void;
  onOpenUpgrade?: () => void;
}

const ADMIN_EMAIL = 'abubakartaj69@gmail.com';

export default function Sidebar({
  mobileOpen = false,
  onCloseMobile,
  onOpenUpload,
  onOpenUpgrade,
}: SidebarProps) {
  const { user, logOut } = useAuth();
  const { totalStorageUsed, totalStorageLimit, trashFiles, sharedFiles } = useStorage();
  const navigate = useNavigate();

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navLinks = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/dashboard/files', label: 'My Files', icon: FolderOpen },
    { to: '/dashboard/folders', label: 'My Folders', icon: Folder },
    {
      to: '/dashboard/shared',
      label: 'Shared Files',
      icon: Share2,
      badge: sharedFiles.length > 0 ? sharedFiles.length : undefined,
    },
    { to: '/dashboard/recent', label: 'Recent Files', icon: Clock },
    {
      to: '/dashboard/trash',
      label: 'Trash',
      icon: Trash2,
      badge: trashFiles.length > 0 ? trashFiles.length : undefined,
    },
    { to: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <NavLink to="/dashboard" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                Cloud<span className="text-blue-600">Vault</span>
              </span>
              <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                SaaS Storage
              </span>
            </div>
          </NavLink>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Upload CTA */}
        {onOpenUpload && (
          <div className="px-5 pt-5 pb-2">
            <button
              onClick={() => {
                onOpenUpload();
                onCloseMobile?.();
              }}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Quick Upload</span>
            </button>
          </div>
        )}

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </div>
                {link.badge !== undefined && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          {/* Admin & Earning Hub Link (visible if user is owner abubakartaj69@gmail.com) */}
          {isAdmin && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
              <NavLink
                to="/dashboard/admin"
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/20 to-indigo-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  <span>Admin & Earning Hub</span>
                </div>
                <span className="px-1.5 py-0.5 text-[9px] font-black rounded-md bg-amber-400 text-slate-950 uppercase">
                  Owner
                </span>
              </NavLink>
            </div>
          )}
        </nav>

        {/* Storage Widget & Upgrade CTA */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-3">
            <StorageProgressBar
              usedBytes={totalStorageUsed}
              limitBytes={totalStorageLimit}
              showLabels={true}
            />

            <button
              type="button"
              onClick={() => {
                onOpenUpgrade?.();
                onCloseMobile?.();
              }}
              className="w-full py-1.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Upgrade to 100 GB</span>
            </button>
          </div>

          {/* User profile & Logout */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 overflow-hidden pr-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {user?.displayName || 'User'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg transition-colors shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
