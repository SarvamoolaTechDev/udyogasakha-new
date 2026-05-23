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

  const admin = await prisma.user.upsert({
    where: { email: 'admin@udyogasakha.in' }, update: {},
    create: { email: 'admin@udyogasakha.in', name: 'Platform Admin', passwordHash: adminHash, roles: [UserRole.ADMIN, UserRole.MODERATOR], city: 'Bengaluru' },
  });

  const mod = await prisma.user.upsert({
    where: { email: 'moderator@udyogasakha.in' }, update: {},
    create: { email: 'moderator@udyogasakha.in', name: 'Moderator One', passwordHash: adminHash, roles: [UserRole.MODERATOR], city: 'Chennai' },
  });

  await prisma.user.upsert({
    where: { email: 'demo@example.com' }, update: {},
    create: { email: 'demo@example.com', name: 'Demo User', passwordHash: userHash, roles: [UserRole.PARTICIPANT], city: 'Bengaluru' },
  });

  // ── Job Listings ──────────────────────────────────────────────────────────
  const listings = [
    { organisationName:'TCS Digital', title:'Senior Software Engineer', listingType:ListingType.JOB_OPENING, targetRoleType:RoleType.JOB_SEEKER, industry:Industry.IT_SOFTWARE, location:'Bengaluru, Karnataka', payment:PaymentType.PAID, salary:'₹18–28 LPA', workMode:WorkMode.HYBRID, certificateProvided:CertOpt.NO, employmentOption:EmpOption.EXISTS, experienceRequired:ExperienceLevel.EXP_5_8, duration:Duration.PERMANENT, marketField:MarketField.IT_FIELD, skills:['React','Node.js','AWS','SQL','Microservices'], facilities:['Health Insurance','PF','Flexible Hours','Laptop'], description:'Join TCS Digital to build cloud solutions for Fortune 500 clients. You will architect scalable distributed systems and mentor junior engineers.', experienceDetail:'5–8 years hands-on experience building production-grade web applications. Must have led at least one end-to-end product delivery.', responsibilities:['Architect scalable cloud-native applications','Lead code reviews','Mentor junior developers','Collaborate with product managers'], requirements:['B.Tech in CS or equivalent','5–8 years software development','Proficiency in React, Node.js and AWS'], icon:'💻', status:ProfileStatus.APPROVED },
    { organisationName:'Apollo Hospitals', title:'Paediatric Cardiologist', listingType:ListingType.JOB_OPENING, targetRoleType:RoleType.JOB_SEEKER, industry:Industry.HEALTHCARE, location:'Chennai, Tamil Nadu', payment:PaymentType.PAID, salary:'₹30–50 LPA', workMode:WorkMode.ON_SITE, certificateProvided:CertOpt.NO, employmentOption:EmpOption.NOT_EXISTS, experienceRequired:ExperienceLevel.EXP_8_PLUS, duration:Duration.PERMANENT, marketField:MarketField.NON_IT_FIELD, skills:['Paediatric Cardiology','ECHO','Cath Lab','PICU'], facilities:['Accommodation','Medical Benefits','Research Grant'], description:'Apollo Hospitals Chennai seeks an experienced Paediatric Cardiologist to lead the cardiac care unit.', experienceDetail:'8–12 years post-MD/DM experience with expertise in complex congenital heart disease.', responsibilities:['Lead the Paediatric Cardiac team','Perform Cath Lab procedures','Train junior residents'], requirements:['MBBS + MD/DM Paediatric Cardiology','8–12 years post-DM'], icon:'🏥', status:ProfileStatus.APPROVED },
    { organisationName:'Govt of Karnataka', title:'Junior Engineer (Civil)', listingType:ListingType.JOB_OPENING, targetRoleType:RoleType.FRESHER, industry:Industry.GOVERNMENT_PSU, location:'Karnataka — Multiple Districts', payment:PaymentType.PAID, salary:'₹5–8 LPA', workMode:WorkMode.ON_SITE, certificateProvided:CertOpt.NO, employmentOption:EmpOption.EXISTS, experienceRequired:ExperienceLevel.FRESHER_0_1, duration:Duration.PERMANENT, marketField:MarketField.NON_IT_FIELD, skills:['Civil Engineering','AutoCAD','Surveying','MS Project'], facilities:['Pension','PF','Gratuity','Job Security'], description:'PWD Karnataka invites applications for Junior Engineer (Civil) posts across multiple districts.', experienceDetail:'No prior experience required. Final-year internship in infrastructure preferred.', responsibilities:['Assist Senior Engineers in site supervision','Prepare quantity estimates','Conduct site inspections'], requirements:['B.Tech Civil Engineering','CGPA 6.0 or above','Karnataka domicile'], icon:'🏛️', status:ProfileStatus.APPROVED },
    { organisationName:'Infosys BPM', title:'Python Developer (Remote)', listingType:ListingType.JOB_OPENING, targetRoleType:RoleType.FREELANCER, industry:Industry.IT_SOFTWARE, location:'India — Any State (WFH)', payment:PaymentType.PAID, salary:'₹8–14 LPA', workMode:WorkMode.WFH, certificateProvided:CertOpt.NO, employmentOption:EmpOption.NOT_EXISTS, experienceRequired:ExperienceLevel.EXP_1_3, duration:Duration.PROJECT_BASED, marketField:MarketField.IT_FIELD, skills:['Python','Django','FastAPI','REST API','PostgreSQL','Docker'], facilities:['Laptop Provided','Internet Allowance','Flexible Hours'], description:'Infosys BPM is hiring remote Python developers for a 12-month data pipeline automation project.', experienceDetail:'1–3 years Python development with at least one production deployment.', responsibilities:['Build Python-based data pipelines','REST APIs using FastAPI','Write unit tests'], requirements:['1–3 years Python experience','Django or FastAPI knowledge'], icon:'💻', status:ProfileStatus.APPROVED },
    { organisationName:'EdTech India', title:'Data Science Intern', listingType:ListingType.INTERNSHIP, targetRoleType:RoleType.INTERN, industry:Industry.IT_SOFTWARE, location:'Bengaluru, Karnataka', payment:PaymentType.STIPEND, salary:'₹15,000 Stipend/Month', workMode:WorkMode.HYBRID, certificateProvided:CertOpt.YES, employmentOption:EmpOption.EXISTS, experienceRequired:ExperienceLevel.FRESHER_0_1, duration:Duration.MEDIUM_TERM, marketField:MarketField.IT_FIELD, skills:['Python','Pandas','Scikit-Learn','SQL','Tableau'], facilities:['Mentorship','Certificate','Pre-Placement Offer'], description:'6-month Data Science Internship for final-year B.Tech / MCA students. Certificate provided. PPO for excellent performers.', experienceDetail:'No prior work experience required. At least one data science project expected.', responsibilities:['Work on live data science projects','Build ML models','Create dashboards'], requirements:['Final year B.Tech CS/IT/ECE or MCA','Python and Pandas proficiency'], icon:'🎓', status:ProfileStatus.APPROVED },
    { organisationName:'National Institute of Training', title:'Corporate Soft Skills Trainer', listingType:ListingType.TRAINING_PROGRAM, targetRoleType:RoleType.TRAINER, industry:Industry.EDUCATION, location:'Pan India (Off-Site)', payment:PaymentType.PAID, salary:'₹600–1200/Session', workMode:WorkMode.OFF_SITE, certificateProvided:CertOpt.YES, employmentOption:EmpOption.NOT_EXISTS, experienceRequired:ExperienceLevel.EXP_3_5, duration:Duration.PROJECT_BASED, marketField:MarketField.SERVICES, skills:['Communication','Leadership','Presentation','NLP','Team Building'], facilities:['Travel Reimbursement','Certificate of Engagement'], description:'NIT is empanelling experienced Soft Skills Trainers for corporate client sessions across India.', experienceDetail:'3–5 years corporate training with 500+ participant track record.', responsibilities:['Conduct soft skills sessions','Design training content','Administer assessments'], requirements:['3–5 years training experience','TTT / NLP / CELTA certification preferred'], icon:'📚', status:ProfileStatus.APPROVED },
    { organisationName:'Deloitte India', title:'Senior Chartered Accountant', listingType:ListingType.JOB_OPENING, targetRoleType:RoleType.CONSULTANT, industry:Industry.FINANCE_BANKING, location:'Mumbai, Maharashtra', payment:PaymentType.PAID, salary:'₹25–40 LPA', workMode:WorkMode.HYBRID, certificateProvided:CertOpt.NO, employmentOption:EmpOption.NOT_EXISTS, experienceRequired:ExperienceLevel.EXP_5_8, duration:Duration.PERMANENT, marketField:MarketField.SERVICES, skills:['IFRS','IndAS','Tax','Statutory Audit','SAP FICO'], facilities:['Health Insurance','ESOPs','Annual Bonus'], description:'Deloitte India seeks Senior CA to lead audit and advisory engagements for Fortune 500 clients.', experienceDetail:'5–8 years post-qualification with at least 3 years in Big 4 or equivalent.', responsibilities:['Lead statutory audit engagements','Review financial statements','Manage client relationships'], requirements:['CA (ICAI) qualified — mandatory','5–8 years post-qualification'], icon:'💰', status:ProfileStatus.APPROVED },
  ];

  for (const l of listings) {
    await prisma.jobListing.create({ data: { ...l, postedById: admin.id, reviewedById: admin.id, reviewedAt: new Date() } });
  }
  console.log(`Seeded ${listings.length} listings.`);

  // ── Sample profiles ───────────────────────────────────────────────────────
  const profiles = [
    { name:'Arjun Nair',      email:'arjun@example.com',    city:'Bengaluru', role:RoleType.JOB_SEEKER,  skills:['React','Node.js','AWS'],     appliedFor:'Senior Software Engineer',  appliedAt:'TCS Digital',       payment:PaymentType.PAID,    cert:CertOpt.NO,  mode:WorkMode.HYBRID,    seg:MarketSegment.IT_DEVELOPERS,        status:ProfileStatus.PENDING  },
    { name:'Priya Iyer',      email:'priya@example.com',    city:'Chennai',   role:RoleType.INTERN,       skills:['Python','ML','Pandas'],      appliedFor:'Data Science Intern',        appliedAt:'Infosys',           payment:PaymentType.STIPEND, cert:CertOpt.YES, mode:WorkMode.WFH,       seg:MarketSegment.IT_DATA_AI,           status:ProfileStatus.PENDING  },
    { name:'Kiran Reddy',     email:'kiran@example.com',    city:'Hyderabad', role:RoleType.CONSULTANT,   skills:['Healthcare IT','EHR'],       appliedFor:'Healthcare IT Consultant',   appliedAt:'Apollo Hospitals',  payment:PaymentType.PAID,    cert:CertOpt.NO,  mode:WorkMode.ON_SITE,   seg:MarketSegment.SERVICES_CONSULTANCY, status:ProfileStatus.APPROVED },
    { name:'Ananya Krishnan', email:'ananya@example.com',   city:'Bengaluru', role:RoleType.TRAINER,      skills:['Communication','L&D'],       appliedFor:'Soft Skills Trainer',        appliedAt:'Various Clients',   payment:PaymentType.PAID,    cert:CertOpt.YES, mode:WorkMode.OFF_SITE,  seg:MarketSegment.SERVICES_TRAINING,    status:ProfileStatus.APPROVED },
    { name:'Deepika Menon',   email:'deepika@example.com',  city:'Kochi',     role:RoleType.FREELANCER,   skills:['Figma','Adobe XD'],          appliedFor:'UI/UX Designer',             appliedAt:'Multiple Clients',  payment:PaymentType.PAID,    cert:CertOpt.NO,  mode:WorkMode.WFH,       seg:MarketSegment.IT_DESIGNERS,         status:ProfileStatus.REJECTED },
  ];

  for (const p of profiles) {
    const u = await prisma.user.upsert({
      where: { email: p.email }, update: {},
      create: { email: p.email, name: p.name, passwordHash: userHash, roles: [UserRole.PARTICIPANT], city: p.city },
    });
    const mf = p.seg.startsWith('IT') ? MarketField.IT_FIELD : p.seg.startsWith('SERVICES') ? MarketField.SERVICES : MarketField.NON_IT_FIELD;
    await prisma.candidateProfile.upsert({
      where: { userId_roleType: { userId: u.id, roleType: p.role } }, update: { status: p.status },
      create: {
        userId: u.id, roleType: p.role, fullName: p.name, email: p.email, city: p.city,
        skills: p.skills, summary: `Experienced ${p.role.replace(/_/g,' ')}`,
        appliedFor: p.appliedFor, appliedAt: p.appliedAt,
        payment: p.payment, certificate: p.cert, workMode: p.mode,
        employmentOption: EmpOption.EXISTS, marketSegment: p.seg, status: p.status,
        ...(p.status !== ProfileStatus.PENDING ? { marketField: mf, reviewedById: mod.id, reviewedAt: new Date() } : {}),
      },
    });
  }

  console.log('Sample profiles seeded.');
  console.log('\n✦ Seed complete!');
  console.log('  Admin:     admin@udyogasakha.in     / Admin@1234');
  console.log('  Moderator: moderator@udyogasakha.in / Admin@1234');
  console.log('  Demo:      demo@example.com         / Test@1234');
}

main().catch(console.error).finally(() => prisma.$disconnect());
