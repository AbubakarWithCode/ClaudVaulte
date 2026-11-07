import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FileItem } from '../types';
import { formatBytes, formatDateTime, getFileCategory, getCategoryBadgeColor } from '../lib/utils';
import {
  Cloud,
  Download,
  Eye,
  Lock,
  Globe,
  FileText,
  Calendar,
  HardDrive,
  FileType,
  ArrowRight,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export default function SharedFileView() {
  const { fileId } = useParams<{ fileId: string }>();
  const [file, setFile] = useState<FileItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fileId) {
      setError('Invalid share link.');
      setLoading(false);
      return;
    }

    const fetchSharedFile = async () => {
      setLoading(true);
      setError(null);
      try {
        const docRef = doc(db, 'files', fileId);
        const snap = await getDoc(docRef);

        if (!snap.exists()) {
          setError('This shared file does not exist or has been deleted by the owner.');
          setLoading(false);
          return;
        }

        const data = snap.data() as FileItem;
        if (!data.isShared) {
          setError('This file is currently private. The owner has disabled public link sharing.');
          setLoading(false);
          return;
        }

        setFile(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching shared file:', err);
        setError('Could not access this file. Please verify permissions or link.');
        setLoading(false);
      }
    };

    fetchSharedFile();
  }, [fileId]);

  const handleDownload = () => {
    if (!file) return;
    const a = document.createElement('a');
    a.href = file.downloadURL;
    a.download = file.name;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-lg mb-4 animate-pulse">
          <Cloud className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span>Retrieving shared file...</span>
        </div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 mx-auto flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Access Restricted</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {error || 'You do not have permission to view this resource.'}
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
          >
            <span>Return to CloudVault</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const category = getFileCategory(file.type, file.extension || '');
  const badgeStyle = getCategoryBadgeColor(category);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Banner */}
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xs">
            <Cloud className="w-4 h-4" />
          </div>
          <span className="text-base font-bold text-slate-900 dark:text-white">
            Cloud<span className="text-blue-600">Vault</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/register"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-xl border border-blue-200 dark:border-blue-900 hover:bg-blue-100 transition-colors"
          >
            <span>Get 5 GB Free Storage</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {file.sharePermission === 'download' && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Title & Badge */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-2xl shrink-0">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white break-all">
                  {file.name}
                </h1>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                >
                  {category}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {formatBytes(file.size)} • Uploaded {formatDateTime(file.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Preview Frame */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 min-h-[420px] flex items-center justify-center overflow-hidden shadow-xs">
          {category === 'image' && (
            <img
              src={file.downloadURL}
              alt={file.name}
              className="max-h-[70vh] max-w-full rounded-2xl object-contain shadow-xs"
            />
          )}

          {category === 'video' && (
            <video
              controls
              src={file.downloadURL}
              className="max-h-[70vh] max-w-full rounded-2xl shadow-xs"
            />
          )}

          {category === 'audio' && (
            <div className="w-full max-w-md p-6 space-y-4 text-center">
              <div className="w-20 h-20 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto">
                <Eye className="w-10 h-10" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">{file.name}</h3>
              <audio controls src={file.downloadURL} className="w-full" />
            </div>
          )}

          {category === 'pdf' && (
            <iframe
              src={file.downloadURL}
              title={file.name}
              className="w-full h-[70vh] rounded-2xl border-0"
            />
          )}

          {category !== 'image' && category !== 'video' && category !== 'audio' && category !== 'pdf' && (
            <div className="text-center p-8 space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                <FileText className="w-10 h-10" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{file.name}</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  This file format ({file.extension || 'file'}) is safely hosted in CloudVault. Download it directly to open in your native desktop application.
                </p>
              </div>
              <button
                onClick={handleDownload}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 inline-flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Save to Local Drive</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800/80 text-center text-xs text-slate-500">
        Shared securely via{' '}
        <Link to="/" className="text-blue-600 font-semibold hover:underline">
          CloudVault
        </Link>
        . Sign up to get 5 GB free storage.
      </footer>
    </div>
  );
}
