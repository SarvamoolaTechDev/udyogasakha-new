/**
 * Provider-agnostic storage contract.
 *
 * Current implementation: LocalStorageAdapter (files on disk).
 * Phase 2 swap: S3StorageAdapter / R2StorageAdapter — drop-in replacement,
 * DocumentsService and all consumers stay unchanged.
 */
export interface IStorageService {
    /**
     * Persist a file buffer and return the storage key.
     * The key is an opaque identifier — callers store it in the DB
     * and pass it back to delete() or getUrl().
     */
    upload(filename: string, buffer: Buffer, mimeType: string): Promise<string>;
    /**
     * Delete a file by its storage key. Silently succeeds if the file
     * does not exist (idempotent).
     */
    delete(storageKey: string): Promise<void>;
    /**
     * Return a URL that can be used to serve / download the file.
     * Local adapter returns a relative path served by NestJS static assets.
     * S3/R2 adapter returns a presigned URL with a short TTL.
     */
    getUrl(storageKey: string): string;
}
export declare const STORAGE_SERVICE = "STORAGE_SERVICE";
