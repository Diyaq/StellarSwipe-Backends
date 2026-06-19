import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { BullModule } from '@nestjs/bull';
import { HealthController } from './health.controller';
import {
  StellarHealthIndicator,
  SorobanHealthIndicator,
  DatabaseHealthIndicator,
  RedisHealthIndicator,
  QueueHealthIndicator,
} from './indicators';
import { StellarConfigService } from '../config/stellar.service';
import { HealthSummaryService } from './health-summary.service';
import { MonitoringModule } from '../monitoring/monitoring.module';

@Module({
  imports: [
    TerminusModule,
    MonitoringModule,
    BullModule.registerQueue({ name: 'priority-queue' }),
  ],
  controllers: [HealthController],
  providers: [
    StellarConfigService,
    StellarHealthIndicator,
    SorobanHealthIndicator,
    DatabaseHealthIndicator,
    RedisHealthIndicator,
    QueueHealthIndicator,
    HealthSummaryService,
  ],
  exports: [
    StellarHealthIndicator,
    SorobanHealthIndicator,
    DatabaseHealthIndicator,
    RedisHealthIndicator,
    QueueHealthIndicator,
    HealthSummaryService,
  ],
})
export class HealthModule {}
