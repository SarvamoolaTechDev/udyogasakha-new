import { PrismaService } from '../../prisma/prisma.service';
import { IStorageService } from '../../common/storage/storage.interface';
import { DocumentType } from '@prisma/client';
export declare class DocumentsService {
    private readonly prisma;
    private readonly storage;
    constructor(prisma: PrismaService, storage: IStorageService);
    upload(profileId: string, documentType: DocumentType, file: Express.Multer.File): Promise<{
        id: string;
        profileId: string;
        documentType: import(".prisma/client").$Enums.DocumentType;
        filename: string;
        mimeType: string;
        sizeBytes: number;
        storageKey: string;
        approvedAt: Date | null;
        uploadedAt: Date;
    }>;
    getForProfile(profileId: string): Promise<{
        url: string;
        id: string;
        profileId: string;
        documentType: import(".prisma/client").$Enums.DocumentType;
        filename: string;
        mimeType: string;
        sizeBytes: number;
        storageKey: string;
        approvedAt: Date | null;
        uploadedAt: Date;
    }[]>;
    deleteDoc(docId: string, userId: string): Promise<{
        id: string;
        profileId: string;
        documentType: import(".prisma/client").$Enums.DocumentType;
        filename: string;
        mimeType: string;
        sizeBytes: number;
        storageKey: string;
        approvedAt: Date | null;
        uploadedAt: Date;
    }>;
}
export declare class DocumentsController {
    private readonly svc;
    constructor(svc: DocumentsService);
    upload(profileId: string, docType: DocumentType, file: Express.Multer.File): Promise<{
        id: string;
        profileId: string;
        documentType: import(".prisma/client").$Enums.DocumentType;
        filename: string;
        mimeType: string;
        sizeBytes: number;
        storageKey: string;
        approvedAt: Date | null;
        uploadedAt: Date;
    }>;
    getForProfile(profileId: string): Promise<{
        url: string;
        id: string;
        profileId: string;
        documentType: import(".prisma/client").$Enums.DocumentType;
        filename: string;
        mimeType: string;
        sizeBytes: number;
        storageKey: string;
        approvedAt: Date | null;
        uploadedAt: Date;
    }[]>;
    deleteDoc(docId: string, userId: string): Promise<{
        id: string;
        profileId: string;
        documentType: import(".prisma/client").$Enums.DocumentType;
        filename: string;
        mimeType: string;
        sizeBytes: number;
        storageKey: string;
        approvedAt: Date | null;
        uploadedAt: Date;
    }>;
}
export declare class DocumentsModule {
}
