import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { trustedContacts: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      personalInfo: {
        fullName: user.fullName,
        bloodType: user.bloodType || '',
        allergies: user.allergies || '',
      },
      trustedContacts: user.trustedContacts.map(c => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
      })),
      security: {
        locationSharingEnabled: user.locationSharingEnabled,
        shareLocationOnSos: user.shareLocationOnSos,
        sendSmsOnSos: user.sendSmsOnSos,
        shakeToSosEnabled: user.shakeToSosEnabled,
        voiceActivationEnabled: user.voiceActivationEnabled,
        accidentDetectionEnabled: user.accidentDetectionEnabled,
      },
    };
  }

  async updateSettings(userId: string, data: any) {
    // In a real app we'd validate this with DTOs
    const { personalInfo, security, trustedContacts } = data;

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: personalInfo?.fullName,
        bloodType: personalInfo?.bloodType,
        allergies: personalInfo?.allergies,
        locationSharingEnabled: security?.locationSharingEnabled,
        shareLocationOnSos: security?.shareLocationOnSos,
        sendSmsOnSos: security?.sendSmsOnSos,
        shakeToSosEnabled: security?.shakeToSosEnabled,
        voiceActivationEnabled: security?.voiceActivationEnabled,
        accidentDetectionEnabled: security?.accidentDetectionEnabled,
      },
      include: { trustedContacts: true },
    });

    // Update contacts (simplified: delete all and recreate)
    if (trustedContacts && Array.isArray(trustedContacts)) {
      await this.prisma.trustedContact.deleteMany({
        where: { userId },
      });
      await this.prisma.trustedContact.createMany({
        data: trustedContacts.map(c => ({
          name: c.name,
          phone: c.phone,
          userId,
        })),
      });
    }

    return this.getSettings(userId);
  }
}
