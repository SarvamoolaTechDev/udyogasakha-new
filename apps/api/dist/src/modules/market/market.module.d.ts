import { MarketService } from './market.service';
export declare class MarketController {
    private readonly svc;
    constructor(svc: MarketService);
    getStats(): unknown;
    getByRole(): unknown;
    getAllApproved(page?: string, limit?: string): unknown;
}
export declare class MarketModule {
}
