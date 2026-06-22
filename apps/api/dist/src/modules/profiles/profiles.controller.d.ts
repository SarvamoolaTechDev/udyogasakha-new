import { ProfilesService } from './profiles.service';
import { UpsertProfileDto, AddExperienceDto, RejectProfileDto } from './dto/profile.dto';
export declare class ProfilesController {
    private readonly svc;
    constructor(svc: ProfilesService);
    upsert(userId: string, dto: UpsertProfileDto): unknown;
    getMine(userId: string): unknown;
    getMineByRole(userId: string, rt: string): unknown;
    addExp(userId: string, rt: string, dto: AddExperienceDto): unknown;
    delExp(userId: string, id: string): unknown;
    getPending(page?: string, limit?: string): unknown;
    getApproved(page?: string, limit?: string): unknown;
    getRejected(page?: string, limit?: string): unknown;
    approve(id: string, modId: string): unknown;
    reject(id: string, modId: string, dto: RejectProfileDto): unknown;
    reactivate(id: string): unknown;
}
