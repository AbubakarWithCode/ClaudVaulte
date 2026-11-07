import { getFileBlob } from './idb';
import { FileItem } from '../types';

/**
 * Universal download helper that checks local IndexedDB first,
 * falling back to Firestore/Cloud Storage URL.
 */
export async function downloadFileItem(file: FileItem): Promise<void> {
  let url = file.downloadURL;

  try {
    const cachedBlob = await getFileBlob(file.fileId);
    if (cachedBlob) {
      url = URL.createObjectURL(cachedBlob);
    }
  } catch (err) {
    console.warn('Could not read cached blob, using downloadURL:', err);
  }

  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  if (url.startsWith('blob:')) {
    setTimeout(() => {
      try {
        URL.revokeObjectURL(url);
      } catch {}
    }, 60000);
  }
}

/**
 * Resolves a displayable preview URL for any file item.
 */
export async function resolveFilePreviewURL(file: FileItem): Promise<string> {
  if (file.downloadURL && !file.downloadURL.startsWith('blob:file_')) {
    return file.downloadURL;
  }

  try {
    const cachedBlob = await getFileBlob(file.fileId);
    if (cachedBlob) {
      return URL.createObjectURL(cachedBlob);
    }
  } catch (err) {
    console.warn('Error retrieving cached preview blob:', err);
  }

  return file.downloadURL;
}
