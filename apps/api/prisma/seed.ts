import {
  PrismaClient, ListingType, Industry, PaymentType,
  WorkMode, CertOpt, EmpOption, ExperienceLevel, Duration,
  MarketField, ProfileStatus, RoleType, MarketSegment, AdminRole,
} from '@prisma/client';
import { UserRole } from '../src/common/user-role.enum';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Udyoga Sakha…');

  const adminHash = await bcrypt.hash('Admin@1234', 12);
  const userHash  = await bcrypt.hash('Test@1234',  12);

  // ── Admin portal user (admin_users table — separate from main platform) ───
  await prisma.adminUser.upsert({
    where:  { email: 'admin@sarvamoola.in' },
    update: {},
    create: {
      email:        'admin@sarvamoola.in',
      name:         'Platform Admin',
      passwordHash: adminHash,
      role:         AdminRole.ADMIN,
    },
  });

  // ── Main platform users (users table) ────────────────────────────────────
  const admin = await prisma.user.upsert({
    where:  { email: 'admin@sarvamoola.in' },
    update: {},
    create: {
      email: 'admin@sarvamoola.in',
      name:  'Platform Admin',
      phone: '+919000000001',
      passwordHash: adminHash,
      roles: [UserRole.ADMIN, UserRole.MODERATOR] as any,
      city:  'Bengaluru',
    },
  });

  const mod = await prisma.user.upsert({
    where:  { email: 'moderator@sarvamoola.in' },
    update: {},
    create: {
      email: 'moderator@sarvamoola.in',
      name:  'Moderator One',
      phone: '+919000000002',
      passwordHash: adminHash,
      roles: [UserRole.MODERATOR] as any,
      city:  'Chennai',
    },
  });

  await prisma.user.upsert({
    where:  { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name:  'Demo User',
      phone: '+919000000003',
      passwordHash: userHash,
      roles: [UserRole.PARTICIPANT] as any,
      city:  'Bengaluru',
    },
  });

  // Create wallets for platform users
  for (const userId of [admin.id, mod.id]) {
    await prisma.wallet.upsert({
      where:  { userId },
      update: {},
      create: { userId, balance: 0 },
    });
  }

  // ── Job Listings ──────────────────────────────────────────────────────────
  const listings = [
    {
      organisationName: 'TCS Digital',
      title:            'Senior Software Engineer',
      listingType:      ListingType.JOB_OPENING,
      targetRoleType:   RoleType.JOB_SEEKER,
      industry:         Industry.IT_SOFTWARE,
      location:         'Bengaluru, Karnataka',
      payment:          PaymentType.PAID,
      salary:           '₹18–28 LPA',
      workMode:         WorkMode.HYBRID,
      certificateProvided: CertOpt.NO,
      employmentOption:    EmpOption.EXISTS,
      experienceRequired:  ExperienceLevel.EXP_5_8,
      duration:         Duration.PERMANENT,
      marketField:      MarketField.IT_FIELD,
      skills:           ['React', 'Node.js', 'AWS', 'SQL'] as any,
      facilities:       ['Health Insurance', 'PF', 'Flexible Hours'] as any,
      responsibilities: ['Architect cloud applications', 'Mentor junior developers'] as any,
      requirements:     ['B.Tech CS or equivalent', '5–8 years experience'] as any,
      description:      'Join TCS Digital to build cloud solutions for Fortune 500 clients.',
      experienceDetail: '5–8 years hands-on production experience required.',
      icon:   '💻',
      status: ProfileStatus.APPROVED,
    },
    {
      organisationName: 'Apollo Hospitals',
      title:            'Paediatric Cardiologist',
      listingType:      ListingType.JOB_OPENING,
      targetRoleType:   RoleType.JOB_SEEKER,
      industry:         Industry.HEALTHCARE,
      location:         'Chennai, Tamil Nadu',
      payment:          PaymentType.PAID,
      salary:           '₹30–50 LPA',
      workMode:         WorkMode.ON_SITE,
      certificateProvided: CertOpt.NO,
      employmentOption:    EmpOption.NOT_EXISTS,
      experienceRequired:  ExperienceLevel.EXP_8_PLUS,
      duration:         Duration.PERMANENT,
      marketField:      MarketField.NON_IT_FIELD,
      skills:           ['Paediatric Cardiology', 'ECHO', 'Cath Lab'] as any,
      facilities:       ['Accommodation', 'Medical Benefits'] as any,
      responsibilities: ['Lead Paediatric Cardiac team', 'Perform Cath Lab procedures'] as any,
      requirements:     ['MBBS + DM Paediatric Cardiology', '8+ years post-DM'] as any,
      description:      'Apollo Hospitals Chennai seeks an experienced Paediatric Cardiologist.',
      experienceDetail: '8–12 years post-DM with complex congenital heart disease expertise.',
      icon:   '🏥',
      status: ProfileStatus.APPROVED,
    },
    {
      organisationName: 'EdTech India',
      title:            'Data Science Intern',
      listingType:      ListingType.INTERNSHIP,
      targetRoleType:   RoleType.INTERN,
      industry:         Industry.IT_SOFTWARE,
      location:         'Bengaluru, Karnataka',
      payment:          PaymentType.STIPEND,
      salary:           '₹15,000/Month',
      workMode:         WorkMode.HYBRID,
      certificateProvided: CertOpt.YES,
      employmentOption:    EmpOption.EXISTS,
      experienceRequired:  ExperienceLevel.FRESHER_0_1,
      duration:         Duration.MEDIUM_TERM,
      marketField:      MarketField.IT_FIELD,
      skills:           ['Python', 'Pandas', 'Scikit-Learn', 'SQL'] as any,
      facilities:       ['Mentorship', 'Certificate', 'PPO'] as any,
      responsibilities: ['Work on data science projects', 'Build ML models'] as any,
      requirements:     ['Final year B.Tech CS/IT or MCA', 'Python proficiency'] as any,
      description:      '6-month Data Science Internship with certificate and PPO for excellent performers.',
      experienceDetail: 'No prior work experience required. One data science project expected.',
      icon:   '🎓',
      status: ProfileStatus.APPROVED,
    },
  ];

  for (const l of listings) {
    await prisma.jobListing.create({
      data: { ...l, postedById: admin.id, reviewedById: admin.id, reviewedAt: new Date() },
    });
  }
  console.log(`  Seeded ${listings.length} listings.`);

  // ── Sample candidate profiles ─────────────────────────────────────────────
  const profiles = [
    { name: 'Arjun Nair',      email: 'arjun@example.com',   phone: '+919100000001', city: 'Bengaluru', role: RoleType.JOB_SEEKER,  skills: ['React', 'Node.js', 'AWS'],  appliedFor: 'Senior Software Engineer', appliedAt: 'TCS Digital',      payment: PaymentType.PAID,    cert: CertOpt.NO,  mode: WorkMode.HYBRID,   seg: MarketSegment.IT_DEVELOPERS,        status: ProfileStatus.PENDING  },
    { name: 'Priya Iyer',      email: 'priya@example.com',   phone: '+919100000002', city: 'Chennai',   role: RoleType.INTERN,       skills: ['Python', 'ML', 'Pandas'],   appliedFor: 'Data Science Intern',      appliedAt: 'Infosys',          payment: PaymentType.STIPEND, cert: CertOpt.YES, mode: WorkMode.WFH,      seg: MarketSegment.IT_DATA_AI,           status: ProfileStatus.PENDING  },
    { name: 'Kiran Reddy',     email: 'kiran@example.com',   phone: '+919100000003', city: 'Hyderabad', role: RoleType.CONSULTANT,   skills: ['Healthcare IT', 'EHR'],     appliedFor: 'Healthcare IT Consultant', appliedAt: 'Apollo Hospitals', payment: PaymentType.PAID,    cert: CertOpt.NO,  mode: WorkMode.ON_SITE,  seg: MarketSegment.SERVICES_CONSULTANCY, status: ProfileStatus.APPROVED },
    { name: 'Ananya Krishnan', email: 'ananya@example.com',  phone: '+919100000004', city: 'Bengaluru', role: RoleType.TRAINER,      skills: ['Communication', 'L&D'],     appliedFor: 'Soft Skills Trainer',      appliedAt: 'Various Clients',  payment: PaymentType.PAID,    cert: CertOpt.YES, mode: WorkMode.ON_SITE, seg: MarketSegment.SERVICES_TRAINING,    status: ProfileStatus.APPROVED },
  ];

  for (const p of profiles) {
    const u = await prisma.user.upsert({
      where:  { email: p.email },
      update: {},
      create: {
        email: p.email, name: p.name, phone: p.phone, city: p.city,
        passwordHash: userHash,
        roles: [UserRole.PARTICIPANT] as any,
      },
    });

    await prisma.wallet.upsert({
      where:  { userId: u.id },
      update: {},
      create: { userId: u.id, balance: 0 },
    });

    const mf = p.seg.startsWith('IT') ? MarketField.IT_FIELD
             : p.seg.startsWith('SERVICES') ? MarketField.SERVICES
             : MarketField.NON_IT_FIELD;

    await prisma.candidateProfile.upsert({
      where:  { userId_roleType: { userId: u.id, roleType: p.role } },
      update: { status: p.status },
      create: {
        userId: u.id, roleType: p.role, fullName: p.name, email: p.email, city: p.city,
        skills: p.skills as any,
        summary: `Experienced ${p.role.replace(/_/g, ' ')}`,
        appliedFor: p.appliedFor, appliedAt: p.appliedAt,
        payment: p.payment, certificate: p.cert, workMode: p.mode,
        employmentOption: EmpOption.EXISTS, marketSegment: p.seg, status: p.status,
        ...(p.status !== ProfileStatus.PENDING
          ? { marketField: mf, reviewedById: mod.id, reviewedAt: new Date() }
          : {}),
      },
    });
  }

  console.log('  Sample profiles and wallets seeded.');
  console.log('\n✦ Seed complete!');
  console.log('  Admin portal:   admin@sarvamoola.in  / Admin@1234');
  console.log('  Platform admin: admin@sarvamoola.in  / Admin@1234  (same creds)');
  console.log('  Demo user:      demo@example.com     / Test@1234');
}

main().catch(console.error).finally(() => prisma.$disconnect());