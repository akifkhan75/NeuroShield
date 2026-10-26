import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DangerZoneSeverity, DangerZoneType } from '@prisma/client';

@Injectable()
export class DangerZonesService {
  constructor(private prisma: PrismaService) {}

  private mapInputType(type: string): DangerZoneType {
    if (type === 'Suspicious Activity' || type === 'Suspicious_Activity') return DangerZoneType.Suspicious_Activity;
    if (type === 'Poor Lighting' || type === 'Poor_Lighting') return DangerZoneType.Poor_Lighting;
    if (type === 'Theft') return DangerZoneType.Theft;
    if (type === 'Assault') return DangerZoneType.Assault;
    if (type === 'Harassment') return DangerZoneType.Harassment;
    return DangerZoneType.Suspicious_Activity;
  }

  private mapOutputType(type: DangerZoneType): string {
    if (type === DangerZoneType.Suspicious_Activity) return 'Suspicious Activity';
    if (type === DangerZoneType.Poor_Lighting) return 'Poor Lighting';
    return type;
  }

  async findAll() {
    const zones = await this.prisma.dangerZone.findMany({
      orderBy: { reportedAt: 'desc' },
    });
    return zones.map(zone => ({
      id: zone.id,
      location: { top: zone.top, left: zone.left },
      severity: zone.severity,
      type: this.mapOutputType(zone.type),
      description: zone.description,
      reportedAt: zone.reportedAt.toISOString(),
    }));
  }

  async create(data: {
    top: string;
    left: string;
    severity: DangerZoneSeverity;
    type: string;
    description: string;
    userId?: string;
  }) {
    const zone = await this.prisma.dangerZone.create({
      data: {
        ...data,
        type: this.mapInputType(data.type),
      },
    });
    return {
      id: zone.id,
      location: { top: zone.top, left: zone.left },
      severity: zone.severity,
      type: this.mapOutputType(zone.type),
      description: zone.description,
      reportedAt: zone.reportedAt.toISOString(),
    };
  }

}
