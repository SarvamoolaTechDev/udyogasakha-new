"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageModule = void 0;
const common_1 = require("@nestjs/common");
const local_storage_adapter_1 = require("./local-storage.adapter");
const azure_blob_storage_adapter_1 = require("./azure-blob-storage.adapter");
const storage_interface_1 = require("./storage.interface");
const app_config_module_1 = require("../../config/app-config.module");
const app_config_service_1 = require("../../config/app-config.service");
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
let StorageModule = class StorageModule {
};
exports.StorageModule = StorageModule;
exports.StorageModule = StorageModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [app_config_module_1.AppConfigModule],
        providers: [
            {
                provide: storage_interface_1.STORAGE_SERVICE,
                inject: [app_config_service_1.AppConfigService],
                useFactory: async (config) => {
                    if (config.storageProvider === 'azure') {
                        const adapter = new azure_blob_storage_adapter_1.AzureBlobStorageAdapter(config);
                        await adapter.ensureContainerExists();
                        return adapter;
                    }
                    return new local_storage_adapter_1.LocalStorageAdapter();
                },
            },
        ],
        exports: [storage_interface_1.STORAGE_SERVICE],
    })
], StorageModule);
//# sourceMappingURL=storage.module.js.map