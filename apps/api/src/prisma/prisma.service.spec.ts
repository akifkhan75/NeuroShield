import { describe, it, expect, vi } from 'vitest';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  it('connects onModuleInit and disconnects onModuleDestroy', async () => {
    const service = new PrismaService();
    service.$connect = vi.fn().mockResolvedValue(undefined as never);
    service.$disconnect = vi.fn().mockResolvedValue(undefined as never);

    await service.onModuleInit();
    expect(service.$connect).toHaveBeenCalled();

    await service.onModuleDestroy();
    expect(service.$disconnect).toHaveBeenCalled();
  });
});
