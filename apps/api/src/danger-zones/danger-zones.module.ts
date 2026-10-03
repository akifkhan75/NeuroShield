import { Module } from '@nestjs/common';
import { DangerZonesService } from './danger-zones.service';
import { DangerZonesController } from './danger-zones.controller';

@Module({
  controllers: [DangerZonesController],
  providers: [DangerZonesService],
  exports: [DangerZonesService],
})
export class DangerZonesModule {}
