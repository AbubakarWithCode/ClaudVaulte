# CloudVault Security Specification & Invariants

## 1. Data Invariants

1. **User Profile Invariant**:
   - Every `/users/{userId}` document must have an ID matching `request.auth.uid`.
   - Users cannot modify their `userId` or create profiles for other UIDs.
   - Users cannot set exorbitant storage limit values above their allocated plan tier (default 5 GB).
   - Only authenticated users can read and write their own profile document.

2. **File Item Invariant**:
   - Every `/files/{fileId}` document belongs to a specific `userId`.
   - On creation, `userId` MUST equal `request.auth.uid`.
   - On update and delete, only the owner (`resource.data.userId == request.auth.uid`) can modify or delete the file metadata.
   - Exception for read: Publicly shared files (`resource.data.isShared == true`) can be read by anyone with the link/ID; otherwise only the owner can read.
   - A file cannot exceed the user's remaining storage quota.
   - Name and sizes must have bounded lengths and numbers.

3. **Folder Item Invariant**:
   - Every `/folders/{folderId}` document belongs to a specific `userId`.
   - Only the owner (`resource.data.userId == request.auth.uid`) can create, read, update, or delete folders.
   - Folder name must be between 1 and 255 characters.

4. **Storage Rules Invariant**:
   - Storage path is scoped to `users/{userId}/{fileId}/{filename}`.
   - Only the authenticated owner matching `{userId}` can upload, read, or delete raw storage files, or publicly shared files via direct download token.

---

## 2. The Dirty Dozen Payloads (Adversarial Security Test Matrix)

1. **Attacker Impersonation on Profile Creation**:
   - Payload: `{ userId: "victim-uid", email: "attacker@evil.com", storageUsed: 0, storageLimit: 5368709120 }`
   - Expected: PERMISSION_DENIED (uid does not match request.auth.uid).

2. **Privilege Escalation on Storage Limit**:
   - Payload: `{ storageLimit: 9999999999999 }`
   - Expected: PERMISSION_DENIED (client cannot unilaterally grant 10 TB free storage).

3. **Orphan File Creation with Forged Owner**:
   - Payload: `{ fileId: "file_123", userId: "victim-uid", name: "malware.exe", size: 1024 }`
   - Expected: PERMISSION_DENIED (incoming().userId != request.auth.uid).

4. **Cross-Tenant File Snooping (Private File Read)**:
   - Target: `/files/victim_private_file` where `isShared == false`
   - Expected: PERMISSION_DENIED for unauthenticated or non-owner user.

5. **Unauthorized File Deletion by Non-Owner**:
   - Request: Delete `/files/victim_file_id`
   - Expected: PERMISSION_DENIED.

6. **Unauthorized File Rename or Content Mutation**:
   - Payload: `{ name: "hacked.txt" }` from non-owner
   - Expected: PERMISSION_DENIED.

7. **Cross-Tenant Folder Listing**:
   - Query: `collection("folders")` without `where("userId", "==", auth.uid)`
   - Expected: PERMISSION_DENIED.

8. **Folder Deletion Attack**:
   - Request: Delete `/folders/victim_folder` by non-owner
   - Expected: PERMISSION_DENIED.

9. **Oversized String Denial-of-Wallet Attack**:
   - Payload: `{ name: "A".repeat(50000) }`
   - Expected: PERMISSION_DENIED (boundary validation rejects name.size() > 255).

10. **Ghost Field Injection (Shadow Update)**:
    - Payload: `{ name: "report.pdf", __isAdmin: true, bypassQuota: true }`
    - Expected: PERMISSION_DENIED (strict field allowlisting).

11. **Negative Storage Calculation Attack**:
    - Payload: `{ storageUsed: -50000000 }`
    - Expected: PERMISSION_DENIED (storageUsed must be non-negative).

12. **Folder Parent Poisoning**:
    - Payload: `{ folderId: "folder_1", userId: "attacker", name: "My Folder", parentId: "../../root" }`
    - Expected: PERMISSION_DENIED (valid path/id regex validation).
