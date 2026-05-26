import { Controller, Get, Header, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { PrometheusService } from './metrics/prometheus.service';
import { MetricsDashboardService, MetricsSummary } from './metrics/metrics-dashboard.service';
import { HealthMetricsAuthGuard } from '../common/guards/health-metrics-auth.guard';

@ApiTags('monitoring')
@Controller('metrics')
@UseGuards(HealthMetricsAuthGuard)
export class MonitoringController {
  constructor(
    private readonly prometheus: PrometheusService,
    private readonly metricsDashboard: MetricsDashboardService,
  ) {}

  /**
   * Prometheus scrape endpoint.
   * Returns all registered metrics in the Prometheus text exposition format.
   * Includes: HTTP timings, error rates, Bull queue sizes, cache stats, DB pool,
   * and business counters — all labelled by endpoint and service type.
   */
  @Get()
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  @ApiOperation({ summary: 'Prometheus metrics scrape endpoint (text/plain)' })
  @ApiResponse({
    status: 200,
    description:
      'All metrics in Prometheus text format. Compatible with Prometheus, ' +
      'Grafana, DataDog, and any OpenMetrics-compatible scraper.',
  })
  async getMetrics(): Promise<string> {
    return this.prometheus.getMetrics();
  }

  /**
   * Human-readable dashboard summary grouping all exported metrics by category:
   * http, queues, cache, database, and business.
   */
  @Get('dashboard')
  @ApiOperation({
    summary: 'Metrics dashboard summary grouped by category',
    description:
      'Returns a JSON document listing every exported metric name, ' +
      'grouped by category (http, queues, cache, database, business). ' +
      'Includes a scrapeUrl pointing to the raw Prometheus endpoint.',
  })
  @ApiResponse({ status: 200, description: 'Metrics category summary' })
  async getDashboard(@Req() req: Request): Promise<MetricsSummary> {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return this.metricsDashboard.getDashboardSummary(baseUrl);
  }
}
