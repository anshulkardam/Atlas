import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'argon2';
import { PrismaClient } from 'src/generated/prisma/client.js';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL as string,
  }),
});

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a test user
  const hashedPassword = await hash('password123');

  const user = await prisma.user.upsert({
    where: { email: 'demo@alpha.com' },
    update: {},
    create: {
      email: 'demo@alpha.com',
      name: 'Demo User',
      password: hashedPassword,
      provider: 'LOCAL',
    },
  });

  console.log('✓ Created user:', user.email);

  // Create 1 Campaign
  const campaign = await prisma.campaign.upsert({
    where: { id: 'campaign-1' },
    update: {},
    create: {
      id: 'campaign-1',
      name: 'Q1 2024 Outreach',
      status: 'ACTIVE',
      userId: user.id,
    },
  });

  console.log('✓ Created campaign:', campaign.name);

  // Create 2 Companies
  const companies = await Promise.all([
    prisma.company.upsert({
      where: { id: 'company-1' },
      update: {},
      create: {
        id: 'company-1',
        name: 'Anthropic',
        domain: 'anthropic.com',
        campaignId: campaign.id,
      },
    }),
    prisma.company.upsert({
      where: { id: 'company-2' },
      update: {},
      create: {
        id: 'company-2',
        name: 'OpenAI',
        domain: 'openai.com',
        campaignId: campaign.id,
      },
    }),
  ]);

  console.log('✓ Created companies:', companies.map((c) => c.name).join(', '));

  // Create 4 People
  const people = await Promise.all([
    prisma.people.upsert({
      where: { id: 'person-1' },
      update: {},
      create: {
        id: 'person-1',
        fullName: 'Dario Amodei',
        email: 'dario@anthropic.com',
        title: 'CEO & Co-Founder',
        companyId: companies[0].id,
      },
    }),
    prisma.people.upsert({
      where: { id: 'person-2' },
      update: {},
      create: {
        id: 'person-2',
        fullName: 'Daniela Amodei',
        email: 'daniela@anthropic.com',
        title: 'President & Co-Founder',
        companyId: companies[0].id,
      },
    }),
    prisma.people.upsert({
      where: { id: 'person-3' },
      update: {},
      create: {
        id: 'person-3',
        fullName: 'Sam Altman',
        email: 'sam@openai.com',
        title: 'CEO',
        companyId: companies[1].id,
      },
    }),
    prisma.people.upsert({
      where: { id: 'person-4' },
      update: {},
      create: {
        id: 'person-4',
        fullName: 'Greg Brockman',
        email: 'greg@openai.com',
        title: 'President & Co-Founder',
        companyId: companies[1].id,
      },
    }),
  ]);

  console.log('✓ Created people:', people.map((p) => p.fullName).join(', '));

  console.log('\n🎉 Seed completed successfully!');
  console.log('\nTest credentials:');
  console.log('  Email: demo@alpha.com');
  console.log('  Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
