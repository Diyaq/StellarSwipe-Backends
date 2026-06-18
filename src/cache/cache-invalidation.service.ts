import { Injectable, Logger } from '@nestjs/common';
import { CacheService, CachePrefix, tenantKey } from './cache.service';

/** All user-data cache keys are namespaced under this prefix. */
const USER_PREFIX = 'stellarswipe:user:';

/** Cache key builders – centralised so invalidation is always consistent. */
export const UserCacheKeys = {
  profile: (userId: string, tenantId = 'default') =>
    tenantKey(CachePrefix.USER_PROFILE, tenantId, `${userId}:profile`),
  preferences: (userId: string, tenantId = 'default') =>
    tenantKey(CachePrefix.USER_PROFILE, tenantId, `${userId}:preferences`),
  sessions: (userId: string) =>
    `${USER_PREFIX}${userId}:sessions`,
  portfolio: (userId: string) => `${CachePrefix.PORTFOLIO}${userId}`,
};

export const AnalyticsCacheKeys = {
  dashboard: (tenantId: string, period: string) =>
    tenantKey(CachePrefix.ANALYTICS, tenantId, `dashboard:${period}`),
  snapshot: (tenantId: string, period: string, date: string) =>
    tenantKey(CachePrefix.ANALYTICS, tenantId, `snapshot:${period}:${date}`),
};

export const MarketCacheKeys = {
  price: (tenantId: string, assetPair: string) =>
    tenantKey(CachePrefix.MARKET, tenantId, `price:${assetPair}`),
  history: (tenantId: string, assetPair: string) =>
    tenantKey(CachePrefix.MARKET, tenantId, `history:${assetPair}`),
};

@Injectable()
export class CacheInvalidationService {
  private readonly logger = new Logger(CacheInvalidationService.name);

  constructor(private readonly cacheService: CacheService) {}

  /**
   * Invalidate all cache entries that belong to a single user.
   * Call this whenever any user data changes (profile, preferences, sessions).
   */
  async invalidateUser(userId: string, tenantId = 'default'): Promise<void> {
    const keys = [
      UserCacheKeys.profile(userId, tenantId),
      UserCacheKeys.preferences(userId, tenantId),
      UserCacheKeys.sessions(userId),
      UserCacheKeys.portfolio(userId),
    ];

    await Promise.all(keys.map((k) => this.cacheService.del(k)));
    this.logger.log(`Cache invalidated for user ${userId} (tenant: ${tenantId})`);
  }

  /** Invalidate only the user's profile cache entry. */
  async invalidateUserProfile(userId: string, tenantId = 'default'): Promise<void> {
    await this.cacheService.del(UserCacheKeys.profile(userId, tenantId));
    this.logger.log(`Profile cache invalidated for user ${userId}`);
  }

  /** Invalidate only the user's preferences cache entry. */
  async invalidateUserPreferences(userId: string, tenantId = 'default'): Promise<void> {
    await this.cacheService.del(UserCacheKeys.preferences(userId, tenantId));
    this.logger.log(`Preferences cache invalidated for user ${userId}`);
  }

  /** Invalidate only the user's sessions cache entry. */
  async invalidateUserSessions(userId: string): Promise<void> {
    await this.cacheService.del(UserCacheKeys.sessions(userId));
    this.logger.log(`Sessions cache invalidated for user ${userId}`);
  }

  /** Invalidate cache for multiple users at once (e.g. bulk admin operations). */
  async invalidateUsers(userIds: string[], tenantId = 'default'): Promise<void> {
    await Promise.all(userIds.map((id) => this.invalidateUser(id, tenantId)));
  }

  /** Invalidate analytics dashboard cache for a tenant+period. */
  async invalidateAnalytics(tenantId: string, period: string): Promise<void> {
    await this.cacheService.del(AnalyticsCacheKeys.dashboard(tenantId, period));
    this.logger.log(`Analytics cache invalidated for tenant ${tenantId}, period ${period}`);
  }

  /** Invalidate a single analytics snapshot. */
  async invalidateAnalyticsSnapshot(tenantId: string, period: string, date: string): Promise<void> {
    await this.cacheService.del(AnalyticsCacheKeys.snapshot(tenantId, period, date));
  }

  /** Invalidate market data (price + history) for an asset pair. */
  async invalidateMarketData(tenantId: string, assetPair: string): Promise<void> {
    await Promise.all([
      this.cacheService.del(MarketCacheKeys.price(tenantId, assetPair)),
      this.cacheService.del(MarketCacheKeys.history(tenantId, assetPair)),
    ]);
    this.logger.log(`Market cache invalidated for ${assetPair} (tenant: ${tenantId})`);
  }
}
