import { PrismaService } from '../../prisma/prisma.service';
import { IStorageService } from '../../common/storage/storage.interface';
import { DocumentType } from '@prisma/client';
export declare class DocumentsService {
    private readonly prisma;
    private readonly storage;
    constructor(prisma: PrismaService, storage: IStorageService);
    upload(profileId: string, documentType: DocumentType, file: Express.Multer.File): unknown;
    getForProfile(profileId: string): unknown;
    deleteDoc(docId: string, userId: string): unknown;
}
export declare class DocumentsController {
    private readonly svc;
    constructor(svc: DocumentsService);
    upload(profileId: string, docType: DocumentType, file: Express.Multer.File): unknown;
    getForProfile(profileId: string): unknown;
    deleteDoc(docId: string, userId: string): unknown;
}
export declare class DocumentsModule {
}
