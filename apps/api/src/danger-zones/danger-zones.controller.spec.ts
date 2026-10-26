import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DangerZonesController } from './danger-zones.controller';

describe('DangerZonesController', () => {
  let controller: DangerZonesController;
  let dangerZonesService: any;

  beforeEach(() => {
    dangerZonesService = {
      findAll: vi.fn(),
      create: vi.fn(),
    };
    controller = new DangerZonesController(dangerZonesService);
  });

  it('delegates findAll to dangerZonesService.findAll', async () => {
    const mockZones = [{ id: '1', location: { top: '50%', left: '50%' } }];
    dangerZonesService.findAll.mockResolvedValue(mockZones);

    const result = await controller.findAll();
    expect(result).toBe(mockZones);
    expect(dangerZonesService.findAll).toHaveBeenCalled();
  });

  it('delegates create to dangerZonesService.create with generated coordinates', async () => {
    const req = { user: { id: 'user-123' } };
    const body = {
      severity: 'high' as const,
      type: 'Theft' as const,
      description: 'Stolen backpack',
    };

    const mockCreated = { id: 'zone-1', ...body, location: { top: '50%', left: '50%' } };
    dangerZonesService.create.mockResolvedValue(mockCreated);

    const result = await controller.create(req, body);
    expect(result).toBe(mockCreated);
    expect(dangerZonesService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'high',
        type: 'Theft',
        description: 'Stolen backpack',
        userId: 'user-123',
      })
    );
  });
});
