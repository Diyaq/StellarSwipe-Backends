import { Module, Global } from '@nestjs/common';
import { PrometheusService } from './metrics/prometheus.service';
import { MetricsInterceptor } from './metrics/metrics.interceptor';
import { MonitoringController } from './monitoring.controller';
import { AuthModule } from '../auth/auth.module';
import { ApiKeysModule } from '../api-keys/api-keys.module';
import { CircuitBreakerService } from '../http/circuit-breaker.service';

@Global()
@Module({
  imports: [AuthModule, ApiKeysModule],
  providers: [
    PrometheusService,
    MetricsInterceptor,
    {
      provide: CircuitBreakerService,
      useFactory: (prometheus: PrometheusService) =>
        new CircuitBreakerService(prometheus.registry),
      inject: [PrometheusService],
    },
  ],
  controllers: [MonitoringController],
  exports: [PrometheusService, MetricsInterceptor, CircuitBreakerService],
})
export class MonitoringModule {}
