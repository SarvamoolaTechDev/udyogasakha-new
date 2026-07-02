"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var LocalStorageAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorageAdapter = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
const crypto_1 = require("crypto");
let LocalStorageAdapter = LocalStorageAdapter_1 = class LocalStorageAdapter {
    constructor() {
        this.logger = new common_1.Logger(LocalStorageAdapter_1.name);
        this.dir = (0, path_1.join)(process.cwd(), 'uploads', 'documents');
        // Ensure upload directory exists on startup
        if (!(0, fs_1.existsSync)(this.dir)) {
            (0, fs_1.mkdirSync)(this.dir, { recursive: true });
            this.logger.log(`Created upload directory: ${this.dir}`);
        }
    }
    async upload(filename, buffer, _mimeType) {
        const ext = filename.split('.').pop() ?? 'bin';
        const storageKey = `${(0, crypto_1.randomUUID)()}.${ext}`;
        const dest = (0, path_1.join)(this.dir, storageKey);
        await new Promise((resolve, reject) => {
            const stream = (0, fs_1.createWriteStream)(dest);
            stream.write(buffer);
            stream.end();
            stream.on('finish', resolve);
            stream.on('error', reject);
        });
        return storageKey;
    }
    async delete(storageKey) {
        const path = (0, path_1.join)(this.dir, storageKey);
        await new Promise((resolve) => {
            (0, fs_1.unlink)(path, (err) => {
                if (err && err.code !== 'ENOENT') {
                    // Log but don't throw — a missing file is not an error on delete
                    this.logger.warn(`Could not delete file ${storageKey}: ${err.message}`);
                }
                resolve();
            });
        });
    }
    getUrl(storageKey) {
        // Static assets are served by NestJS at /uploads/... in development
        return `/uploads/documents/${storageKey}`;
    }
};
exports.LocalStorageAdapter = LocalStorageAdapter;
exports.LocalStorageAdapter = LocalStorageAdapter = LocalStorageAdapter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], LocalStorageAdapter);
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
//# sourceMappingURL=local-storage.adapter.js.map