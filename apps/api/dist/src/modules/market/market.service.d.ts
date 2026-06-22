import { PrismaService } from '../../prisma/prisma.service';
export declare class MarketService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getStats(): unknown;
    getByRole(): unknown;
    getAllApproved(rawPage?: string, rawLimit?: string): unknown;
}
