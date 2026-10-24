import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DangerZoneSeverity, DangerZoneType } from '@prisma/client';

@Injectable()
export class DangerZonesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const zones = await this.prisma.dangerZone.findMany({
      orderBy: { reportedAt: 'desc' },
    });
    return zones.map(zone => ({
      id: zone.id,
      location: { top: zone.top, left: zone.left },
      severity: zone.severity,
      type: zone.type,
      description: zone.description,
      reportedAt: zone.reportedAt.toISOString(),
    }));
  }

  async create(data: {
    top: string;
    left: string;
    severity: DangerZoneSeverity;
    type: DangerZoneType;
    description: string;
    userId?: string;
  }) {
    const zone = await this.prisma.dangerZone.create({
      data,
    });
    return {
      id: zone.id,
      location: { top: zone.top, left: zone.left },
      severity: zone.severity,
      type: zone.type,
      description: zone.description,
      reportedAt: zone.reportedAt.toISOString(),
    };
  }

}
