import { ListingsService } from './listings.service';
import { CreateListingDto, RejectListingDto } from './dto/listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
export declare class ListingsController {
    private readonly svc;
    constructor(svc: ListingsService);
    create(dto: CreateListingDto, userId: string): unknown;
    findAll(search?: string, role?: string, market?: string, mode?: string, paid?: string, cert?: string, page?: string, limit?: string): unknown;
    getPending(page?: string, limit?: string): unknown;
    findOne(id: string): unknown;
    getSimilar(id: string, role: string): unknown;
    update(id: string, userId: string, dto: UpdateListingDto): unknown;
    approve(id: string, modId: string): unknown;
    reject(id: string, modId: string, dto: RejectListingDto): unknown;
}
