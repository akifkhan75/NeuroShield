import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { DangerZonesService } from './danger-zones.service';
import { DangerZoneSeverity, DangerZoneType } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('api/v1/danger-zones')
export class DangerZonesController {
  constructor(private readonly dangerZonesService: DangerZonesService) {}

  @Get()
  async findAll() {
    return this.dangerZonesService.findAll();
  }

  @Post()
  async create(
    @Request() req: any,
    @Body() body: {
      severity: DangerZoneSeverity;
      type: DangerZoneType;
      description: string;
    }
  ) {
    const top = `${48 + Math.random() * 4}%`;
    const left = `${48 + Math.random() * 4}%`;
    
    return this.dangerZonesService.create({
      top,
      left,
      severity: body.severity,
      type: body.type,
      description: body.description,
      userId: req.user.id,
    });
  }
}
