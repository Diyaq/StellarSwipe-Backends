import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trade } from './entities/trade.entity';
import { AdvancedOrder } from './entities/advanced-order.entity';
import { TradesController } from './trades.controller';
import { AdvancedOrdersController } from './advanced-orders.controller';
import { TradesService } from './trades.service';
import { RiskManagerService } from './services/risk-manager.service';
import { TradeExecutorService } from './services/trade-executor.service';
import { OcoOrderService } from './services/oco-order.service';
import { IcebergOrderService } from './services/iceberg-order.service';
import { StellarConfigService } from '../config/stellar.service';
import { RiskManagerModule } from '../risk/risk-manager.module';
import { ComplianceModule } from '../compliance/compliance.module';
import { BullModule } from '@nestjs/bull';
import { WebsocketModule } from '../websocket/websocket.module';
import { TxMonitorService } from './services/tx-monitor.service';
import { MonitorTransactionsJob } from './jobs/monitor-transactions.job';
import { PartialCloseService } from './partial-close/partial-close.service';
import { TradeHistoryService } from './trade-history.service';
import { TradeOutcomeService } from './trade-outcome.service';
import { TradeAuditService } from './trade-audit.service';
import { TradeAuditController } from './trade-audit.controller';
import { ConfirmationPollingService } from './services/confirmation-polling.service';
import { AuditModule } from '../audit-log/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Trade, AdvancedOrder]),
    RiskManagerModule,
    ComplianceModule,
    BullModule.registerQueue({
      name: 'transactions',
    }),
    WebsocketModule,
    AuditModule,
    NotificationsModule,
  ],
  controllers: [TradesController, AdvancedOrdersController, TradeAuditController],
  providers: [
    TradesService,
    RiskManagerService,
    TradeExecutorService,
    StellarConfigService,
    TxMonitorService,
    MonitorTransactionsJob,
    OcoOrderService,
    IcebergOrderService,
    PartialCloseService,
    TradeHistoryService,
    TradeOutcomeService,
    TradeAuditService,
    ConfirmationPollingService,
  ],
  exports: [TradesService, RiskManagerService, OcoOrderService, IcebergOrderService, PartialCloseService, TradeHistoryService, TradeOutcomeService, TradeAuditService, ConfirmationPollingService],
})
export class TradesModule { }

