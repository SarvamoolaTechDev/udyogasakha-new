import { ListingType, RoleType, Industry, PaymentType, WorkMode, CertOpt, EmpOption, ExperienceLevel, Duration, MarketField } from '@prisma/client';
export declare class CreateListingDto {
    organisationName: string;
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    listingType: ListingType;
    targetRoleType: RoleType;
    title: string;
    industry: Industry;
    location: string;
    payment: PaymentType;
    salary?: string;
    workMode: WorkMode;
    certificateProvided: CertOpt;
    employmentOption: EmpOption;
    experienceRequired: ExperienceLevel;
    duration: Duration;
    /**
     * Accept either a comma-separated string (from HTML form) or an array (from API).
     * The service normalises this before writing to the DB.
     */
    skills?: string | string[];
    facilities?: string | string[];
    description: string;
    experienceDetail?: string;
    responsibilities?: string[];
    requirements?: string[];
    marketField: MarketField;
    icon?: string;
}
export declare class RejectListingDto {
    reason: string;
}
