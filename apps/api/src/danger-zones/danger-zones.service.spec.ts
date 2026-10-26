import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DangerZonesService } from './danger-zones.service';

describe('DangerZonesService', () => {
  let service: DangerZonesService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      dangerZone: {
        findMany: vi.fn(),
        create: vi.fn(),
      },
    };
    service = new DangerZonesService(prisma);
  });

  describe('findAll', () => {
    it('returns mapped danger zones conforming to location structure', async () => {
      const dbZones = [
        {
          id: 'zone-1',
          top: '52%',
          left: '48%',
          severity: 'high',
          type: 'Theft',
          description: 'Recent theft incident',
          reportedAt: new Date('2026-10-24T00:00:00.000Z'),
        },
      ];
      prisma.dangerZone.findMany.mockResolvedValue(dbZones);

      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'zone-1',
        location: { top: '52%', left: '48%' },
        severity: 'high',
        type: 'Theft',
        description: 'Recent theft incident',
        reportedAt: '2026-10-24T00:00:00.000Z',
      });
      expect(prisma.dangerZone.findMany).toHaveBeenCalledWith({
        orderBy: { reportedAt: 'desc' },
      });
    });
  });

  describe('create', () => {
    it('creates danger zone and returns mapped format', async () => {
      const input = {
        top: '50%',
        left: '50%',
        severity: 'medium' as const,
        type: 'Suspicious Activity' as const,
        description: 'Loitering near alley',
        userId: 'user-1',
      };

      const createdDbZone = {
        id: 'zone-2',
        ...input,
        type: 'Suspicious_Activity' as any,
        reportedAt: new Date('2026-10-24T01:00:00.000Z'),
      };
      prisma.dangerZone.create.mockResolvedValue(createdDbZone);

      const result = await service.create(input);
      expect(result).toEqual({
        id: 'zone-2',
        location: { top: '50%', left: '50%' },
        severity: 'medium',
        type: 'Suspicious Activity',
        description: 'Loitering near alley',
        reportedAt: '2026-10-24T01:00:00.000Z',
      });
      expect(prisma.dangerZone.create).toHaveBeenCalledWith({
        data: {
          ...input,
          type: 'Suspicious_Activity',
        },
      });
    });

    it('maps Poor Lighting, Theft, Assault, Harassment and unknown types', async () => {
      const types = [
        { in: 'Poor Lighting', expected: 'Poor_Lighting' },
        { in: 'Theft', expected: 'Theft' },
        { in: 'Assault', expected: 'Assault' },
        { in: 'Harassment', expected: 'Harassment' },
        { in: 'Unknown', expected: 'Suspicious_Activity' },
      ];

      for (const t of types) {
        prisma.dangerZone.create.mockResolvedValue({
          id: 'z',
          top: '1%',
          left: '2%',
          severity: 'low',
          type: t.expected,
          description: 'd',
          reportedAt: new Date('2026-10-24T00:00:00.000Z'),
        });

        await service.create({
          top: '1%',
          left: '2%',
          severity: 'low' as any,
          type: t.in,
          description: 'd',
        });

        expect(prisma.dangerZone.create).toHaveBeenCalledWith({
          data: {
            top: '1%',
            left: '2%',
            severity: 'low',
            type: t.expected,
            description: 'd',
          },
        });
      }
    });
  });
});
