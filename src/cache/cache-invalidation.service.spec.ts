import { Test, TestingModule } from '@nestjs/testing';
import {
  CacheInvalidationService,
  UserCacheKeys,
  AnalyticsCacheKeys,
  MarketCacheKeys,
} from './cache-invalidation.service';
import { CacheService, CachePrefix } from './cache.service';

const mockCacheService = { del: jest.fn() };

describe('CacheInvalidationService – stale cache invalidation', () => {
  let service: CacheInvalidationService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheInvalidationService,
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<CacheInvalidationService>(CacheInvalidationService);
  });

  // ─── Key namespacing ────────────────────────────────────────────────────────

  describe('tenant-namespaced key builders', () => {
    it('UserCacheKeys.profile is namespaced by tenantId', () => {
      expect(UserCacheKeys.profile('u1', 'tenant-A')).toContain('tenant-A');
      expect(UserCacheKeys.profile('u1', 'tenant-A')).toContain('u1');
    });

    it('AnalyticsCacheKeys.dashboard is namespaced by tenantId and period', () => {
      const key = AnalyticsCacheKeys.dashboard('tenant-B', 'daily');
      expect(key).toContain('tenant-B');
      expect(key).toContain('daily');
      expect(key).toContain(CachePrefix.ANALYTICS);
    });

    it('MarketCacheKeys.price is namespaced by tenantId and assetPair', () => {
      const key = MarketCacheKeys.price('tenant-C', 'XLM-USDC');
      expect(key).toContain('tenant-C');
      expect(key).toContain('XLM-USDC');
      expect(key).toContain(CachePrefix.MARKET);
    });
  });

  // ─── User profile invalidation ──────────────────────────────────────────────

  describe('invalidateUser', () => {
    it('deletes profile, preferences, sessions and portfolio keys', async () => {
      mockCacheService.del.mockResolvedValue(undefined);

      await service.invalidateUser('user-1', 'tenant-A');

      expect(mockCacheService.del).toHaveBeenCalledTimes(4);
      expect(mockCacheService.del).toHaveBeenCalledWith(UserCacheKeys.profile('user-1', 'tenant-A'));
      expect(mockCacheService.del).toHaveBeenCalledWith(UserCacheKeys.preferences('user-1', 'tenant-A'));
      expect(mockCacheService.del).toHaveBeenCalledWith(UserCacheKeys.sessions('user-1'));
      expect(mockCacheService.del).toHaveBeenCalledWith(UserCacheKeys.portfolio('user-1'));
    });

    it('uses "default" tenant when none supplied', async () => {
      mockCacheService.del.mockResolvedValue(undefined);
      await service.invalidateUser('user-2');
      expect(mockCacheService.del).toHaveBeenCalledWith(UserCacheKeys.profile('user-2', 'default'));
    });
  });

  describe('invalidateUserProfile', () => {
    it('deletes only the profile key (stale profile eviction)', async () => {
      mockCacheService.del.mockResolvedValue(undefined);
      await service.invalidateUserProfile('user-3', 'tenant-X');
      expect(mockCacheService.del).toHaveBeenCalledTimes(1);
      expect(mockCacheService.del).toHaveBeenCalledWith(UserCacheKeys.profile('user-3', 'tenant-X'));
    });
  });

  describe('invalidateUserPreferences', () => {
    it('deletes only the preferences key', async () => {
      mockCacheService.del.mockResolvedValue(undefined);
      await service.invalidateUserPreferences('user-4', 'tenant-Y');
      expect(mockCacheService.del).toHaveBeenCalledTimes(1);
      expect(mockCacheService.del).toHaveBeenCalledWith(
        UserCacheKeys.preferences('user-4', 'tenant-Y'),
      );
    });
  });

  // ─── Analytics invalidation ─────────────────────────────────────────────────

  describe('invalidateAnalytics', () => {
    it('deletes the analytics dashboard cache for the given tenant and period', async () => {
      mockCacheService.del.mockResolvedValue(undefined);
      await service.invalidateAnalytics('tenant-A', 'daily');
      expect(mockCacheService.del).toHaveBeenCalledTimes(1);
      expect(mockCacheService.del).toHaveBeenCalledWith(
        AnalyticsCacheKeys.dashboard('tenant-A', 'daily'),
      );
    });

    it('snapshot invalidation deletes the exact snapshot key', async () => {
      mockCacheService.del.mockResolvedValue(undefined);
      await service.invalidateAnalyticsSnapshot('tenant-A', 'daily', '2024-01-01');
      expect(mockCacheService.del).toHaveBeenCalledWith(
        AnalyticsCacheKeys.snapshot('tenant-A', 'daily', '2024-01-01'),
      );
    });
  });

  // ─── Market data invalidation ───────────────────────────────────────────────

  describe('invalidateMarketData', () => {
    it('deletes both price and history cache keys for an asset pair', async () => {
      mockCacheService.del.mockResolvedValue(undefined);
      await service.invalidateMarketData('tenant-B', 'XLM-USDC');
      expect(mockCacheService.del).toHaveBeenCalledTimes(2);
      expect(mockCacheService.del).toHaveBeenCalledWith(
        MarketCacheKeys.price('tenant-B', 'XLM-USDC'),
      );
      expect(mockCacheService.del).toHaveBeenCalledWith(
        MarketCacheKeys.history('tenant-B', 'XLM-USDC'),
      );
    });
  });

  // ─── Bulk invalidation ──────────────────────────────────────────────────────

  describe('invalidateUsers', () => {
    it('invalidates 4 keys per user across multiple users', async () => {
      mockCacheService.del.mockResolvedValue(undefined);
      await service.invalidateUsers(['u1', 'u2'], 'tenant-A');
      // 4 keys × 2 users = 8 deletions
      expect(mockCacheService.del).toHaveBeenCalledTimes(8);
    });

    it('handles empty array without error', async () => {
      await expect(service.invalidateUsers([])).resolves.toBeUndefined();
      expect(mockCacheService.del).not.toHaveBeenCalled();
    });
  });
});
