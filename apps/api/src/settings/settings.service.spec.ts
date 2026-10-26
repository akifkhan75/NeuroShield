import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SettingsService } from './settings.service';
import { NotFoundException } from '@nestjs/common';

describe('SettingsService', () => {
  let service: SettingsService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      trustedContact: {
        deleteMany: vi.fn(),
        createMany: vi.fn(),
      },
    };
    service = new SettingsService(prisma);
  });

  describe('getSettings', () => {
    it('returns formatted settings when user is found', async () => {
      const mockUser = {
        id: 'user-1',
        fullName: 'Josim',
        bloodType: 'O+',
        allergies: 'Peanuts',
        locationSharingEnabled: true,
        shareLocationOnSos: true,
        sendSmsOnSos: true,
        shakeToSosEnabled: false,
        voiceActivationEnabled: false,
        accidentDetectionEnabled: true,
        trustedContacts: [
          { id: 'c1', name: 'Mom', phone: '+1234567890' },
        ],
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getSettings('user-1');
      expect(result.personalInfo.fullName).toBe('Josim');
      expect(result.personalInfo.bloodType).toBe('O+');
      expect(result.personalInfo.allergies).toBe('Peanuts');
      expect(result.trustedContacts).toEqual([{ id: 'c1', name: 'Mom', phone: '+1234567890' }]);
      expect(result.security.locationSharingEnabled).toBe(true);
      expect(result.security.accidentDetectionEnabled).toBe(true);
    });

    it('throws NotFoundException when user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getSettings('unknown-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateSettings', () => {
    it('updates user attributes and replaces trusted contacts', async () => {
      const updateData = {
        personalInfo: { fullName: 'Josim Updated', bloodType: 'B+', allergies: 'None' },
        security: { locationSharingEnabled: false },
        trustedContacts: [{ name: 'Dad', phone: '+9876543210' }],
      };

      const updatedUser = {
        id: 'user-1',
        fullName: 'Josim Updated',
        bloodType: 'B+',
        allergies: 'None',
        locationSharingEnabled: false,
        shareLocationOnSos: true,
        sendSmsOnSos: true,
        shakeToSosEnabled: false,
        voiceActivationEnabled: false,
        accidentDetectionEnabled: false,
        trustedContacts: [{ id: 'c2', name: 'Dad', phone: '+9876543210' }],
      };

      prisma.user.update.mockResolvedValue(updatedUser);
      prisma.user.findUnique.mockResolvedValue(updatedUser);

      const result = await service.updateSettings('user-1', updateData);
      expect(prisma.user.update).toHaveBeenCalled();
      expect(prisma.trustedContact.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
      expect(prisma.trustedContact.createMany).toHaveBeenCalledWith({
        data: [{ name: 'Dad', phone: '+9876543210', userId: 'user-1' }],
      });
      expect(result.personalInfo.fullName).toBe('Josim Updated');
    });
  });
});
