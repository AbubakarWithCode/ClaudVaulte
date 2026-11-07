import React, { useState } from 'react';
import { FileItem } from '../../types';
import { formatBytes, formatDate, getFileCategory, getCategoryBadgeColor } from '../../lib/utils';
import { downloadFileItem, resolveFilePreviewURL } from '../../lib/download';
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
} from 'lucide-react';

interface FileCardProps {
  file: FileItem;
  isTrashView?: boolean;
  onPreview: (file: FileItem) => void;
  onShare: (file: FileItem) => void;
  onMove: (file: FileItem) => void;
  onRename: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
  onToggleStar?: (file: FileItem) => void;
  onRestore?: (file: FileItem) => void;
}

export default function FileCard({
  file,
  isTrashView = false,
  onPreview,
  onShare,
  onMove,
  onRename,
  onDelete,
  onToggleStar,
  onRestore,
}: FileCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const category = getFileCategory(file.type, file.extension || '');
  const badgeStyle = getCategoryBadgeColor(category);

  const renderIcon = () => {
    switch (category) {
      case 'image':
        return <ImageIcon className="w-8 h-8 text-emerald-500" />;
      case 'pdf':
        return <FileText className="w-8 h-8 text-rose-500" />;
      case 'document':
        return <FileText className="w-8 h-8 text-blue-500" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="w-8 h-8 text-teal-500" />;
      case 'video':
        return <Film className="w-8 h-8 text-purple-500" />;
      case 'audio':
        return <Music className="w-8 h-8 text-amber-500" />;
      case 'archive':
        return <Archive className="w-8 h-8 text-indigo-500" />;
      default:
        return <File className="w-8 h-8 text-slate-500" />;
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await downloadFileItem(file);
  };

  return (
    <div
      onClick={() => onPreview(file)}
      className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer flex flex-col justify-between"
    >
      {/* Top row: badge & quick actions */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
        >
          {file.extension ? file.extension.toUpperCase() : category.toUpperCase()}
        </span>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {!isTrashView && onToggleStar && (
            <button
              onClick={() => onToggleStar(file)}
              className={`p-1.5 rounded-lg transition-colors ${
                file.isStarred
                  ? 'text-amber-400 hover:text-amber-500'
                  : 'text-slate-300 dark:text-slate-600 hover:text-slate-500'
              }`}
              title={file.isStarred ? 'Remove from starred' : 'Add to starred'}
            >
              <Star className={`w-4 h-4 ${file.isStarred ? 'fill-amber-400' : ''}`} />
            </button>
          )}

          {/* Context menu toggle */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-8 z-50 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-1 text-xs">
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

                  <button
                    onClick={(e) => {
                      setMenuOpen(false);
                      handleDownload(e);
                    }}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Download</span>
                  </button>

                  {!isTrashView ? (
                    <>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onShare(file);
                        }}
                        className="w-full px-3 py-2 text-left flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                      >
                        <Share2 className="w-3.5 h-3.5 text-purple-500" />
                        <span>Share Link</span>
                      </button>

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

      {/* Middle preview thumbnail or file type display */}
      <div className="h-32 rounded-xl bg-slate-50 dark:bg-slate-800/40 flex items-center justify-center overflow-hidden mb-3 border border-slate-100 dark:border-slate-800/60">
        {category === 'image' && file.downloadURL ? (
          <img
            src={file.downloadURL}
            alt={file.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="p-4 flex flex-col items-center justify-center gap-1 group-hover:scale-110 transition-transform">
            {renderIcon()}
          </div>
        )}
      </div>

      {/* File info */}
      <div className="space-y-1">
        <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate title={file.name}">
          {file.name}
        </h4>
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>{formatBytes(file.size)}</span>
          <span>{formatDate(file.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
