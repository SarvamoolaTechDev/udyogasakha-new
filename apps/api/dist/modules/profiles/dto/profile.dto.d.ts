import { RoleType, PaymentType, WorkMode, CertOpt, EmpOption, MarketSegment } from '@prisma/client';
export declare class UpsertProfileDto {
    roleType: RoleType;
    fullName: string;
    dateOfBirth?: string;
    gender?: string;
    phone?: string;
    email?: string;
    city?: string;
    /** Comma-separated string or array — normalised in service */
    skills?: string | string[];
    summary?: string;
    highestDegree?: string;
    specialization?: string;
    institution?: string;
    yearOfPassing?: number;
    grade?: string;
    roleFields?: Record<string, string>;
    appliedFor: string;
    appliedAt: string;
    payment: PaymentType;
    certificate: CertOpt;
    workMode: WorkMode;
    employmentOption: EmpOption;
    marketSegment: MarketSegment;
    preferredLocation?: string;
}
export declare class AddExperienceDto {
    title: string;
    company: string;
    fromDate?: string;
    toDate?: string;
    description?: string;
    displayOrder?: number;
}
export declare class ApproveProfileDto {
}
export declare class RejectProfileDto {
    reason: string;
}
