import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DangerZoneSeverity, DangerZoneType } from '@prisma/client';

@Injectable()
export class DangerZonesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.dangerZone.findMany({
      orderBy: { reportedAt: 'desc' },
    });
  }

  async create(data: {
    top: string;
    left: string;
    severity: DangerZoneSeverity;
    type: DangerZoneType;
    description: string;
    userId?: string;
  }) {
    return this.prisma.dangerZone.create({
      data,
    });
  }
}
