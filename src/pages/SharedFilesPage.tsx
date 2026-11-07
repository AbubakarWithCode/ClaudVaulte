import React, { useState } from 'react';
import { useStorage } from '../context/StorageContext';
import { useOutletContext } from 'react-router-dom';
import { DashboardOutletContext } from './DashboardLayout';
import { formatBytes, formatDate } from '../lib/utils';
import {
  Share2,
  Copy,
  Check,
  Eye,
  Lock,
  Globe,
  ExternalLink,
  Download,
} from 'lucide-react';
import { FileItem } from '../types';

export default function SharedFilesPage() {
  const { sharedFiles, toggleShare } = useStorage();
  const { openPreviewModal, openShareModal } = useOutletContext<DashboardOutletContext>();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (file: FileItem) => {
    const url = `${window.location.origin}/share/${file.fileId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(file.fileId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleRevoke = async (fileId: string) => {
    await toggleShare(fileId, false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Share2 className="w-6 h-6 text-purple-600" />
          <span>Shared Files</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Files you have shared with a public link or collaborators
        </p>
      </div>

      {sharedFiles.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-xs">
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {sharedFiles.map((file) => {
              const url = `${window.location.origin}/share/${file.fileId}`;
              return (
                <div
                  key={file.fileId}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className="p-3 bg-purple-50 dark:bg-purple-950/40 text-purple-600 rounded-xl shrink-0">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {file.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span>{formatBytes(file.size)}</span>
                        <span>•</span>
                        <span>Shared {formatDate(file.updatedAt || file.createdAt)}</span>
                        <span>•</span>
                        <span className="capitalize text-purple-600 dark:text-purple-400 font-medium">
                          {file.sharePermission === 'download' ? 'Download allowed' : 'View only'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
                    <button
                      onClick={() => handleCopy(file)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedId === file.fileId ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Copied Link</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>

                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors"
                      title="Open public page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => openShareModal(file)}
                      className="p-2 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-xl transition-colors"
                      title="Manage sharing settings"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => openPreviewModal(file)}
                      className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleRevoke(file.fileId)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Revoke</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 mx-auto flex items-center justify-center mb-4">
            <Share2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No files currently shared</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            When you share links to any file with friends or teammates, they will appear here with instant access controls.
          </p>
        </div>
      )}
    </div>
  );
}
