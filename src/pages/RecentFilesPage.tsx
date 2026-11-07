import React, { useState } from 'react';
import { useStorage } from '../context/StorageContext';
import { useOutletContext } from 'react-router-dom';
import { DashboardOutletContext } from './DashboardLayout';
import FileCard from '../components/common/FileCard';
import FileRow from '../components/common/FileRow';
import { ViewMode } from '../types';
import { Clock, LayoutGrid, List } from 'lucide-react';

export default function RecentFilesPage() {
  const { files, folders, toggleStar, moveToTrash } = useStorage();
  const {
    openPreviewModal,
    openShareModal,
    openMoveModal,
    openRenameModal,
  } = useOutletContext<DashboardOutletContext>();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const sortedRecentFiles = [...files].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const getFolderName = (folderId: string) => {
    if (folderId === 'root') return 'Root';
    const found = folders.find((f) => f.folderId === folderId);
    return found ? found.name : 'Root';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            <span>Recent Files</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Files sorted in reverse chronological order
          </p>
        </div>

        {sortedRecentFiles.length > 0 && (
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {sortedRecentFiles.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedRecentFiles.map((file) => (
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-xs">
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {sortedRecentFiles.map((file) => (
                <FileRow
                  key={file.fileId}
                  file={file}
                  folderName={getFolderName(file.folderId)}
                  onPreview={openPreviewModal}
                  onShare={openShareModal}
                  onMove={openMoveModal}
                  onRename={(f) => openRenameModal(f, 'file')}
                  onDelete={(f) => moveToTrash(f.fileId)}
                  onToggleStar={(f) => toggleStar(f.fileId, f.isStarred)}
                />
              ))}
            </div>
          </div>
        )
      ) : (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 mx-auto flex items-center justify-center mb-4">
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No recent files yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            Uploaded files and recent activity will be highlighted here for rapid access.
          </p>
        </div>
      )}
    </div>
  );
}
