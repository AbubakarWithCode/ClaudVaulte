import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import TopHeader from '../components/common/TopHeader';
import UploadModal from '../components/modals/UploadModal';
import CreateFolderModal from '../components/modals/CreateFolderModal';
import FilePreviewModal from '../components/modals/FilePreviewModal';
import FileShareModal from '../components/modals/FileShareModal';
import MoveToFolderModal from '../components/modals/MoveToFolderModal';
import RenameModal from '../components/modals/RenameModal';
import UpgradeModal from '../components/modals/UpgradeModal';
import { FileItem, FolderItem } from '../types';
import { useStorage } from '../context/StorageContext';

export interface DashboardOutletContext {
  searchQuery: string;
  openUploadModal: (folderId?: string) => void;
  openCreateFolderModal: (parentId?: string) => void;
  openPreviewModal: (file: FileItem) => void;
  openShareModal: (file: FileItem) => void;
  openMoveModal: (file: FileItem) => void;
  openRenameModal: (item: FileItem | FolderItem, type: 'file' | 'folder') => void;
  openUpgradeModal: (planId?: 'pro' | 'business') => void;
}

export default function DashboardLayout() {
  const { moveToTrash, permanentDeleteFile } = useStorage();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFolderId, setUploadFolderId] = useState('root');

  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [createFolderParentId, setCreateFolderParentId] = useState('root');

  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [shareFile, setShareFile] = useState<FileItem | null>(null);
  const [moveFile, setMoveFile] = useState<FileItem | null>(null);
  const [renameData, setRenameData] = useState<{
    item: FileItem | FolderItem;
    type: 'file' | 'folder';
  } | null>(null);

  // Upgrade modal state
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [upgradeDefaultPlan, setUpgradeDefaultPlan] = useState<'pro' | 'business'>('pro');

  const openUploadModal = (folderId: string = 'root') => {
    setUploadFolderId(folderId);
    setIsUploadOpen(true);
  };

  const openCreateFolderModal = (parentId: string = 'root') => {
    setCreateFolderParentId(parentId);
    setIsCreateFolderOpen(true);
  };

  const openPreviewModal = (file: FileItem) => {
    setPreviewFile(file);
  };

  const openShareModal = (file: FileItem) => {
    setShareFile(file);
  };

  const openMoveModal = (file: FileItem) => {
    setMoveFile(file);
  };

  const openRenameModal = (item: FileItem | FolderItem, type: 'file' | 'folder') => {
    setRenameData({ item, type });
  };

  const openUpgradeModal = (planId: 'pro' | 'business' = 'pro') => {
    setUpgradeDefaultPlan(planId);
    setIsUpgradeOpen(true);
  };

  const outletContext: DashboardOutletContext = {
    searchQuery,
    openUploadModal,
    openCreateFolderModal,
    openPreviewModal,
    openShareModal,
    openMoveModal,
    openRenameModal,
    openUpgradeModal,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onOpenUpload={() => openUploadModal('root')}
        onOpenUpgrade={() => openUpgradeModal('pro')}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <TopHeader
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onOpenUpload={() => openUploadModal('root')}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={outletContext} />
        </main>
      </div>

      {/* Global Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        defaultFolderId={uploadFolderId}
      />

      <CreateFolderModal
        isOpen={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
        parentId={createFolderParentId}
      />

      <FilePreviewModal
        file={previewFile}
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        onShare={(f) => {
          setPreviewFile(null);
          setShareFile(f);
        }}
        onDelete={async (f) => {
          setPreviewFile(null);
          await moveToTrash(f.fileId);
        }}
      />

      <FileShareModal
        file={shareFile}
        isOpen={!!shareFile}
        onClose={() => setShareFile(null)}
      />

      <MoveToFolderModal
        file={moveFile}
        isOpen={!!moveFile}
        onClose={() => setMoveFile(null)}
      />

      <RenameModal
        item={renameData?.item || null}
        type={renameData?.type || 'file'}
        isOpen={!!renameData}
        onClose={() => setRenameData(null)}
      />

      {/* SaaS Storage Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        defaultPlanId={upgradeDefaultPlan}
      />
    </div>
  );
}
