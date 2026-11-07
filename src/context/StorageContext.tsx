import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, storage, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { FileItem, FolderItem, UploadProgressItem, FileCategory } from '../types';
import { getFileCategory, getFileExtension } from '../lib/utils';
import { storeFileBlob, deleteFileBlob } from '../lib/idb';

interface StorageContextType {
  files: FileItem[];
  folders: FolderItem[];
  trashFiles: FileItem[];
  trashFolders: FolderItem[];
  sharedFiles: FileItem[];
  loading: boolean;
  uploadProgress: UploadProgressItem[];
  clearUploadProgress: () => void;
  // Stats
  totalStorageUsed: number;
  totalStorageLimit: number;
  totalFilesCount: number;
  totalFoldersCount: number;
  categoryBreakdown: Record<FileCategory, { count: number; bytes: number }>;
  // File operations
  uploadFiles: (fileList: File[], targetFolderId?: string) => Promise<void>;
  renameFile: (fileId: string, newName: string) => Promise<void>;
  toggleStar: (fileId: string, currentStarred?: boolean) => Promise<void>;
  moveToTrash: (fileId: string) => Promise<void>;
  restoreFromTrash: (fileId: string) => Promise<void>;
  permanentDeleteFile: (fileId: string) => Promise<void>;
  moveFileToFolder: (fileId: string, targetFolderId: string) => Promise<void>;
  toggleShare: (fileId: string, enableShare: boolean, permission?: 'view' | 'download') => Promise<string>;
  // Folder operations
  createFolder: (name: string, parentId?: string, color?: string) => Promise<string>;
  renameFolder: (folderId: string, newName: string) => Promise<void>;
  moveFolderToTrash: (folderId: string) => Promise<void>;
  restoreFolderFromTrash: (folderId: string) => Promise<void>;
  permanentDeleteFolder: (folderId: string) => Promise<void>;
  emptyTrash: () => Promise<void>;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export function StorageProvider({ children }: { children: React.ReactNode }) {
  const { user, userProfile } = useAuth();

  const [allFiles, setAllFiles] = useState<FileItem[]>([]);
  const [allFolders, setAllFolders] = useState<FolderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressItem[]>([]);

  // Real-time Firestore subscriptions for files and folders
  useEffect(() => {
    if (!user) {
      setAllFiles([]);
      setAllFolders([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const filesQuery = query(
      collection(db, 'files'),
      where('userId', '==', user.uid)
    );

    const unsubscribeFiles = onSnapshot(
      filesQuery,
      (snapshot) => {
        const items: FileItem[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as FileItem);
        });
        setAllFiles(items);
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to files:', error);
        handleFirestoreError(error, OperationType.LIST, 'files');
        setLoading(false);
      }
    );

    const foldersQuery = query(
      collection(db, 'folders'),
      where('userId', '==', user.uid)
    );

    const unsubscribeFolders = onSnapshot(
      foldersQuery,
      (snapshot) => {
        const items: FolderItem[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as FolderItem);
        });
        setAllFolders(items);
      },
      (error) => {
        console.error('Error listening to folders:', error);
        handleFirestoreError(error, OperationType.LIST, 'folders');
      }
    );

    return () => {
      unsubscribeFiles();
      unsubscribeFolders();
    };
  }, [user]);

  // Derived collections
  const files = useMemo(() => allFiles.filter((f) => !f.isTrash), [allFiles]);
  const trashFiles = useMemo(() => allFiles.filter((f) => f.isTrash), [allFiles]);
  const folders = useMemo(() => allFolders.filter((f) => !f.isTrash), [allFolders]);
  const trashFolders = useMemo(() => allFolders.filter((f) => f.isTrash), [allFolders]);
  const sharedFiles = useMemo(() => files.filter((f) => f.isShared), [files]);

  // Total Storage calculation (actual sum of files)
  const totalStorageUsed = useMemo(() => {
    return files.reduce((acc, f) => acc + (f.size || 0), 0);
  }, [files]);

  const totalStorageLimit = userProfile?.storageLimit || 5 * 1024 * 1024 * 1024; // 5 GB
  const totalFilesCount = files.length;
  const totalFoldersCount = folders.length;

  // Sync actual used storage to Firestore UserProfile
  useEffect(() => {
    if (user && userProfile && userProfile.storageUsed !== totalStorageUsed) {
      const userRef = doc(db, 'users', user.uid);
      updateDoc(userRef, {
        storageUsed: totalStorageUsed,
        updatedAt: new Date().toISOString(),
      }).catch((err) => {
        console.warn('Could not sync storageUsed to user profile:', err);
      });
    }
  }, [user, userProfile, totalStorageUsed]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const counts: Record<FileCategory, { count: number; bytes: number }> = {
      all: { count: files.length, bytes: totalStorageUsed },
      image: { count: 0, bytes: 0 },
      pdf: { count: 0, bytes: 0 },
      document: { count: 0, bytes: 0 },
      spreadsheet: { count: 0, bytes: 0 },
      video: { count: 0, bytes: 0 },
      audio: { count: 0, bytes: 0 },
      archive: { count: 0, bytes: 0 },
      other: { count: 0, bytes: 0 },
    };

    files.forEach((f) => {
      const cat = getFileCategory(f.type, f.extension || '');
      counts[cat].count += 1;
      counts[cat].bytes += f.size || 0;
    });

    return counts;
  }, [files, totalStorageUsed]);

  // Real File Upload
  const uploadFiles = async (fileList: File[], targetFolderId: string = 'root') => {
    if (!user) throw new Error('You must be signed in to upload files');

    // Calculate total size of batch
    const newBytes = fileList.reduce((acc, file) => acc + file.size, 0);
    if (totalStorageUsed + newBytes > totalStorageLimit) {
      throw new Error(
        `Upload exceeds your 5 GB storage quota. You have ${(
          (totalStorageLimit - totalStorageUsed) / (1024 * 1024)
        ).toFixed(1)} MB available.`
      );
    }

    const newProgressItems: UploadProgressItem[] = fileList.map((file) => ({
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      progress: 0,
      status: 'pending',
    }));

    setUploadProgress((prev) => [...prev, ...newProgressItems]);

    let hadErrors = false;
    let firstErrorMessage = '';

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const progressItem = newProgressItems[i];
      const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const ext = getFileExtension(file.name);
      const storagePath = `users/${user.uid}/${fileId}/${file.name}`;

      try {
        setUploadProgress((prev) =>
          prev.map((item) =>
            item.id === progressItem.id ? { ...item, status: 'uploading', progress: 15 } : item
          )
        );

        // Cache raw file blob in local IndexedDB for immediate client-side reliability
        await storeFileBlob(fileId, file);

        let downloadURL = `blob:${fileId}`;

        // If file is small (< 400KB), generate a data URL so other sessions can view directly from Firestore
        if (file.size <= 400 * 1024) {
          try {
            downloadURL = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = () => resolve(`blob:${fileId}`);
              reader.readAsDataURL(file);
            });
          } catch {
            downloadURL = `blob:${fileId}`;
          }
        }

        // Try fast Cloud Storage upload if available, with a strict 2s timeout
        try {
          const storageRef = ref(storage, storagePath);
          const uploadTask = uploadBytesResumable(storageRef, file);

          const uploadPromise = new Promise<string>((resolve, reject) => {
            uploadTask.on(
              'state_changed',
              (snapshot) => {
                const percent = Math.round(
                  (snapshot.bytesTransferred / Math.max(1, snapshot.totalBytes)) * 100
                );
                setUploadProgress((prev) =>
                  prev.map((item) =>
                    item.id === progressItem.id ? { ...item, progress: Math.max(30, percent) } : item
                  )
                );
              },
              (err) => reject(err),
              async () => {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(url);
              }
            );
          });

          const timeoutPromise = new Promise<string>((_, reject) =>
            setTimeout(() => reject(new Error('Storage timeout')), 2500)
          );

          const cloudUrl = await Promise.race([uploadPromise, timeoutPromise]);
          if (cloudUrl) {
            downloadURL = cloudUrl;
          }
        } catch (storageErr) {
          console.warn('Direct Cloud Storage skipped/timed out, saving directly in Firestore:', storageErr);
        }

        // Save file metadata to Firestore database (CRITICAL)
        const fileRecord: FileItem = {
          fileId,
          userId: user.uid,
          name: file.name.slice(0, 255),
          originalName: file.name.slice(0, 255),
          size: file.size,
          type: (file.type || 'application/octet-stream').slice(0, 128),
          extension: ext.slice(0, 32),
          folderId: targetFolderId,
          downloadURL: downloadURL || `blob:${fileId}`,
          storagePath,
          isShared: false,
          sharePermission: 'view',
          shareToken: Math.random().toString(36).substring(2, 15),
          isStarred: false,
          isTrash: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const fileDocRef = doc(db, 'files', fileId);
        await setDoc(fileDocRef, fileRecord);

        setUploadProgress((prev) =>
          prev.map((item) =>
            item.id === progressItem.id ? { ...item, progress: 100, status: 'completed' } : item
          )
        );
      } catch (err: any) {
        hadErrors = true;
        firstErrorMessage = err instanceof Error ? err.message : String(err);
        console.error('File upload failed for:', file.name, err);
        setUploadProgress((prev) =>
          prev.map((item) =>
            item.id === progressItem.id
              ? {
                  ...item,
                  status: 'error',
                  errorMessage: firstErrorMessage,
                }
              : item
          )
        );
      }
    }

    if (hadErrors) {
      throw new Error(`Upload encountered error: ${firstErrorMessage}`);
    }
  };

  const clearUploadProgress = () => {
    setUploadProgress([]);
  };

  // Rename File
  const renameFile = async (fileId: string, newName: string) => {
    if (!user) return;
    const cleanName = newName.trim();
    if (!cleanName) throw new Error('File name cannot be empty');

    const fileRef = doc(db, 'files', fileId);
    await updateDoc(fileRef, {
      name: cleanName,
      updatedAt: new Date().toISOString(),
    });
  };

  // Toggle Star
  const toggleStar = async (fileId: string, currentStarred: boolean = false) => {
    if (!user) return;
    const fileRef = doc(db, 'files', fileId);
    await updateDoc(fileRef, {
      isStarred: !currentStarred,
      updatedAt: new Date().toISOString(),
    });
  };

  // Move File to Trash
  const moveToTrash = async (fileId: string) => {
    if (!user) return;
    const fileRef = doc(db, 'files', fileId);
    await updateDoc(fileRef, {
      isTrash: true,
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  // Restore File from Trash
  const restoreFromTrash = async (fileId: string) => {
    if (!user) return;
    const fileRef = doc(db, 'files', fileId);
    await updateDoc(fileRef, {
      isTrash: false,
      deletedAt: null,
      updatedAt: new Date().toISOString(),
    });
  };

  // Permanently Delete File
  const permanentDeleteFile = async (fileId: string) => {
    if (!user) return;
    const target = allFiles.find((f) => f.fileId === fileId);

    // Delete cached local blob from IndexedDB
    await deleteFileBlob(fileId);

    // Try deleting raw file from Storage if storagePath exists
    if (target?.storagePath) {
      try {
        const storageRef = ref(storage, target.storagePath);
        await deleteObject(storageRef);
      } catch (e) {
        console.warn('Storage delete warning:', e);
      }
    }

    // Delete Firestore document
    const fileRef = doc(db, 'files', fileId);
    await deleteDoc(fileRef);
  };

  // Move File to Folder
  const moveFileToFolder = async (fileId: string, targetFolderId: string) => {
    if (!user) return;
    const fileRef = doc(db, 'files', fileId);
    await updateDoc(fileRef, {
      folderId: targetFolderId,
      updatedAt: new Date().toISOString(),
    });
  };

  // Toggle Share
  const toggleShare = async (
    fileId: string,
    enableShare: boolean,
    permission: 'view' | 'download' = 'view'
  ): Promise<string> => {
    if (!user) throw new Error('Not authenticated');
    const target = allFiles.find((f) => f.fileId === fileId);
    const token = target?.shareToken || Math.random().toString(36).substring(2, 15);

    const fileRef = doc(db, 'files', fileId);
    await updateDoc(fileRef, {
      isShared: enableShare,
      sharePermission: permission,
      shareToken: token,
      updatedAt: new Date().toISOString(),
    });

    const shareUrl = `${window.location.origin}/share/${fileId}`;
    return shareUrl;
  };

  // Folder Operations
  const createFolder = async (name: string, parentId: string = 'root', color: string = '#3b82f6'): Promise<string> => {
    if (!user) throw new Error('Not authenticated');
    const cleanName = name.trim();
    if (!cleanName) throw new Error('Folder name cannot be empty');

    const folderId = `folder_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const folderRecord: FolderItem = {
      folderId,
      userId: user.uid,
      name: cleanName,
      parentId,
      color,
      isTrash: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const folderRef = doc(db, 'folders', folderId);
    await setDoc(folderRef, folderRecord);
    return folderId;
  };

  const renameFolder = async (folderId: string, newName: string) => {
    if (!user) return;
    const cleanName = newName.trim();
    if (!cleanName) throw new Error('Folder name cannot be empty');

    const folderRef = doc(db, 'folders', folderId);
    await updateDoc(folderRef, {
      name: cleanName,
      updatedAt: new Date().toISOString(),
    });
  };

  const moveFolderToTrash = async (folderId: string) => {
    if (!user) return;
    const folderRef = doc(db, 'folders', folderId);
    await updateDoc(folderRef, {
      isTrash: true,
      updatedAt: new Date().toISOString(),
    });
  };

  const restoreFolderFromTrash = async (folderId: string) => {
    if (!user) return;
    const folderRef = doc(db, 'folders', folderId);
    await updateDoc(folderRef, {
      isTrash: false,
      updatedAt: new Date().toISOString(),
    });
  };

  const permanentDeleteFolder = async (folderId: string) => {
    if (!user) return;
    const childFiles = allFiles.filter((f) => f.folderId === folderId);
    for (const child of childFiles) {
      await updateDoc(doc(db, 'files', child.fileId), {
        folderId: 'root',
        updatedAt: new Date().toISOString(),
      });
    }

    const folderRef = doc(db, 'folders', folderId);
    await deleteDoc(folderRef);
  };

  const emptyTrash = async () => {
    if (!user) return;
    for (const f of trashFiles) {
      await permanentDeleteFile(f.fileId);
    }
    for (const fold of trashFolders) {
      await permanentDeleteFolder(fold.folderId);
    }
  };

  return (
    <StorageContext.Provider
      value={{
        files,
        folders,
        trashFiles,
        trashFolders,
        sharedFiles,
        loading,
        uploadProgress,
        clearUploadProgress,
        totalStorageUsed,
        totalStorageLimit,
        totalFilesCount,
        totalFoldersCount,
        categoryBreakdown,
        uploadFiles,
        renameFile,
        toggleStar,
        moveToTrash,
        restoreFromTrash,
        permanentDeleteFile,
        moveFileToFolder,
        toggleShare,
        createFolder,
        renameFolder,
        moveFolderToTrash,
        restoreFolderFromTrash,
        permanentDeleteFolder,
        emptyTrash,
      }}
    >
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage() {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context;
}
