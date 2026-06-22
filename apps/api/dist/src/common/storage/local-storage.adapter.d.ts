import { IStorageService } from './storage.interface';
export declare class LocalStorageAdapter implements IStorageService {
    private readonly logger;
    private readonly dir;
    constructor();
    upload(filename: string, buffer: Buffer, _mimeType: string): Promise<string>;
    delete(storageKey: string): Promise<void>;
    getUrl(storageKey: string): string;
}
