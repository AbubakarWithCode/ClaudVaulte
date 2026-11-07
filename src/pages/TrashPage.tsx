import React, { useState } from 'react';
import { useStorage } from '../context/StorageContext';
import { useOutletContext } from 'react-router-dom';
import { DashboardOutletContext } from './DashboardLayout';
import FileCard from '../components/common/FileCard';
import { formatBytes } from '../lib/utils';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  Folder,
  Loader2,
} from 'lucide-react';

export default function TrashPage() {
  const {
    trashFiles,
    trashFolders,
    restoreFromTrash,
    permanentDeleteFile,
    restoreFolderFromTrash,
    permanentDeleteFolder,
    emptyTrash,
  } = useStorage();

  const { openPreviewModal } = useOutletContext<DashboardOutletContext>();
  const [isEmptying, setIsEmptying] = useState(false);

  const totalTrashItems = trashFiles.length + trashFolders.length;

  const handleEmptyTrash = async () => {
    if (!confirm('Are you sure you want to permanently delete all items in trash? This cannot be undone.')) {
      return;
    }
    setIsEmptying(true);
    try {
      await emptyTrash();
      setIsEmptying(false);
    } catch (err) {
      console.error(err);
      setIsEmptying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Trash2 className="w-6 h-6 text-rose-500" />
            <span>Trash</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Items in trash can be restored or permanently removed to free up quota
          </p>
        </div>

        {totalTrashItems > 0 && (
          <button
            onClick={handleEmptyTrash}
            disabled={isEmptying}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-sm shadow-rose-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {isEmptying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Emptying...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Empty Trash ({totalTrashItems})</span>
              </>
            )}
          </button>
        )}
      </div>

      {totalTrashItems > 0 ? (
        <div className="space-y-8">
          {/* Notice banner */}
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-200">
              <p className="font-semibold">Recycle Bin Active</p>
              <p className="mt-0.5">
                Files and folders here continue to count towards your 5 GB storage until permanently purged.
              </p>
            </div>
          </div>

          {/* Trash Folders */}
          {trashFolders.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Folders in Trash ({trashFolders.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {trashFolders.map((folder) => (
                  <div
                    key={folder.folderId}
                    className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-xl">
                        <Folder className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {folder.name}
                        </p>
                        <p className="text-[10px] text-slate-400">Folder</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => restoreFolderFromTrash(folder.folderId)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors"
                        title="Restore folder"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => permanentDeleteFolder(folder.folderId)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        title="Delete permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trash Files */}
          {trashFiles.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Files in Trash ({trashFiles.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {trashFiles.map((file) => (
                  <FileCard
                    key={file.fileId}
                    file={file}
                    isTrashView={true}
                    onPreview={openPreviewModal}
                    onShare={() => {}}
                    onMove={() => {}}
                    onRename={() => {}}
                    onDelete={(f) => permanentDeleteFile(f.fileId)}
                    onRestore={(f) => restoreFromTrash(f.fileId)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-4">
            <Trash2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Trash is empty</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            Any files or directories you delete will be held here safely until you decide to restore or erase them permanently.
          </p>
        </div>
      )}
    </div>
  );
}
