import { PrismaService } from '../../prisma/prisma.service';
import { IStorageService } from '../../common/storage/storage.interface';
import { UserDocumentType } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
export declare class UserDocumentsService {
    private readonly prisma;
    private readonly audit;
    private readonly storage;
    constructor(prisma: PrismaService, audit: AuditService, storage: IStorageService);
    upload(userId: string, documentType: UserDocumentType, file: Express.Multer.File): unknown;
    listForUser(userId: string): unknown;
    delete(docId: string, userId: string): unknown;
    listForVerification(userId: string): unknown;
}
export declare class UserDocumentsController {
    private readonly svc;
    constructor(svc: UserDocumentsService);
    upload(userId: string, docType: UserDocumentType, file: Express.Multer.File): unknown;
    list(userId: string): unknown;
    delete(id: string, userId: string): unknown;
    listForModerator(userId: string): unknown;
}
export declare class UserDocumentsModule {
}
