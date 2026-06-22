import { PrismaService } from '../../prisma/prisma.service';
import { IStorageService } from '../../common/storage/storage.interface';
import { UserDocumentType } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
export declare class UserDocumentsService {
    private readonly prisma;
    private readonly audit;
    private readonly storage;
    constructor(prisma: PrismaService, audit: AuditService, storage: IStorageService);
    upload(userId: string, documentType: UserDocumentType, file: Express.Multer.File): Promise<{
        url: string;
        id: string;
        userId: string;
        documentType: import(".prisma/client").$Enums.UserDocumentType;
        filename: string;
        mimeType: string;
        sizeBytes: number;
        storageKey: string;
        uploadedAt: Date;
        verifiedAt: Date | null;
        verifierId: string | null;
    }>;
    listForUser(userId: string): Promise<{
        url: string;
        id: string;
        userId: string;
        documentType: import(".prisma/client").$Enums.UserDocumentType;
        filename: string;
        mimeType: string;
        sizeBytes: number;
        storageKey: string;
        uploadedAt: Date;
        verifiedAt: Date | null;
        verifierId: string | null;
    }[]>;
    delete(docId: string, userId: string): Promise<{
        id: string;
        userId: string;
        documentType: import(".prisma/client").$Enums.UserDocumentType;
        filename: string;
        mimeType: string;
        sizeBytes: number;
        storageKey: string;
        uploadedAt: Date;
        verifiedAt: Date | null;
        verifierId: string | null;
    }>;
    listForVerification(userId: string): Promise<{
        url: string;
        id: string;
        userId: string;
        documentType: import(".prisma/client").$Enums.UserDocumentType;
        filename: string;
        mimeType: string;
        sizeBytes: number;
        storageKey: string;
        uploadedAt: Date;
        verifiedAt: Date | null;
        verifierId: string | null;
    }[]>;
}
export declare class UserDocumentsController {
    private readonly svc;
    constructor(svc: UserDocumentsService);
    upload(userId: string, docType: UserDocumentType, file: Express.Multer.File): Promise<{
        url: string;
        id: string;
        userId: string;
        documentType: import(".prisma/client").$Enums.UserDocumentType;
        filename: string;
        mimeType: string;
        sizeBytes: number;
        storageKey: string;
        uploadedAt: Date;
        verifiedAt: Date | null;
        verifierId: string | null;
    }>;
    list(userId: string): Promise<{
        url: string;
        id: string;
        userId: string;
        documentType: import(".prisma/client").$Enums.UserDocumentType;
        filename: string;
        mimeType: string;
        sizeBytes: number;
        storageKey: string;
        uploadedAt: Date;
        verifiedAt: Date | null;
        verifierId: string | null;
    }[]>;
    delete(id: string, userId: string): Promise<{
        id: string;
        userId: string;
        documentType: import(".prisma/client").$Enums.UserDocumentType;
        filename: string;
        mimeType: string;
        sizeBytes: number;
        storageKey: string;
        uploadedAt: Date;
        verifiedAt: Date | null;
        verifierId: string | null;
    }>;
    listForModerator(userId: string): Promise<{
        url: string;
        id: string;
        userId: string;
        documentType: import(".prisma/client").$Enums.UserDocumentType;
        filename: string;
        mimeType: string;
        sizeBytes: number;
        storageKey: string;
        uploadedAt: Date;
        verifiedAt: Date | null;
        verifierId: string | null;
    }[]>;
}
export declare class UserDocumentsModule {
}
