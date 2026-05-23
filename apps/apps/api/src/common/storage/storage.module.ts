import { Global, Module } from '@nestjs/common';
import { LocalStorageAdapter } from './local-storage.adapter';
import { STORAGE_SERVICE } from './storage.interface';

// @Global() so DocumentsService can inject STORAGE_SERVICE without
// each module needing to import StorageModule.
// To swap to S3: replace LocalStorageAdapter with S3StorageAdapter here only.
@Global()
@Module({
  providers: [
    { provide: STORAGE_SERVICE, useClass: LocalStorageAdapter },
  ],
  exports: [STORAGE_SERVICE],
})
export class StorageModule {}
