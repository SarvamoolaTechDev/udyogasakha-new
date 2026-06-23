import { PrismaService } from '../../prisma/prisma.service';
export declare class MarketService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getStats(): Promise<{
        profilesByMarket: {
            IT_FIELD: number;
            NON_IT_FIELD: number;
            SERVICES: number;
        };
        listingsByMarket: {
            IT_FIELD: number;
            NON_IT_FIELD: number;
            SERVICES: number;
        };
        total: {
            pending: number;
            approved: number;
            rejected: number;
        };
    }>;
    getByRole(): Promise<{
        role: string;
        count: number;
    }[]>;
    getAllApproved(rawPage?: string, rawLimit?: string): Promise<import("../../common/pagination").Paginated<{
        user: {
            email: string;
        };
        id: string;
        fullName: string;
        roleType: import(".prisma/client").$Enums.RoleType;
        appliedFor: string;
        appliedAt: string;
        certificate: import(".prisma/client").$Enums.CertOpt;
        workMode: import(".prisma/client").$Enums.WorkMode;
        employmentOption: import(".prisma/client").$Enums.EmpOption;
        marketSegment: import(".prisma/client").$Enums.MarketSegment;
        marketField: import(".prisma/client").$Enums.MarketField;
        submittedAt: Date;
    }>>;
}
