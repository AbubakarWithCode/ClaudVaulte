export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  storageUsed: number;
  storageLimit: number;
  plan?: 'free' | 'pro' | 'business';
  planStatus?: 'active' | 'pending' | 'expired';
  createdAt: string;
  updatedAt?: string;
}

export type FileCategory = 'all' | 'image' | 'pdf' | 'document' | 'spreadsheet' | 'video' | 'audio' | 'archive' | 'other';

export interface FileItem {
  fileId: string;
  userId: string;
  name: string;
  originalName?: string;
  size: number;
  type: string;
  extension?: string;
  folderId: string;
  downloadURL: string;
  storagePath?: string;
  isShared?: boolean;
  sharePermission?: 'view' | 'download';
  shareToken?: string;
  isStarred?: boolean;
  isTrash: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FolderItem {
  folderId: string;
  userId: string;
  name: string;
  parentId: string; // 'root' or another folderId
  color?: string;
  isTrash: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface UploadProgressItem {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  errorMessage?: string;
}

export type SortField = 'name' | 'size' | 'createdAt' | 'type';
export type SortDirection = 'asc' | 'desc';
export type ViewMode = 'grid' | 'list';

export interface UpgradeRequest {
  requestId: string;
  userId: string;
  userEmail: string;
  userName?: string;
  planId: 'pro' | 'business';
  planName: string;
  storageBytes: number;
  amount: number;
  currency: 'PKR' | 'USD';
  paymentMethod: 'easypaisa' | 'jazzcash' | 'sadapay' | 'bank' | 'card';
  trxId: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt?: string;
}

export interface PlanTier {
  id: 'free' | 'pro' | 'business';
  name: string;
  storageLabel: string;
  storageBytes: number;
  pricePKR: number;
  priceUSD: number;
  period: string;
  popular?: boolean;
  features: string[];
}
