import React, { useState } from 'react';
import { FileItem } from '../../types';
import { formatBytes, formatDate, getFileCategory } from '../../lib/utils';
import { downloadFileItem } from '../../lib/download';
import {
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  FileSpreadsheet,
  Archive,
  File,
  MoreVertical,
  Star,
  Download,
  Share2,
  Trash2,
  Eye,
  FolderInput,
  Edit3,
  RotateCcw,
  Globe,
} from 'lucide-react';

interface FileRowProps {
  file: FileItem;
  folderName?: string;
  isTrashView?: boolean;
  onPreview: (file: FileItem) => void;
  onShare: (file: FileItem) => void;
  onMove: (file: FileItem) => void;
  onRename: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
  onToggleStar?: (file: FileItem) => void;
  onRestore?: (file: FileItem) => void;
}

export default function FileRow({
  file,
  folderName = 'Root',
  isTrashView = false,
  onPreview,
  onShare,
  onMove,
  onRename,
  onDelete,
  onToggleStar,
  onRestore,
}: FileRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const category = getFileCategory(file.type, file.extension || '');

  const renderIcon = () => {
    switch (category) {
      case 'image':
        return <ImageIcon className="w-4 h-4 text-emerald-500" />;
      case 'pdf':
        return <FileText className="w-4 h-4 text-rose-500" />;
      case 'document':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="w-4 h-4 text-teal-500" />;
      case 'video':
        return <Film className="w-4 h-4 text-purple-500" />;
      case 'audio':
        return <Music className="w-4 h-4 text-amber-500" />;
      case 'archive':
        return <Archive className="w-4 h-4 text-indigo-500" />;
      default:
        return <File className="w-4 h-4 text-slate-500" />;
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await downloadFileItem(file);
  };

  return (
    <div
      onClick={() => onPreview(file)}
      className="group flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800/80 transition-colors cursor-pointer text-xs"
    >
      {/* File name & star */}
      <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
        {!isTrashView && onToggleStar && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar(file);
            }}
            className={`p-1 rounded-md transition-colors ${
              file.isStarred
                ? 'text-amber-400 hover:text-amber-500'
                : 'text-slate-300 dark:text-slate-700 hover:text-slate-500'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${file.isStarred ? 'fill-amber-400' : ''}`} />
          </button>
        )}

        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
          {renderIcon()}
        </div>

        <div className="truncate">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
              {file.name}
            </span>
            {file.isShared && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-md font-medium">
                <Globe className="w-2.5 h-2.5" /> Shared
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 sm:hidden">
            {formatBytes(file.size)} • {formatDate(file.createdAt)}
          </p>
        </div>
      </div>

      {/* Location */}
      <div className="hidden md:block w-36 text-slate-500 dark:text-slate-400 truncate">
        📁 {folderName}
      </div>

      {/* Size */}
      <div className="hidden sm:block w-24 text-slate-600 dark:text-slate-400">
        {formatBytes(file.size)}
      </div>

      {/* Date */}
      <div className="hidden lg:block w-28 text-slate-500 dark:text-slate-400">
        {formatDate(file.createdAt)}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={handleDownload}
          className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors"
          title="Download"
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        {!isTrashView && (
          <button
            onClick={() => onShare(file)}
            className="p-1.5 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg transition-colors"
            title="Share"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        )}

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-7 z-50 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-1 text-xs">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onPreview(file);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-500" />
                  <span>Preview File</span>
                </button>

                {!isTrashView ? (
                  <>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onMove(file);
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                    >
                      <FolderInput className="w-3.5 h-3.5 text-amber-500" />
                      <span>Move to Folder</span>
                    </button>

                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onRename(file);
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Rename</span>
                    </button>

                    <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete(file);
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Move to Trash</span>
                    </button>
                  </>
                ) : (
                  <>
                    {onRestore && (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onRestore(file);
                        }}
                        className="w-full px-3 py-2 text-left flex items-center gap-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete(file);
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Forever</span>
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
