import React, { useState, useMemo } from 'react';
import { useStorage } from '../context/StorageContext';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { DashboardOutletContext } from './DashboardLayout';
import FileCard from '../components/common/FileCard';
import FileRow from '../components/common/FileRow';
import { FileCategory, FileItem, SortField, SortDirection, ViewMode } from '../types';
import { getFileCategory } from '../lib/utils';
import {
  FolderOpen,
  LayoutGrid,
  List,
  UploadCloud,
  FolderPlus,
  ArrowUpDown,
  Filter,
  Search,
} from 'lucide-react';

export default function MyFilesPage() {
  const { files, folders, toggleStar, moveToTrash } = useStorage();
  const [searchParams] = useSearchParams();
  const folderParam = searchParams.get('folderId') || 'all';

  const {
    searchQuery,
    openUploadModal,
    openCreateFolderModal,
    openPreviewModal,
    openShareModal,
    openMoveModal,
    openRenameModal,
  } = useOutletContext<DashboardOutletContext>();

  const [activeCategory, setActiveCategory] = useState<FileCategory>('all');
  const [selectedFolder, setSelectedFolder] = useState<string>(folderParam);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Categories list for filter tabs
  const categories: { label: string; value: FileCategory }[] = [
    { label: 'All Files', value: 'all' },
    { label: 'Images', value: 'image' },
    { label: 'Documents', value: 'document' },
    { label: 'PDFs', value: 'pdf' },
    { label: 'Sheets', value: 'spreadsheet' },
    { label: 'Videos', value: 'video' },
    { label: 'Audio', value: 'audio' },
    { label: 'Archives', value: 'archive' },
  ];

  // Filtering & Sorting
  const filteredFiles = useMemo(() => {
    return files
      .filter((file) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = file.name.toLowerCase().includes(q);
          const matchType = file.type.toLowerCase().includes(q);
          if (!matchName && !matchType) return false;
        }

        // Folder filter
        if (selectedFolder !== 'all') {
          if (file.folderId !== selectedFolder) return false;
        }

        // Category filter
        if (activeCategory !== 'all') {
          const cat = getFileCategory(file.type, file.extension || '');
          if (cat !== activeCategory) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortField === 'name') {
          cmp = a.name.localeCompare(b.name);
        } else if (sortField === 'size') {
          cmp = a.size - b.size;
        } else if (sortField === 'createdAt') {
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        return sortDirection === 'asc' ? cmp : -cmp;
      });
  }, [files, searchQuery, selectedFolder, activeCategory, sortField, sortDirection]);

  const getFolderName = (folderId: string) => {
    if (folderId === 'root') return 'Root';
    const found = folders.find((f) => f.folderId === folderId);
    return found ? found.name : 'Root';
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-blue-600" />
            <span>My Files</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {filteredFiles.length} {filteredFiles.length === 1 ? 'file' : 'files'} found
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openCreateFolderModal(selectedFolder !== 'all' ? selectedFolder : 'root')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>New Folder</span>
          </button>

          <button
            onClick={() => openUploadModal(selectedFolder !== 'all' ? selectedFolder : 'root')}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Toolbar */}
      <div className="space-y-3">
        {/* Category Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.value}
              onClick={() => setActiveCategory(c.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === c.value
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Toolbar: Folder selector, Sort, View mode */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Folder Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Folder:</span>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">📁 All Folders</option>
              <option value="root">📁 Root / Home</option>
              {folders.map((f) => (
                <option key={f.folderId} value={f.folderId}>
                  📁 {f.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-medium">Sort:</span>
              <select
                value={`${sortField}_${sortDirection}`}
                onChange={(e) => {
                  const [field, dir] = e.target.value.split('_');
                  setSortField(field as SortField);
                  setSortDirection(dir as SortDirection);
                }}
                className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden"
              >
                <option value="createdAt_desc">Newest First</option>
                <option value="createdAt_asc">Oldest First</option>
                <option value="name_asc">Name (A-Z)</option>
                <option value="name_desc">Name (Z-A)</option>
                <option value="size_desc">Size (Largest)</option>
                <option value="size_asc">Size (Smallest)</option>
              </select>
            </div>

            {/* Grid / List View Toggle */}
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
          </div>
        </div>
      </div>

      {/* Files Display */}
      {filteredFiles.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredFiles.map((file) => (
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
            {/* Table Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <div className="flex-1">Name</div>
              <div className="hidden md:block w-36">Location</div>
              <div className="hidden sm:block w-24">Size</div>
              <div className="hidden lg:block w-28">Uploaded</div>
              <div className="w-16 text-right">Actions</div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredFiles.map((file) => (
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
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No files found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-6">
            {searchQuery || activeCategory !== 'all' || selectedFolder !== 'all'
              ? 'Try clearing your search query or switching filter category.'
              : 'Upload files to populate your CloudVault storage.'}
          </p>
          <button
            onClick={() => openUploadModal(selectedFolder !== 'all' ? selectedFolder : 'root')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 inline-flex items-center gap-2 cursor-pointer transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Files Here</span>
          </button>
        </div>
      )}
    </div>
  );
}
