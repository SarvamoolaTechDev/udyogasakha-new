import {
  PrismaClient, UserRole, ListingType, Industry, PaymentType,
  WorkMode, CertOpt, EmpOption, ExperienceLevel, Duration,
  MarketField, ProfileStatus, RoleType, MarketSegment,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Udyoga Sakha…');

  const adminHash = await bcrypt.hash('Admin@1234', 12);
  const userHash  = await bcrypt.hash('Test@1234',  12);

  // ── Admin & Moderator accounts ────────────────────────────────────────────
  // Email updated to match the live admin email (admin@sarvamoola.in)
  // roles cast to 'any' — schema uses Json type for MySQL compatibility
  const admin = await prisma.user.upsert({
    where:  { email: 'admin@sarvamoola.in' },
    update: {},
    create: {
      email: 'admin@sarvamoola.in',
      name: 'Platform Admin',
      phone: '+919000000001',
      passwordHash: adminHash,
      roles: [UserRole.ADMIN, UserRole.MODERATOR] as any,
      city: 'Bengaluru',
    },
  });

  const mod = await prisma.user.upsert({
    where:  { email: 'moderator@sarvamoola.in' },
    update: {},
    create: {
      email: 'moderator@sarvamoola.in',
      name: 'Moderator One',
      phone: '+919000000002',
      passwordHash: adminHash,
      roles: [UserRole.MODERATOR] as any,
      city: 'Chennai',
    },
  });

  await prisma.user.upsert({
    where:  { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      phone: '+919000000003',
      passwordHash: userHash,
      roles: [UserRole.PARTICIPANT] as any,
      city: 'Bengaluru',
    },
  });

  // Create wallets for admin and mod (normally done on registration)
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
      organisationName: 'TCS Digital', title: 'Senior Software Engineer',
      listingType: ListingType.JOB_OPENING, targetRoleType: RoleType.JOB_SEEKER,
      industry: Industry.IT_SOFTWARE, location: 'Bengaluru, Karnataka',
      payment: PaymentType.PAID, salary: '₹18–28 LPA',
      workMode: WorkMode.HYBRID, certificateProvided: CertOpt.NO,
      employmentOption: EmpOption.EXISTS, experienceRequired: ExperienceLevel.EXP_5_8,
      duration: Duration.PERMANENT, marketField: MarketField.IT_FIELD,
      skills: ['React', 'Node.js', 'AWS', 'SQL', 'Microservices'] as any,
      facilities: ['Health Insurance', 'PF', 'Flexible Hours', 'Laptop'] as any,
      responsibilities: ['Architect scalable cloud-native applications', 'Lead code reviews', 'Mentor junior developers'] as any,
      requirements: ['B.Tech in CS or equivalent', '5–8 years software development'] as any,
      description: 'Join TCS Digital to build cloud solutions for Fortune 500 clients. You will architect scalable distributed systems and mentor junior engineers.',
      experienceDetail: '5–8 years hands-on experience building production-grade web applications.',
      icon: '💻', status: ProfileStatus.APPROVED,
    },
    {
      organisationName: 'Apollo Hospitals', title: 'Paediatric Cardiologist',
      listingType: ListingType.JOB_OPENING, targetRoleType: RoleType.JOB_SEEKER,
      industry: Industry.HEALTHCARE, location: 'Chennai, Tamil Nadu',
      payment: PaymentType.PAID, salary: '₹30–50 LPA',
      workMode: WorkMode.ON_SITE, certificateProvided: CertOpt.NO,
      employmentOption: EmpOption.NOT_EXISTS, experienceRequired: ExperienceLevel.EXP_8_PLUS,
      duration: Duration.PERMANENT, marketField: MarketField.NON_IT_FIELD,
      skills: ['Paediatric Cardiology', 'ECHO', 'Cath Lab', 'PICU'] as any,
      facilities: ['Accommodation', 'Medical Benefits', 'Research Grant'] as any,
      responsibilities: ['Lead the Paediatric Cardiac team', 'Perform Cath Lab procedures'] as any,
      requirements: ['MBBS + MD/DM Paediatric Cardiology', '8–12 years post-DM'] as any,
      description: 'Apollo Hospitals Chennai seeks an experienced Paediatric Cardiologist to lead the cardiac care unit.',
      experienceDetail: '8–12 years post-MD/DM experience with expertise in complex congenital heart disease.',
      icon: '🏥', status: ProfileStatus.APPROVED,
    },
    {
      organisationName: 'Govt of Karnataka', title: 'Junior Engineer (Civil)',
      listingType: ListingType.JOB_OPENING, targetRoleType: RoleType.FRESHER,
      industry: Industry.GOVERNMENT_PSU, location: 'Karnataka — Multiple Districts',
      payment: PaymentType.PAID, salary: '₹5–8 LPA',
      workMode: WorkMode.ON_SITE, certificateProvided: CertOpt.NO,
      employmentOption: EmpOption.EXISTS, experienceRequired: ExperienceLevel.FRESHER_0_1,
      duration: Duration.PERMANENT, marketField: MarketField.NON_IT_FIELD,
      skills: ['Civil Engineering', 'AutoCAD', 'Surveying'] as any,
      facilities: ['Pension', 'PF', 'Gratuity', 'Job Security'] as any,
      responsibilities: ['Assist Senior Engineers in site supervision', 'Prepare quantity estimates'] as any,
      requirements: ['B.Tech Civil Engineering', 'CGPA 6.0 or above', 'Karnataka domicile'] as any,
      description: 'PWD Karnataka invites applications for Junior Engineer (Civil) posts across multiple districts.',
      experienceDetail: 'No prior experience required. Final-year internship in infrastructure preferred.',
      icon: '🏛️', status: ProfileStatus.APPROVED,
    },
    {
      organisationName: 'EdTech India', title: 'Data Science Intern',
      listingType: ListingType.INTERNSHIP, targetRoleType: RoleType.INTERN,
      industry: Industry.IT_SOFTWARE, location: 'Bengaluru, Karnataka',
      payment: PaymentType.STIPEND, salary: '₹15,000 Stipend/Month',
      workMode: WorkMode.HYBRID, certificateProvided: CertOpt.YES,
      employmentOption: EmpOption.EXISTS, experienceRequired: ExperienceLevel.FRESHER_0_1,
      duration: Duration.MEDIUM_TERM, marketField: MarketField.IT_FIELD,
      skills: ['Python', 'Pandas', 'Scikit-Learn', 'SQL', 'Tableau'] as any,
      facilities: ['Mentorship', 'Certificate', 'Pre-Placement Offer'] as any,
      responsibilities: ['Work on live data science projects', 'Build ML models'] as any,
      requirements: ['Final year B.Tech CS/IT/ECE or MCA', 'Python and Pandas proficiency'] as any,
      description: '6-month Data Science Internship for final-year B.Tech / MCA students. Certificate provided. PPO for excellent performers.',
      experienceDetail: 'No prior work experience required. At least one data science project expected.',
      icon: '🎓', status: ProfileStatus.APPROVED,
    },
    {
      organisationName: 'Deloitte India', title: 'Senior Chartered Accountant',
      listingType: ListingType.JOB_OPENING, targetRoleType: RoleType.CONSULTANT,
      industry: Industry.FINANCE_BANKING, location: 'Mumbai, Maharashtra',
      payment: PaymentType.PAID, salary: '₹25–40 LPA',
      workMode: WorkMode.HYBRID, certificateProvided: CertOpt.NO,
      employmentOption: EmpOption.NOT_EXISTS, experienceRequired: ExperienceLevel.EXP_5_8,
      duration: Duration.PERMANENT, marketField: MarketField.SERVICES,
      skills: ['IFRS', 'IndAS', 'Tax', 'Statutory Audit', 'SAP FICO'] as any,
      facilities: ['Health Insurance', 'ESOPs', 'Annual Bonus'] as any,
      responsibilities: ['Lead statutory audit engagements', 'Review financial statements'] as any,
      requirements: ['CA (ICAI) qualified — mandatory', '5–8 years post-qualification'] as any,
      description: 'Deloitte India seeks Senior CA to lead audit and advisory engagements for Fortune 500 clients.',
      experienceDetail: '5–8 years post-qualification with at least 3 years in Big 4 or equivalent.',
      icon: '💰', status: ProfileStatus.APPROVED,
    },
  ];

  for (const l of listings) {
    await prisma.jobListing.create({
      data: { ...l, postedById: admin.id, reviewedById: admin.id, reviewedAt: new Date() },
    });
  }
  console.log(`Seeded ${listings.length} listings.`);

  // ── Sample profiles ───────────────────────────────────────────────────────
  const profiles = [
    { name: 'Arjun Nair',      email: 'arjun@example.com',   phone: '+919100000001', city: 'Bengaluru', role: RoleType.JOB_SEEKER,  skills: ['React', 'Node.js', 'AWS'],     appliedFor: 'Senior Software Engineer',  appliedAt: 'TCS Digital',      payment: PaymentType.PAID,    cert: CertOpt.NO,  mode: WorkMode.HYBRID,    seg: MarketSegment.IT_DEVELOPERS,        status: ProfileStatus.PENDING  },
    { name: 'Priya Iyer',      email: 'priya@example.com',   phone: '+919100000002', city: 'Chennai',   role: RoleType.INTERN,       skills: ['Python', 'ML', 'Pandas'],      appliedFor: 'Data Science Intern',       appliedAt: 'Infosys',          payment: PaymentType.STIPEND, cert: CertOpt.YES, mode: WorkMode.WFH,       seg: MarketSegment.IT_DATA_AI,           status: ProfileStatus.PENDING  },
    { name: 'Kiran Reddy',     email: 'kiran@example.com',   phone: '+919100000003', city: 'Hyderabad', role: RoleType.CONSULTANT,   skills: ['Healthcare IT', 'EHR'],        appliedFor: 'Healthcare IT Consultant',  appliedAt: 'Apollo Hospitals', payment: PaymentType.PAID,    cert: CertOpt.NO,  mode: WorkMode.ON_SITE,   seg: MarketSegment.SERVICES_CONSULTANCY, status: ProfileStatus.APPROVED },
    { name: 'Ananya Krishnan', email: 'ananya@example.com',  phone: '+919100000004', city: 'Bengaluru', role: RoleType.TRAINER,      skills: ['Communication', 'L&D'],        appliedFor: 'Soft Skills Trainer',       appliedAt: 'Various Clients',  payment: PaymentType.PAID,    cert: CertOpt.YES, mode: WorkMode.OFF_SITE,  seg: MarketSegment.SERVICES_TRAINING,    status: ProfileStatus.APPROVED },
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

    // Create wallet for each seed user
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

  console.log('Sample profiles and wallets seeded.');
  console.log('\n✦ Seed complete!');
  console.log('  Admin:     admin@sarvamoola.in     / Admin@1234');
  console.log('  Moderator: moderator@sarvamoola.in / Admin@1234');
  console.log('  Demo:      demo@example.com        / Test@1234');
}

main().catch(console.error).finally(() => prisma.$disconnect());