import React, { useState, useRef } from 'react';
import { useStorage } from '../../context/StorageContext';
import { formatBytes, getFileExtension } from '../../lib/utils';
import {
  UploadCloud,
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  Folder,
  Loader2,
  Plus,
} from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFolderId?: string;
}

export default function UploadModal({ isOpen, onClose, defaultFolderId = 'root' }: UploadModalProps) {
  const { uploadFiles, folders, totalStorageUsed, totalStorageLimit, uploadProgress } = useStorage();
  const [selectedFolderId, setSelectedFolderId] = useState<string>(defaultFolderId);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const totalSelectedBytes = filesToUpload.reduce((acc, f) => acc + f.size, 0);
  const remainingStorage = Math.max(0, totalStorageLimit - totalStorageUsed);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const dropped = Array.from(e.dataTransfer.files);
      setFilesToUpload((prev) => [...prev, ...dropped]);
      setUploadError(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      setFilesToUpload((prev) => [...prev, ...selected]);
      setUploadError(null);
    }
  };

  const removeFile = (index: number) => {
    setFilesToUpload((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartUpload = async () => {
    if (filesToUpload.length === 0) return;

    if (totalSelectedBytes > remainingStorage) {
      setUploadError(
        `Selected files (${formatBytes(totalSelectedBytes)}) exceed your available storage (${formatBytes(
          remainingStorage
        )}).`
      );
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      await uploadFiles(filesToUpload, selectedFolderId);
      setIsUploading(false);
      setUploadSuccess(true);
      setFilesToUpload([]);
    } catch (err) {
      setIsUploading(false);
      setUploadError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    }
  };

  const resetModal = () => {
    setFilesToUpload([]);
    setUploadError(null);
    setUploadSuccess(false);
    setIsUploading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 rounded-lg">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Upload Files</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Add files securely to your CloudVault</p>
            </div>
          </div>
          <button
            onClick={resetModal}
            disabled={isUploading}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Target Folder Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Upload Destination
            </label>
            <div className="relative">
              <select
                value={selectedFolderId}
                onChange={(e) => setSelectedFolderId(e.target.value)}
                disabled={isUploading}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="root">📁 Root / All Files</option>
                {folders.map((folder) => (
                  <option key={folder.folderId} value={folder.folderId}>
                    📁 {folder.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Success Notification */}
          {uploadSuccess && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
                  Files uploaded successfully!
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                  Your files are encrypted, synced, and now accessible in your dashboard.
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setUploadSuccess(false)}
                    className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline"
                  >
                    Upload More Files
                  </button>
                  <span className="text-emerald-300 dark:text-emerald-700">•</span>
                  <button
                    onClick={resetModal}
                    className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {uploadError && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs text-rose-800 dark:text-rose-200">
                <p className="font-semibold">Upload Notice</p>
                <p className="mt-0.5">{uploadError}</p>
              </div>
            </div>
          )}

          {/* Drag & Drop Zone */}
          {!uploadSuccess && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-500/10 scale-[1.01]'
                  : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 bg-slate-50/50 dark:bg-slate-800/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center mb-3">
                <UploadCloud className="w-7 h-7" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Click to browse or drag and drop files here
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                Supports images, documents (PDF, Word, Excel), audio, videos, and archives up to 500 MB per file.
              </p>
            </div>
          )}

          {/* File Queue List */}
          {filesToUpload.length > 0 && !uploadSuccess && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span>Selected ({filesToUpload.length})</span>
                <span>Total: {formatBytes(totalSelectedBytes)}</span>
              </div>
              <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
                {filesToUpload.map((file, idx) => {
                  const pItem = uploadProgress.find((p) => p.name === file.name);
                  return (
                    <div
                      key={`${file.name}-${idx}`}
                      className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                          <div className="truncate">
                            <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{file.name}</p>
                            <p className="text-[10px] text-slate-400">
                              {formatBytes(file.size)} • {getFileExtension(file.name).toUpperCase() || 'FILE'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {pItem?.status === 'completed' && (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Saved</span>
                            </span>
                          )}
                          {pItem?.status === 'uploading' && (
                            <span className="flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>{pItem.progress}%</span>
                            </span>
                          )}
                          {pItem?.status === 'error' && (
                            <span className="flex items-center gap-1 text-[11px] text-rose-500" title={pItem.errorMessage}>
                              <AlertCircle className="w-4 h-4" />
                              <span>Failed</span>
                            </span>
                          )}
                          {!isUploading && (
                            <button
                              onClick={() => removeFile(idx)}
                              className="p-1 text-slate-400 hover:text-rose-500 rounded-md transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {pItem && pItem.status === 'uploading' && (
                        <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-300"
                            style={{ width: `${pItem.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Available: <span className="font-medium text-slate-700 dark:text-slate-300">{formatBytes(remainingStorage)}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={resetModal}
              disabled={isUploading}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleStartUpload}
              disabled={filesToUpload.length === 0 || isUploading}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading {filesToUpload.length} files...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
