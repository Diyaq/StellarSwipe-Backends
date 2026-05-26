import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PrometheusService } from './metrics/prometheus.service';
import { MetricsInterceptor } from './metrics/metrics.interceptor';
import { QueueMetricsService } from './metrics/queue-metrics.service';
import { MetricsDashboardService } from './metrics/metrics-dashboard.service';
import { MonitoringController } from './monitoring.controller';
import { AuthModule } from '../auth/auth.module';
import { ApiKeysModule } from '../api-keys/api-keys.module';

@Global()
@Module({
  imports: [
    AuthModule,
    ApiKeysModule,
    BullModule.registerQueue({ name: 'transactions' }),
  ],
  providers: [
    PrometheusService,
    MetricsInterceptor,
    QueueMetricsService,
    MetricsDashboardService,
  ],
  controllers: [MonitoringController],
  exports: [PrometheusService, MetricsInterceptor, MetricsDashboardService],
})
export class MonitoringModule {}
