import {
  CampaignStatus,
  DonationStatus,
  KycStatus,
  MilestoneStatus,
  Prisma,
  PrismaClient,
  UserRole,
} from '@prisma/client';

const prisma = new PrismaClient();

const users: Prisma.UserCreateInput[] = [
  {
    id: 'seed_user_admin',
    walletAddress:
      'GADMINSEEDWALLET000000000000000000000000000000000000000000000000',
    email: 'admin@nexora.local',
    displayName: 'Nexora Admin',
    name: 'Nexora Admin',
    role: UserRole.ADMIN,
    kycStatus: KycStatus.VERIFIED,
    bio: 'Seed administrator for local moderation workflows.',
    isActive: true,
  },
  {
    id: 'seed_user_creator',
    walletAddress:
      'GCREATORSEEDWALLET00000000000000000000000000000000000000000000',
    email: 'creator@nexora.local',
    displayName: 'Amina Creator',
    name: 'Amina Creator',
    role: UserRole.CREATOR,
    kycStatus: KycStatus.VERIFIED,
    bio: 'Creates community campaigns in the local seed dataset.',
    isActive: true,
  },
  {
    id: 'seed_user_donor',
    walletAddress:
      'GDONORSEEDWALLET000000000000000000000000000000000000000000000',
    email: 'donor@nexora.local',
    displayName: 'Leo Donor',
    name: 'Leo Donor',
    role: UserRole.DONOR,
    kycStatus: KycStatus.UNVERIFIED,
    bio: 'Makes sample donations for local testing.',
    isActive: true,
  },
];

const campaigns: Prisma.CampaignUncheckedCreateInput[] = [
  {
    id: 'seed_campaign_clean_water',
    title: 'Clean Water for Demo Village',
    description:
      'Fund water filters and maintenance training for a fictional community.',
    story:
      'A local team is coordinating transparent milestone-based delivery of water filters.',
    goalAmount: '25000.0000000',
    raisedAmount: '550.0000000',
    status: CampaignStatus.ACTIVE,
    creatorId: 'seed_user_creator',
    acceptedAssets: ['XLM', 'USDC'],
    isFeatured: true,
    startDate: new Date('2026-01-10T00:00:00.000Z'),
    endDate: new Date('2026-06-30T00:00:00.000Z'),
    imageUrl: 'https://example.com/nexora/clean-water.png',
    category: 'Community',
  },
  {
    id: 'seed_campaign_school_lab',
    title: 'Solar Study Lab',
    description:
      'Equip a fictional after-school study lab with solar lighting.',
    story:
      'Students need a safe evening study space powered by renewable energy.',
    goalAmount: '12000.0000000',
    raisedAmount: '125.0000000',
    status: CampaignStatus.PENDING_APPROVAL,
    creatorId: 'seed_user_creator',
    acceptedAssets: ['XLM'],
    isFeatured: false,
    startDate: new Date('2026-02-01T00:00:00.000Z'),
    endDate: new Date('2026-05-15T00:00:00.000Z'),
    imageUrl: 'https://example.com/nexora/solar-study-lab.png',
    category: 'Education',
  },
];

const milestones: Prisma.MilestoneUncheckedCreateInput[] = [
  {
    id: 'seed_milestone_water_filters',
    campaignId: 'seed_campaign_clean_water',
    title: 'Purchase water filters',
    description: 'Order the first batch of filters from a fictional supplier.',
    targetAmount: '10000.0000000',
    status: MilestoneStatus.ACTIVE,
    dueDate: new Date('2026-03-01T00:00:00.000Z'),
  },
  {
    id: 'seed_milestone_water_training',
    campaignId: 'seed_campaign_clean_water',
    title: 'Run maintenance training',
    description: 'Train local volunteers on filter maintenance and reporting.',
    targetAmount: '15000.0000000',
    status: MilestoneStatus.PENDING,
    dueDate: new Date('2026-04-15T00:00:00.000Z'),
  },
  {
    id: 'seed_milestone_lab_lighting',
    campaignId: 'seed_campaign_school_lab',
    title: 'Install solar lighting',
    description: 'Install lights and battery storage for the study lab.',
    targetAmount: '12000.0000000',
    status: MilestoneStatus.PENDING,
    dueDate: new Date('2026-04-01T00:00:00.000Z'),
  },
];

const donations: Prisma.DonationUncheckedCreateInput[] = [
  {
    id: 'seed_donation_water_1',
    amount: '250.0000000',
    assetCode: 'XLM',
    txHash: 'seed_tx_clean_water_001',
    isAnonymous: false,
    status: DonationStatus.CONFIRMED,
    donorId: 'seed_user_donor',
    campaignId: 'seed_campaign_clean_water',
    confirmedAt: new Date('2026-01-15T12:00:00.000Z'),
  },
  {
    id: 'seed_donation_water_2',
    amount: '300.0000000',
    assetCode: 'USDC',
    assetIssuer: 'GUSDCSEEDISSUER00000000000000000000000000000000000000000000',
    txHash: 'seed_tx_clean_water_002',
    isAnonymous: true,
    status: DonationStatus.CONFIRMED,
    donorId: 'seed_user_admin',
    campaignId: 'seed_campaign_clean_water',
    confirmedAt: new Date('2026-01-20T15:30:00.000Z'),
  },
  {
    id: 'seed_donation_lab_1',
    amount: '125.0000000',
    assetCode: 'XLM',
    txHash: 'seed_tx_solar_lab_001',
    isAnonymous: false,
    status: DonationStatus.PENDING,
    donorId: 'seed_user_donor',
    campaignId: 'seed_campaign_school_lab',
  },
];

async function main() {
  for (const user of users) {
    await prisma.user.upsert({
      where: { walletAddress: user.walletAddress },
      update: user,
      create: user,
    });
  }

  for (const campaign of campaigns) {
    await prisma.campaign.upsert({
      where: { id: campaign.id },
      update: campaign,
      create: campaign,
    });
  }

  for (const milestone of milestones) {
    await prisma.milestone.upsert({
      where: { id: milestone.id },
      update: milestone,
      create: milestone,
    });
  }

  for (const donation of donations) {
    await prisma.donation.upsert({
      where: { id: donation.id },
      update: donation,
      create: donation,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
