import { PrismaService } from '../../prisma/prisma.service';
export declare class HealthController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    liveness(): {
        status: string;
        ts: string;
    };
    readiness(): Promise<{
        status: string;
        db: string;
        ts: string;
    }>;
}
export declare class HealthModule {
}
