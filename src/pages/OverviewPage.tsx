import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useStorage } from '../context/StorageContext';
import { useOutletContext, Link } from 'react-router-dom';
import { DashboardOutletContext } from './DashboardLayout';
import StorageProgressBar from '../components/common/StorageProgressBar';
import FileCard from '../components/common/FileCard';
import { formatBytes, formatDate } from '../lib/utils';
import {
  HardDrive,
  Files,
  Folder,
  Share2,
  UploadCloud,
  FolderPlus,
  ArrowRight,
  TrendingUp,
  Image as ImageIcon,
  FileText,
  Film,
  Music,
  FileSpreadsheet,
  Archive,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function OverviewPage() {
  const { user } = useAuth();
  const {
    files,
    folders,
    totalStorageUsed,
    totalStorageLimit,
    totalFilesCount,
    totalFoldersCount,
    categoryBreakdown,
    sharedFiles,
    toggleStar,
    moveToTrash,
  } = useStorage();

  const {
    openUploadModal,
    openCreateFolderModal,
    openPreviewModal,
    openShareModal,
    openMoveModal,
    openRenameModal,
    openUpgradeModal,
  } = useOutletContext<DashboardOutletContext>();

  const recentFiles = [...files]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  const availableStorage = Math.max(0, totalStorageLimit - totalStorageUsed);

  // Category stats array
  const categoriesList = [
    { label: 'Images', cat: 'image', icon: ImageIcon, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Documents', cat: 'document', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'PDFs', cat: 'pdf', icon: FileText, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { label: 'Sheets', cat: 'spreadsheet', icon: FileSpreadsheet, color: 'text-teal-500', bg: 'bg-teal-500/10' },
    { label: 'Videos', cat: 'video', icon: Film, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Archives', cat: 'archive', icon: Archive, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{formatBytes(totalStorageLimit)} Plan Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.displayName || 'User'}!
            </h1>
            <p className="text-sm text-blue-100">
              Manage, secure, and organize your files across devices with military-grade encryption and ultra-fast cloud synchronization.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => openUpgradeModal('pro')}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-black/10 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Upgrade Plan (100 GB)</span>
            </button>
            <button
              onClick={() => openUploadModal('root')}
              className="px-5 py-2.5 bg-white text-blue-600 hover:bg-blue-50 text-xs font-bold rounded-xl shadow-lg shadow-black/10 flex items-center gap-2 transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Files</span>
            </button>
            <button
              onClick={() => openCreateFolderModal('root')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl backdrop-blur-md flex items-center gap-2 transition-all cursor-pointer border border-white/20"
            >
              <FolderPlus className="w-4 h-4" />
              <span>New Folder</span>
            </button>
          </div>
        </div>

        {/* Ambient background blur shapes */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-12 w-64 h-64 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Storage card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Storage</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {formatBytes(totalStorageUsed)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              of {formatBytes(totalStorageLimit)} allocated
            </p>
          </div>
          <StorageProgressBar
            usedBytes={totalStorageUsed}
            limitBytes={totalStorageLimit}
            showLabels={false}
            compact
          />
        </div>

        {/* Available Storage */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Available Storage</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {formatBytes(availableStorage)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Remaining free quota</p>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <span>Ready for new uploads</span>
          </div>
        </div>

        {/* Total Files */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Files</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
              <Files className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {totalFilesCount}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">In personal vault</p>
          </div>
          <Link
            to="/dashboard/files"
            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
          >
            <span>View all files</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Folders & Shared */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Folders & Shared</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600">
              <Folder className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {totalFoldersCount} <span className="text-xs font-normal text-slate-400">folders</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{sharedFiles.length} shared links active</p>
          </div>
          <Link
            to="/dashboard/folders"
            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
          >
            <span>Explore directory</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Storage Breakdown by Categories */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Storage Breakdown</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Actual disk consumption across file formats</p>
          </div>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {formatBytes(totalStorageUsed)} used
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {categoriesList.map((c) => {
            const Icon = c.icon;
            const data = (categoryBreakdown as any)[c.cat] || { count: 0, bytes: 0 };
            return (
              <div
                key={c.cat}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl ${c.bg} ${c.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {data.count}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{c.label}</p>
                  <p className="text-[11px] text-slate-400">{formatBytes(data.bytes)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Folder Shortcuts */}
      {folders.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Folder className="w-4 h-4 text-blue-500" />
              <span>Folders</span>
            </h3>
            <Link
              to="/dashboard/folders"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>View all ({folders.length})</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {folders.slice(0, 6).map((folder) => {
              const count = files.filter((f) => f.folderId === folder.folderId).length;
              return (
                <Link
                  key={folder.folderId}
                  to={`/dashboard/folders?folderId=${folder.folderId}`}
                  className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-xs group"
                >
                  <Folder
                    className="w-7 h-7 mb-2 transition-transform group-hover:scale-110"
                    style={{ color: folder.color || '#3b82f6' }}
                  />
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                    {folder.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{count} files</p>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Uploads */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>Recent Uploads</span>
          </h3>
          <Link
            to="/dashboard/files"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>See all files</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentFiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recentFiles.map((file) => (
              <FileCard
                key={file.fileId}
                file={file}
                onPreview={openPreviewModal}
                onShare={openShareModal}
                onMove={openMoveModal}
                onRename={(f) => openRenameModal(f, 'file')}
                onDelete={(f) => moveToTrash(f.fileId)}
                onToggleStar={(f) => toggleStar(f.fileId, f.isStarred)}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 mx-auto flex items-center justify-center mb-4">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Your vault is empty</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-6">
              Start storing documents, photos, audio, videos, and archives securely with 5 GB free space.
            </p>
            <button
              onClick={() => openUploadModal('root')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 inline-flex items-center gap-2 cursor-pointer transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Your First File</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
