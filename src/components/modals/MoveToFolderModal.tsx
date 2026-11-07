import React, { useState } from 'react';
import { FileItem, FolderItem } from '../../types';
import { useStorage } from '../../context/StorageContext';
import { Folder, FolderInput, X, Loader2, Check } from 'lucide-react';

interface MoveToFolderModalProps {
  file: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function MoveToFolderModal({ file, isOpen, onClose }: MoveToFolderModalProps) {
  const { folders, moveFileToFolder } = useStorage();
  const [selectedFolderId, setSelectedFolderId] = useState<string>(file?.folderId || 'root');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !file) return null;

  const handleMove = async () => {
    setIsSubmitting(true);
    try {
      await moveFileToFolder(file.fileId, selectedFolderId);
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      console.error('Failed to move file:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 rounded-lg">
              <FolderInput className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Move File</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[240px]">
                {file.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Folder List */}
        <div className="p-6 space-y-3">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Select Destination Folder
          </p>

          <div className="max-h-60 overflow-y-auto space-y-1.5 border border-slate-200 dark:border-slate-800 rounded-xl p-2 bg-slate-50 dark:bg-slate-800/40">
            {/* Root item */}
            <button
              onClick={() => setSelectedFolderId('root')}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-medium transition-all ${
                selectedFolderId === 'root'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4" />
                <span>Root / All Files</span>
              </div>
              {selectedFolderId === 'root' && <Check className="w-4 h-4" />}
            </button>

            {/* Folder list */}
            {folders.map((folder) => (
              <button
                key={folder.folderId}
                onClick={() => setSelectedFolderId(folder.folderId)}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-medium transition-all ${
                  selectedFolderId === folder.folderId
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Folder
                    className="w-4 h-4"
                    style={{ color: selectedFolderId === folder.folderId ? 'white' : folder.color || '#3b82f6' }}
                  />
                  <span>{folder.name}</span>
                </div>
                {selectedFolderId === folder.folderId && <Check className="w-4 h-4" />}
              </button>
            ))}

            {folders.length === 0 && (
              <p className="text-center py-4 text-xs text-slate-400">
                No custom folders created yet. You can keep this file in Root or create a folder first.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleMove}
            disabled={isSubmitting || selectedFolderId === file.folderId}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Moving...</span>
              </>
            ) : (
              <span>Move Here</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
