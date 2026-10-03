import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SettingsModule } from './settings/settings.module';
import { DangerZonesModule } from './danger-zones/danger-zones.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, SettingsModule, DangerZonesModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
