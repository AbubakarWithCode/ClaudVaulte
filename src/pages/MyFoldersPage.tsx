import React, { useState } from 'react';
import { useStorage } from '../context/StorageContext';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { DashboardOutletContext } from './DashboardLayout';
import FileCard from '../components/common/FileCard';
import { formatBytes } from '../lib/utils';
import {
  Folder,
  FolderPlus,
  ChevronRight,
  MoreVertical,
  Edit3,
  Trash2,
  UploadCloud,
  FileText,
  CornerUpLeft,
} from 'lucide-react';
import { FolderItem } from '../types';

export default function MyFoldersPage() {
  const {
    folders,
    files,
    moveFolderToTrash,
    toggleStar,
    moveToTrash,
  } = useStorage();

  const [searchParams, setSearchParams] = useSearchParams();
  const currentFolderId = searchParams.get('folderId') || null;

  const {
    openUploadModal,
    openCreateFolderModal,
    openPreviewModal,
    openShareModal,
    openMoveModal,
    openRenameModal,
  } = useOutletContext<DashboardOutletContext>();

  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const currentFolder = folders.find((f) => f.folderId === currentFolderId);
  const folderFiles = files.filter((f) => f.folderId === currentFolderId);

  const handleSelectFolder = (folderId: string) => {
    setSearchParams({ folderId });
  };

  const handleBackToAll = () => {
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <button
              onClick={handleBackToAll}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              All Folders
            </button>
            {currentFolder && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-slate-800 dark:text-slate-200 font-semibold">
                  {currentFolder.name}
                </span>
              </>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Folder
              className="w-6 h-6"
              style={{ color: currentFolder?.color || '#3b82f6' }}
            />
            <span>{currentFolder ? currentFolder.name : 'My Folders'}</span>
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          {currentFolder && (
            <button
              onClick={handleBackToAll}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CornerUpLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}

          <button
            onClick={() => openCreateFolderModal(currentFolderId || 'root')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>New Folder</span>
          </button>

          <button
            onClick={() => openUploadModal(currentFolderId || 'root')}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Here</span>
          </button>
        </div>
      </div>

      {/* Inside folder view */}
      {currentFolder ? (
        <div className="space-y-6">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Folder contents: <strong className="text-slate-800 dark:text-slate-200">{folderFiles.length} files</strong>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => openRenameModal(currentFolder, 'folder')}
                className="text-blue-600 hover:underline flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" /> Rename
              </button>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <button
                onClick={async () => {
                  if (confirm(`Move folder "${currentFolder.name}" to trash?`)) {
                    await moveFolderToTrash(currentFolder.folderId);
                    handleBackToAll();
                  }
                }}
                className="text-rose-600 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Folder
              </button>
            </div>
          </div>

          {folderFiles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {folderFiles.map((file) => (
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
            <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 mx-auto flex items-center justify-center mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">This folder is empty</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-6">
                Drag and drop files here or click Upload to add documents to this folder.
              </p>
              <button
                onClick={() => openUploadModal(currentFolder.folderId)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 inline-flex items-center gap-2 cursor-pointer transition-colors"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload to {currentFolder.name}</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Folders Directory Grid */
        <div className="space-y-4">
          {folders.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {folders.map((folder) => {
                const fFiles = files.filter((f) => f.folderId === folder.folderId);
                const folderBytes = fFiles.reduce((acc, f) => acc + (f.size || 0), 0);

                return (
                  <div
                    key={folder.folderId}
                    className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between">
                      <div
                        onClick={() => handleSelectFolder(folder.folderId)}
                        className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 cursor-pointer group-hover:scale-105 transition-transform"
                      >
                        <Folder
                          className="w-8 h-8"
                          style={{ color: folder.color || '#3b82f6' }}
                        />
                      </div>

                      {/* Menu */}
                      <div className="relative">
                        <button
                          onClick={() => setMenuOpenId(menuOpenId === folder.folderId ? null : folder.folderId)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {menuOpenId === folder.folderId && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setMenuOpenId(null)}
                            />
                            <div className="absolute right-0 top-8 z-50 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-1 text-xs">
                              <button
                                onClick={() => {
                                  setMenuOpenId(null);
                                  handleSelectFolder(folder.folderId);
                                }}
                                className="w-full px-3 py-2 text-left flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                              >
                                <Folder className="w-3.5 h-3.5 text-blue-500" />
                                <span>Open Folder</span>
                              </button>
                              <button
                                onClick={() => {
                                  setMenuOpenId(null);
                                  openRenameModal(folder, 'folder');
                                }}
                                className="w-full px-3 py-2 text-left flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                                <span>Rename</span>
                              </button>
                              <button
                                onClick={async () => {
                                  setMenuOpenId(null);
                                  await moveFolderToTrash(folder.folderId);
                                }}
                                className="w-full px-3 py-2 text-left flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Move to Trash</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div
                      onClick={() => handleSelectFolder(folder.folderId)}
                      className="mt-4 cursor-pointer"
                    >
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {folder.name}
                      </h3>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                        <span>{fFiles.length} files</span>
                        <span>{formatBytes(folderBytes)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 mx-auto flex items-center justify-center mb-4">
                <FolderPlus className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No folders yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-6">
                Folders help keep your projects, taxes, media, and documents organized neatly.
              </p>
              <button
                onClick={() => openCreateFolderModal('root')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 inline-flex items-center gap-2 cursor-pointer transition-colors"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Create First Folder</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
