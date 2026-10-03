import { PrismaClient, DangerZoneType, DangerZoneSeverity } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create mock user
  const user = await prisma.user.upsert({
    where: { email: 'josim@example.com' },
    update: {},
    create: {
      email: 'josim@example.com',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$dummyhash', // Placeholder hash
      fullName: 'Josim',
      bloodType: 'O+',
      allergies: 'None',
      locationSharingEnabled: true,
      shareLocationOnSos: true,
      sendSmsOnSos: false,
      shakeToSosEnabled: true,
      voiceActivationEnabled: false,
      accidentDetectionEnabled: false,
      trustedContacts: {
        create: [
          { name: 'Mom', phone: '111-222-3333' },
          { name: 'Emergency Services', phone: '911' },
        ],
      },
    },
  });

  // Create initial danger zones
  const dangerZones = [
    {
      top: '45%',
      left: '60%',
      severity: DangerZoneSeverity.high,
      type: DangerZoneType.Assault,
      description: 'A physical assault was reported here last night.',
      userId: user.id,
    },
    {
      top: '70%',
      left: '30%',
      severity: DangerZoneSeverity.medium,
      type: DangerZoneType.Theft,
      description: 'Multiple reports of pickpocketing in this area.',
      userId: user.id,
    },
    {
      top: '30%',
      left: '25%',
      severity: DangerZoneSeverity.low,
      type: DangerZoneType.Poor_Lighting,
      description: 'Streetlight is out, making the area very dark at night.',
      userId: user.id,
    },
  ];

  for (const zone of dangerZones) {
    await prisma.dangerZone.create({
      data: zone,
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
