import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { MeiliSearch, Index } from 'meilisearch';
import { AppConfigService } from '../../config/app-config.service';

// ── Index names ───────────────────────────────────────────────────────────────
export const LISTINGS_INDEX  = 'listings';
export const PROFILES_INDEX  = 'profiles';

// ── Document shapes stored in Meilisearch ────────────────────────────────────
// We only store the fields actually needed for search + filtering.
// Full listing/profile details are still fetched from Postgres by id.
export interface ListingDocument {
  id:                 string;
  title:              string;
  organisationName:   string;
  description:        string;
  location:           string;
  skills:             string[];
  targetRoleType:     string;
  marketField:        string;
  workMode:           string;
  payment:            string;
  certificateProvided:string;
  industry:           string;
  featured:           boolean;
  postedAt:           number; // unix timestamp for sortable date
}

export interface ProfileDocument {
  id:           string;
  fullName:     string;
  skills:       string[];
  city:         string;
  summary:      string;
  roleType:     string;
  marketField:  string;
  marketSegment:string;
  workMode:     string;
  institution:  string;
}

/**
 * SearchService wraps the Meilisearch client.
 *
 * If MEILISEARCH_URL is not set or Meilisearch is unreachable, every method
 * logs a warning and returns gracefully — the calling service falls back to
 * Postgres automatically. This means search is optional infrastructure:
 * the app works without it, just with less sophisticated search.
 *
 * Index configuration (searchable fields, filterable attributes, sort
 * fields) is set once on module init and is idempotent — safe to call
 * on every startup.
 */
@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private client:        MeiliSearch | null = null;
  private listingsIdx:   Index<ListingDocument> | null = null;
  private profilesIdx:   Index<ProfileDocument> | null = null;

  constructor(private readonly config: AppConfigService) {}

  async onModuleInit() {
    try {
      this.client = new MeiliSearch({
        host:   this.config.meilisearchUrl,
        apiKey: this.config.meilisearchMasterKey || undefined,
      });

      // Verify connectivity
      await this.client.health();

      this.listingsIdx = this.client.index<ListingDocument>(LISTINGS_INDEX);
      this.profilesIdx = this.client.index<ProfileDocument>(PROFILES_INDEX);

      await this.configureIndexes();
      this.logger.log(`Meilisearch connected at ${this.config.meilisearchUrl}`);
    } catch (err) {
      this.logger.warn(
        `Meilisearch is not reachable at ${this.config.meilisearchUrl}. ` +
        `Search will fall back to Postgres ILIKE queries. ` +
        `Start Meilisearch (docker run -p 7700:7700 getmeili/meilisearch) or set MEILISEARCH_URL.`,
      );
      this.client = null;
    }
  }

  /** Returns true when Meilisearch is available — callers use this to decide whether to fall back */
  get isAvailable(): boolean { return this.client !== null; }

  // ── Index configuration ───────────────────────────────────────────────────

  private async configureIndexes() {
    if (!this.listingsIdx || !this.profilesIdx) return;

    // LISTINGS — searchable on text fields, filterable on all enum/category fields
    await this.listingsIdx.updateSettings({
      searchableAttributes: [
        'title',             // highest relevance weight (first in array)
        'organisationName',
        'skills',
        'description',
        'location',
      ],
      filterableAttributes: [
        'targetRoleType',
        'marketField',
        'workMode',
        'payment',
        'certificateProvided',
        'industry',
        'featured',
      ],
      sortableAttributes: ['postedAt', 'featured'],
      // Featured listings always rank higher regardless of text relevance
      rankingRules: [
        'sort',
        'words',
        'typo',
        'proximity',
        'attribute',
        'exactness',
      ],
      typoTolerance: {
        enabled: true,
        minWordSizeForTypos: { oneTypo: 5, twoTypos: 9 },
      },
    });

    // PROFILES — searchable on skills/summary/city, filterable on role/market
    await this.profilesIdx.updateSettings({
      searchableAttributes: [
        'skills',
        'fullName',
        'summary',
        'city',
        'institution',
      ],
      filterableAttributes: [
        'roleType',
        'marketField',
        'marketSegment',
        'workMode',
      ],
      sortableAttributes: [],
      typoTolerance: { enabled: true },
    });
  }

  // ── Listings ──────────────────────────────────────────────────────────────

  /**
   * Adds or updates a listing document in the search index.
   * Called from ListingsService.approve() — runs after the Postgres update
   * so the index is always a subset of what's in the DB, never ahead of it.
   */
  async indexListing(listing: {
    id: string; title: string; organisationName: string; description: string;
    location: string; skills: string[]; targetRoleType: string; marketField: string;
    workMode: string; payment: string; certificateProvided: string; industry: string;
    featured: boolean; postedAt: Date;
  }): Promise<void> {
    if (!this.listingsIdx) return;
    try {
      await this.listingsIdx.addDocuments([{
        id:                  listing.id,
        title:               listing.title,
        organisationName:    listing.organisationName,
        description:         listing.description,
        location:            listing.location,
        skills:              listing.skills,
        targetRoleType:      listing.targetRoleType,
        marketField:         listing.marketField,
        workMode:            listing.workMode,
        payment:             listing.payment,
        certificateProvided: listing.certificateProvided,
        industry:            listing.industry,
        featured:            listing.featured,
        postedAt:            Math.floor(listing.postedAt.getTime() / 1000),
      }]);
    } catch (err) {
      this.logger.warn(`Failed to index listing ${listing.id}: ${(err as Error).message}`);
    }
  }

  /**
   * Removes a listing from the search index.
   * Called from ListingsService.reject() — rejected listings should not
   * appear in search results.
   */
  async removeListing(id: string): Promise<void> {
    if (!this.listingsIdx) return;
    try { await this.listingsIdx.deleteDocument(id); }
    catch (err) { this.logger.warn(`Failed to remove listing ${id} from index: ${(err as Error).message}`); }
  }

  /**
   * Main search entry point for the listings browse API.
   * Returns matching document IDs in ranked order.
   * The controller fetches full records from Postgres by these IDs,
   * preserving Meilisearch's relevance ordering.
   */
  async searchListings(params: {
    query?:              string;
    targetRoleType?:     string;
    marketField?:        string;
    workMode?:           string;
    payment?:            string;
    certificateProvided?:string;
    page:                number;
    limit:               number;
  }): Promise<{ ids: string[]; totalHits: number }> {
    if (!this.listingsIdx) throw new Error('Meilisearch unavailable');

    const filters: string[] = [];
    if (params.targetRoleType)      filters.push(`targetRoleType = "${params.targetRoleType}"`);
    if (params.marketField)          filters.push(`marketField = "${params.marketField}"`);
    if (params.workMode)             filters.push(`workMode = "${params.workMode}"`);
    if (params.payment)              filters.push(`payment = "${params.payment}"`);
    if (params.certificateProvided)  filters.push(`certificateProvided = "${params.certificateProvided}"`);

    const result = await this.listingsIdx.search(params.query ?? '', {
      filter: filters.length ? filters.join(' AND ') : undefined,
      sort:   ['featured:desc', 'postedAt:desc'], // featured listings always come first
      limit:  params.limit,
      offset: (params.page - 1) * params.limit,
    });

    return {
      ids:       result.hits.map(h => h.id),
      totalHits: result.estimatedTotalHits ?? result.hits.length,
    };
  }

  // ── Profiles ──────────────────────────────────────────────────────────────

  async indexProfile(profile: {
    id: string; fullName: string; skills: string[]; city: string;
    summary: string; roleType: string; marketField: string;
    marketSegment: string; workMode: string; institution: string;
  }): Promise<void> {
    if (!this.profilesIdx) return;
    try {
      await this.profilesIdx.addDocuments([{
        id:            profile.id,
        fullName:      profile.fullName,
        skills:        profile.skills,
        city:          profile.city           ?? '',
        summary:       profile.summary        ?? '',
        roleType:      profile.roleType,
        marketField:   profile.marketField    ?? '',
        marketSegment: profile.marketSegment,
        workMode:      profile.workMode,
        institution:   profile.institution    ?? '',
      }]);
    } catch (err) {
      this.logger.warn(`Failed to index profile ${profile.id}: ${(err as Error).message}`);
    }
  }

  async removeProfile(id: string): Promise<void> {
    if (!this.profilesIdx) return;
    try { await this.profilesIdx.deleteDocument(id); }
    catch (err) { this.logger.warn(`Failed to remove profile ${id} from index: ${(err as Error).message}`); }
  }

  async searchProfiles(params: {
    query?:         string;
    roleType?:      string;
    marketField?:   string;
    marketSegment?: string;
    workMode?:      string;
    page:           number;
    limit:          number;
  }): Promise<{ ids: string[]; totalHits: number }> {
    if (!this.profilesIdx) throw new Error('Meilisearch unavailable');

    const filters: string[] = [];
    if (params.roleType)      filters.push(`roleType = "${params.roleType}"`);
    if (params.marketField)   filters.push(`marketField = "${params.marketField}"`);
    if (params.marketSegment) filters.push(`marketSegment = "${params.marketSegment}"`);
    if (params.workMode)      filters.push(`workMode = "${params.workMode}"`);

    const result = await this.profilesIdx.search(params.query ?? '', {
      filter: filters.length ? filters.join(' AND ') : undefined,
      limit:  params.limit,
      offset: (params.page - 1) * params.limit,
    });

    return {
      ids:       result.hits.map(h => h.id),
      totalHits: result.estimatedTotalHits ?? result.hits.length,
    };
  }

  // ── Backfill ──────────────────────────────────────────────────────────────

  /**
   * Indexes all currently-approved listings and profiles.
   * Called by the backfill script (prisma/backfill-search.ts) — not called
   * at application startup so it doesn't block the server from booting.
   */
  async backfillListings(listings: Parameters<typeof this.indexListing>[0][]): Promise<void> {
    if (!this.listingsIdx) { this.logger.warn('Meilisearch unavailable — skipping listing backfill'); return; }
    const docs: ListingDocument[] = listings.map(l => ({
      id: l.id, title: l.title, organisationName: l.organisationName,
      description: l.description, location: l.location, skills: l.skills,
      targetRoleType: l.targetRoleType, marketField: l.marketField,
      workMode: l.workMode, payment: l.payment,
      certificateProvided: l.certificateProvided, industry: l.industry,
      featured: l.featured, postedAt: Math.floor(l.postedAt.getTime() / 1000),
    }));
    await this.listingsIdx.addDocuments(docs, { primaryKey: 'id' });
    this.logger.log(`Backfilled ${docs.length} listings into Meilisearch`);
  }

  async backfillProfiles(profiles: Parameters<typeof this.indexProfile>[0][]): Promise<void> {
    if (!this.profilesIdx) { this.logger.warn('Meilisearch unavailable — skipping profile backfill'); return; }
    const docs: ProfileDocument[] = profiles.map(p => ({
      id: p.id, fullName: p.fullName, skills: p.skills,
      city: p.city ?? '', summary: p.summary ?? '',
      roleType: p.roleType, marketField: p.marketField ?? '',
      marketSegment: p.marketSegment, workMode: p.workMode,
      institution: p.institution ?? '',
    }));
    await this.profilesIdx.addDocuments(docs, { primaryKey: 'id' });
    this.logger.log(`Backfilled ${docs.length} profiles into Meilisearch`);
  }
}
