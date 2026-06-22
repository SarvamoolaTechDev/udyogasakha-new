import { MarketService } from './market.service';
export declare class MarketController {
    private readonly svc;
    constructor(svc: MarketService);
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
    getAllApproved(page?: string, limit?: string): Promise<import("../../common/pagination").Paginated<{
        id: string;
        user: {
            email: string;
        };
        workMode: import(".prisma/client").$Enums.WorkMode;
        employmentOption: import(".prisma/client").$Enums.EmpOption;
        marketField: import(".prisma/client").$Enums.MarketField;
        roleType: import(".prisma/client").$Enums.RoleType;
        fullName: string;
        appliedFor: string;
        appliedAt: string;
        certificate: import(".prisma/client").$Enums.CertOpt;
        marketSegment: import(".prisma/client").$Enums.MarketSegment;
        submittedAt: Date;
    }>>;
}
export declare class MarketModule {
}
