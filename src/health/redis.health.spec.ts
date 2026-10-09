import { HealthCheckError } from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { RedisHealthIndicator } from './redis.health';

const mockPing = jest.fn();

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    ping: mockPing,
  }));
});

describe('RedisHealthIndicator', () => {
  let indicator: RedisHealthIndicator;

  beforeEach(() => {
    jest.clearAllMocks();
    const config = {
      get: jest.fn().mockReturnValue('redis://localhost:6379'),
    } as unknown as ConfigService;
    indicator = new RedisHealthIndicator(config);
  });

  it('reports healthy when Redis responds to PING', async () => {
    mockPing.mockResolvedValue('PONG');

    const result = await indicator.isHealthy('redis');

    expect(result).toEqual({ redis: { status: 'up' } });
  });

  it('throws a HealthCheckError with a down status when Redis is unreachable', async () => {
    mockPing.mockRejectedValue(new Error('connect ECONNREFUSED'));

    expect.assertions(2);
    try {
      await indicator.isHealthy('redis');
    } catch (error) {
      expect(error).toBeInstanceOf(HealthCheckError);
      expect((error as HealthCheckError).causes).toEqual({
        redis: { status: 'down' },
      });
    }
  });
});
