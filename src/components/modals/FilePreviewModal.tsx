import React, { useState, useEffect } from 'react';
import { FileItem } from '../../types';
import { formatBytes, formatDateTime, getFileCategory } from '../../lib/utils';
import { downloadFileItem, resolveFilePreviewURL } from '../../lib/download';
import {
  X,
  Download,
  Share2,
  Trash2,
  Eye,
  Calendar,
  HardDrive,
  FileType,
  FileText,
  ExternalLink,
} from 'lucide-react';

interface FilePreviewModalProps {
  file: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
  onShare?: (file: FileItem) => void;
  onDelete?: (file: FileItem) => void;
}

export default function FilePreviewModal({
  file,
  isOpen,
  onClose,
  onShare,
  onDelete,
}: FilePreviewModalProps) {
  const [previewSrc, setPreviewSrc] = useState<string>('');

  useEffect(() => {
    if (file) {
      resolveFilePreviewURL(file).then((url) => setPreviewSrc(url));
    } else {
      setPreviewSrc('');
    }
  }, [file]);

  if (!isOpen || !file) return null;

  const category = getFileCategory(file.type, file.extension || '');

  const handleDownload = async () => {
    await downloadFileItem(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 overflow-hidden mr-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 rounded-lg shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white truncate">
                {file.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatBytes(file.size)} • {file.type || 'Unknown Type'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onShare && (
              <button
                onClick={() => onShare(file)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                title="Share file"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>

            {onDelete && (
              <button
                onClick={() => onDelete(file)}
                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
                title="Move to trash"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Preview Container */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6">
          {/* Main Preview */}
          <div className="flex-1 bg-slate-100 dark:bg-slate-950/60 rounded-2xl flex items-center justify-center p-4 min-h-[300px] border border-slate-200 dark:border-slate-800 overflow-hidden">
            {category === 'image' && previewSrc && (
              <img
                src={previewSrc}
                alt={file.name}
                className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-xs"
              />
            )}

            {category === 'video' && previewSrc && (
              <video
                controls
                src={previewSrc}
                className="max-h-[60vh] max-w-full rounded-lg shadow-xs"
              />
            )}

            {category === 'audio' && previewSrc && (
              <div className="flex flex-col items-center justify-center p-6 space-y-4 w-full max-w-md">
                <div className="w-20 h-20 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <Eye className="w-10 h-10" />
                </div>
                <p className="font-medium text-slate-900 dark:text-white text-center">{file.name}</p>
                <audio controls src={previewSrc} className="w-full" />
              </div>
            )}

            {category === 'pdf' && previewSrc && (
              <iframe
                src={previewSrc}
                title={file.name}
                className="w-full h-[55vh] rounded-lg border-0"
              />
            )}

            {(category !== 'image' && category !== 'video' && category !== 'audio' && category !== 'pdf') || !previewSrc ? (
              <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                  <FileText className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{file.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                    This file format ({file.extension || 'file'}) is stored securely in your CloudVault.
                    You can download or share it directly.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download File</span>
                  </button>
                  {previewSrc && !previewSrc.startsWith('blob:') && (
                    <a
                      href={previewSrc}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open in New Tab</span>
                    </a>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          {/* Details Sidebar */}
          <div className="w-full md:w-72 shrink-0 space-y-5 bg-slate-50/50 dark:bg-slate-800/20 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">File Details</h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-slate-400 flex items-center gap-1.5 mb-1">
                  <FileType className="w-3.5 h-3.5" />
                  Type
                </span>
                <p className="font-medium text-slate-800 dark:text-slate-200 break-all">
                  {file.type || 'application/octet-stream'}
                </p>
              </div>

              <div>
                <span className="text-slate-400 flex items-center gap-1.5 mb-1">
                  <HardDrive className="w-3.5 h-3.5" />
                  Size
                </span>
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  {formatBytes(file.size)} ({file.size.toLocaleString()} bytes)
                </p>
              </div>

              <div>
                <span className="text-slate-400 flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Uploaded
                </span>
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  {formatDateTime(file.createdAt)}
                </p>
              </div>

              <div>
                <span className="text-slate-400 flex items-center gap-1.5 mb-1">
                  <Share2 className="w-3.5 h-3.5" />
                  Sharing
                </span>
                <p className="font-medium">
                  {file.isShared ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      Public Link Active
                    </span>
                  ) : (
                    <span className="text-slate-500">Private to you</span>
                  )}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={handleDownload}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Save to Local Drive</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
