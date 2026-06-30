import { Injectable, Logger } from '@nestjs/common';
import {
  BlobServiceClient,
  ContainerClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} from '@azure/storage-blob';
import { randomUUID } from 'crypto';
import { IStorageService } from './storage.interface';
import { AppConfigService } from '../../config/app-config.service';

/**
 * Stores files in Azure Blob Storage.
 *
 * Container is created as PRIVATE (no public read access) — every download
 * URL returned by getUrl() is a short-lived SAS (Shared Access Signature)
 * token, not a permanently public link. This matters for resumes, ID
 * documents, certificates etc., which should never be guessable/public.
 *
 * Activated by setting STORAGE_PROVIDER=azure in the API's environment —
 * see StorageModule, which constructs this adapter manually (NOT as a
 * standard Nest provider) so it's only ever instantiated when actually
 * selected. AZURE_STORAGE_CONNECTION_STRING and AZURE_STORAGE_CONTAINER_NAME
 * must also be set; see .env.example.
 */
@Injectable()
export class AzureBlobStorageAdapter implements IStorageService {
  private readonly logger = new Logger(AzureBlobStorageAdapter.name);
  private readonly blobServiceClient: BlobServiceClient;
  private readonly containerClient:   ContainerClient;
  private readonly accountName:       string;
  private readonly accountKey:        string;
  private readonly sasTtlMinutes      = 60; // download links expire after 1 hour

  constructor(config: AppConfigService) {
    const connectionString = config.azureStorageConnectionString;
    const containerName    = config.azureStorageContainerName;

    if (!connectionString) {
      throw new Error(
        'STORAGE_PROVIDER=azure but AZURE_STORAGE_CONNECTION_STRING is not set. ' +
        'Copy the connection string from Azure Portal → Storage Account → Access Keys.',
      );
    }

    this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    this.containerClient   = this.blobServiceClient.getContainerClient(containerName);

    // Parsed out for SAS token signing — generateBlobSASQueryParameters needs
    // the raw account name + key, not just the connection string.
    const parsed = this.parseConnectionString(connectionString);
    this.accountName = parsed.accountName;
    this.accountKey  = parsed.accountKey;
  }

  /**
   * Ensures the container exists. Called explicitly once by StorageModule's
   * factory right after construction — deliberately NOT a Nest OnModuleInit
   * hook, since this adapter is constructed manually (not registered as a
   * Nest provider) precisely so it's never touched unless STORAGE_PROVIDER=azure.
   */
  async ensureContainerExists(): Promise<void> {
    try {
      const created = await this.containerClient.createIfNotExists();
      if (created.succeeded) {
        this.logger.log(`Created Azure Blob container: ${this.containerClient.containerName}`);
      }
    } catch (err) {
      this.logger.error(
        `Failed to verify/create Azure Blob container "${this.containerClient.containerName}". ` +
        `Check AZURE_STORAGE_CONNECTION_STRING and AZURE_STORAGE_CONTAINER_NAME.`,
        err instanceof Error ? err.stack : String(err),
      );
      throw err;
    }
  }

  async upload(filename: string, buffer: Buffer, mimeType: string): Promise<string> {
    const ext        = filename.split('.').pop() ?? 'bin';
    const storageKey = `${randomUUID()}.${ext}`;

    const blockBlobClient = this.containerClient.getBlockBlobClient(storageKey);
    await blockBlobClient.upload(buffer, buffer.length, {
      blobHTTPHeaders: { blobContentType: mimeType },
    });

    return storageKey;
  }

  async delete(storageKey: string): Promise<void> {
    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(storageKey);
      await blockBlobClient.deleteIfExists();
    } catch (err) {
      // Idempotent on delete — log but never throw, matching LocalStorageAdapter's behaviour
      this.logger.warn(`Could not delete blob ${storageKey}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  /**
   * Returns a time-limited SAS URL granting read-only access to this one
   * blob. The container itself stays private — nothing is guessable or
   * publicly listable.
   */
  getUrl(storageKey: string): string {
    const blockBlobClient = this.containerClient.getBlockBlobClient(storageKey);

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName: this.containerClient.containerName,
        blobName:      storageKey,
        permissions:   BlobSASPermissions.parse('r'), // read-only
        startsOn:      new Date(),
        expiresOn:     new Date(Date.now() + this.sasTtlMinutes * 60 * 1000),
      },
      new StorageSharedKeyCredential(this.accountName, this.accountKey),
    ).toString();

    return `${blockBlobClient.url}?${sasToken}`;
  }

  /**
   * Extracts AccountName / AccountKey from the connection string — needed
   * separately from BlobServiceClient because SAS signing requires the raw
   * credential object, not just an authenticated client.
   */
  private parseConnectionString(connectionString: string): { accountName: string; accountKey: string } {
    const parts = Object.fromEntries(
      connectionString.split(';').filter(Boolean).map(kv => {
        const idx = kv.indexOf('=');
        return [kv.slice(0, idx), kv.slice(idx + 1)];
      }),
    );

    const accountName = parts['AccountName'];
    const accountKey  = parts['AccountKey'];

    if (!accountName || !accountKey) {
      throw new Error(
        'AZURE_STORAGE_CONNECTION_STRING is missing AccountName or AccountKey — ' +
        'copy the full connection string from Azure Portal → Storage Account → Access Keys.',
      );
    }

    return { accountName, accountKey };
  }
}
