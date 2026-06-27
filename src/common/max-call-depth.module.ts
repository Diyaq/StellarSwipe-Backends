import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MaxCallDepthGuard } from './guards/max-call-depth.guard';
import { MaxCallDepthService } from './services/max-call-depth.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [MaxCallDepthGuard, MaxCallDepthService],
  exports: [MaxCallDepthGuard, MaxCallDepthService],
})
export class MaxCallDepthModule {}