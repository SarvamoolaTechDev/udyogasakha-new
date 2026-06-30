import { Injectable, Logger } from '@nestjs/common';
import { createWriteStream, mkdirSync, existsSync, unlink } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { IStorageService } from './storage.interface';

@Injectable()
export class LocalStorageAdapter implements IStorageService {
  private readonly logger = new Logger(LocalStorageAdapter.name);
  private readonly dir    = join(process.cwd(), 'uploads', 'documents');

  constructor() {
    // Ensure upload directory exists on startup
    if (!existsSync(this.dir)) {
      mkdirSync(this.dir, { recursive: true });
      this.logger.log(`Created upload directory: ${this.dir}`);
    }
  }

  async upload(filename: string, buffer: Buffer, _mimeType: string): Promise<string> {
    const ext        = filename.split('.').pop() ?? 'bin';
    const storageKey = `${randomUUID()}.${ext}`;
    const dest       = join(this.dir, storageKey);

    await new Promise<void>((resolve, reject) => {
      const stream = createWriteStream(dest);
      stream.write(buffer);
      stream.end();
      stream.on('finish', resolve);
      stream.on('error',  reject);
    });

    return storageKey;
  }

  async delete(storageKey: string): Promise<void> {
    const path = join(this.dir, storageKey);
    await new Promise<void>((resolve) => {
      unlink(path, (err) => {
        if (err && err.code !== 'ENOENT') {
          // Log but don't throw — a missing file is not an error on delete
          this.logger.warn(`Could not delete file ${storageKey}: ${err.message}`);
        }
        resolve();
      });
    });
  }

  getUrl(storageKey: string): string {
    // Static assets are served by NestJS at /uploads/... in development
    return `/uploads/documents/${storageKey}`;
  }
}

/*
 * ── Phase 2: Azure Blob Storage adapter ──────────────────────────────────────
 * When ready, create AzureBlobStorageAdapter implements IStorageService,
 * inject @azure/storage-blob, replace LocalStorageAdapter in StorageModule.
 * DocumentsService needs zero changes.
 *
 * export class AzureBlobStorageAdapter implements IStorageService {
 *   constructor(private readonly containerClient: ContainerClient) {}
 *   async upload(filename, buffer, mimeType) { ... } // containerClient.getBlockBlobClient(key).upload(...)
 *   async delete(storageKey) { ... }                  // containerClient.getBlockBlobClient(key).deleteIfExists()
 *   getUrl(storageKey) { return generateBlobSASQueryParameters(...); } // short-TTL SAS URL
 * }
 */
