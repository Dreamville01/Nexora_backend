import { BadRequestException } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';

describe('CampaignsService milestone target validation', () => {
  const prisma = {
    campaign: {
      create: jest.fn(),
    },
  };

  let service: CampaignsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CampaignsService(prisma as any, {} as any);
  });

  const baseDto = {
    title: 'Nexora funding round',
    goalAmount: '100',
  };

  it.each([
    ['missing', undefined],
    ['zero', '0'],
    ['zero decimal', '0.0000000'],
    ['below the minimum precision', '0.00000001'],
    ['negative', '-1'],
    ['not numeric', 'abc'],
  ])('rejects a %s milestone targetAmount', async (_case, targetAmount) => {
    await expect(
      service.createCampaign('user-1', {
        ...baseDto,
        milestones: [
          {
            title: 'Prototype',
            targetAmount,
          },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.campaign.create).not.toHaveBeenCalled();
  });

  it('passes a valid positive milestone targetAmount through to Prisma', async () => {
    prisma.campaign.create.mockResolvedValue({ id: 'campaign-1' });

    await service.createCampaign('user-1', {
      ...baseDto,
      milestones: [
        {
          title: 'Prototype',
          targetAmount: '0.0000001',
        },
      ],
    });

    expect(prisma.campaign.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          milestones: {
            create: [
              expect.objectContaining({
                targetAmount: '0.0000001',
              }),
            ],
          },
        }),
      }),
    );
  });
});

describe('CampaignsService browseCampaigns pagination', () => {
  const prisma = {
    campaign: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  let service: CampaignsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CampaignsService(prisma as any, {} as any);
  });

  it('returns data alongside pagination meta (total/page/pageSize/totalPages)', async () => {
    const campaigns = [{ id: 'campaign-1' }, { id: 'campaign-2' }];
    prisma.$transaction.mockResolvedValue([23, campaigns]);

    const result = await service.browseCampaigns({
      page: 2,
      limit: 10,
      sortBy: 'newest',
    });

    expect(result).toEqual({
      data: campaigns,
      meta: {
        total: 23,
        page: 2,
        pageSize: 10,
        totalPages: 3,
      },
    });
  });

  it('computes zero totalPages when there are no matching campaigns', async () => {
    prisma.$transaction.mockResolvedValue([0, []]);

    const result = await service.browseCampaigns({
      page: 1,
      limit: 10,
      sortBy: 'newest',
    });

    expect(result.meta).toEqual({
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
    });
  });
});
