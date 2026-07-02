/**
 * apps/api/prisma/backfill-search.ts
 *
 * One-time script to populate Meilisearch with all currently-approved
 * listings and profiles. Run this:
 *   1. Whenever you first deploy Meilisearch
 *   2. If Meilisearch index is wiped for any reason (container restart
 *      without a persistent volume, migration reset, etc.)
 *   3. After any bulk data import
 *
 * Usage (from apps/api):
 *   npx ts-node prisma/backfill-search.ts
 *
 * Environment variables required:
 *   DATABASE_URL         — same as used by the API
 *   MEILISEARCH_URL      — e.g. http://localhost:7700
 *   MEILISEARCH_MASTER_KEY — your Meilisearch master key (omit for keyless dev)
 */

import { PrismaClient } from '@prisma/client';
import { MeiliSearch } from 'meilisearch';

const LISTINGS_INDEX = 'listings';
const PROFILES_INDEX = 'profiles';

async function main() {
  const prisma = new PrismaClient();
  const client = new MeiliSearch({
    host:   process.env.MEILISEARCH_URL         ?? 'http://localhost:7700',
    apiKey: process.env.MEILISEARCH_MASTER_KEY  ?? undefined,
  });

  // Verify Meilisearch is reachable before doing any DB work
  await client.health();
  console.log('Meilisearch reachable — starting backfill...');

  // ── Listings ──────────────────────────────────────────────────────────────
  const listings = await prisma.jobListing.findMany({
    where: { status: 'APPROVED' },
  });

  if (listings.length > 0) {
    const listingDocs = listings.map(l => ({
      id:                  l.id,
      title:               l.title,
      organisationName:    l.organisationName,
      description:         l.description,
      location:            l.location,
      skills:              l.skills,
      targetRoleType:      l.targetRoleType,
      marketField:         l.marketField,
      workMode:            l.workMode,
      payment:             l.payment,
      certificateProvided: l.certificateProvided,
      industry:            l.industry,
      featured:            l.featured,
      postedAt:            Math.floor(l.postedAt.getTime() / 1000),
    }));

    const listingsIdx = client.index(LISTINGS_INDEX);
    const task = await listingsIdx.addDocuments(listingDocs, { primaryKey: 'id' });
    console.log(`Queued ${listings.length} listings — Meilisearch task id: ${task.taskUid}`);
  } else {
    console.log('No approved listings found.');
  }

  // ── Profiles ──────────────────────────────────────────────────────────────
  const profiles = await prisma.candidateProfile.findMany({
    where: { status: 'APPROVED' },
  });

  if (profiles.length > 0) {
    const profileDocs = profiles.map(p => ({
      id:            p.id,
      fullName:      p.fullName,
      skills:        p.skills,
      city:          p.city          ?? '',
      summary:       p.summary       ?? '',
      roleType:      p.roleType,
      marketField:   p.marketField   ?? '',
      marketSegment: p.marketSegment,
      workMode:      p.workMode,
      institution:   p.institution   ?? '',
    }));

    const profilesIdx = client.index(PROFILES_INDEX);
    const task = await profilesIdx.addDocuments(profileDocs, { primaryKey: 'id' });
    console.log(`Queued ${profiles.length} profiles — Meilisearch task id: ${task.taskUid}`);
  } else {
    console.log('No approved profiles found.');
  }

  await prisma.$disconnect();
  console.log('Backfill complete. Meilisearch will process the queued tasks asynchronously.');
}

main().catch(err => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
