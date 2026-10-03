import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { DangerZonesService } from './danger-zones.service';
import { DangerZoneSeverity, DangerZoneType } from '@prisma/client';

@Controller('api/v1/danger-zones')
export class DangerZonesController {
  constructor(private readonly dangerZonesService: DangerZonesService) {}

  @Get()
  async findAll() {
    return this.dangerZonesService.findAll();
  }

  @Post()
  async create(@Body() body: {
    severity: DangerZoneSeverity;
    type: DangerZoneType;
    description: string;
  }) {
    // For now, generate random top/left since the mobile app didn't send them explicitly in the frontend code
    // The previous backend mock generated random locations around 48%
    const top = `${48 + Math.random() * 4}%`;
    const left = `${48 + Math.random() * 4}%`;
    
    return this.dangerZonesService.create({
      top,
      left,
      severity: body.severity,
      type: body.type,
      description: body.description,
    });
  }
}
