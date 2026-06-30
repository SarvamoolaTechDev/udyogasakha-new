import { Global, Module } from '@nestjs/common';
import { LocalStorageAdapter } from './local-storage.adapter';
import { AzureBlobStorageAdapter } from './azure-blob-storage.adapter';
import { STORAGE_SERVICE } from './storage.interface';
import { AppConfigModule } from '../../config/app-config.module';
import { AppConfigService } from '../../config/app-config.service';

// @Global() so DocumentsService can inject STORAGE_SERVICE without
// each module needing to import StorageModule.
//
// Provider is chosen at runtime by STORAGE_PROVIDER env var:
//   STORAGE_PROVIDER=local  → LocalStorageAdapter (default — filesystem, dev-friendly)
//   STORAGE_PROVIDER=azure  → AzureBlobStorageAdapter (requires AZURE_STORAGE_*
//                              env vars — see .env.example)
// No code change needed to switch — just flip the env var and redeploy.
//
// IMPORTANT: the factory below constructs ONLY the selected adapter manually
// (not both as separate Nest providers). If both were registered as normal
// providers, Nest would instantiate both at startup regardless of which is
// actually used — and AzureBlobStorageAdapter's constructor throws if Azure
// env vars aren't set, which would crash local dev even when running in
// local-storage mode. Constructing just one avoids that entirely.
@Global()
@Module({
  imports: [AppConfigModule],
  providers: [
    {
      provide:    STORAGE_SERVICE,
      inject:     [AppConfigService],
      useFactory: async (config: AppConfigService) => {
        if (config.storageProvider === 'azure') {
          const adapter = new AzureBlobStorageAdapter(config);
          await adapter.ensureContainerExists();
          return adapter;
        }
        return new LocalStorageAdapter();
      },
    },
  ],
  exports: [STORAGE_SERVICE],
})
export class StorageModule {}
