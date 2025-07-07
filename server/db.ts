
import { UserSettings, DangerZone, DangerZoneType, DangerZoneSeverity } from '../types';

// In-memory store to simulate a database.

interface User {
  email: string;
  passwordHash: string; // In a real app, this would be a bcrypt hash
  settings: UserSettings;
}

const initialSettings: UserSettings = {
  personalInfo: {
    fullName: 'Josim',
    bloodType: 'O+',
    allergies: 'None',
  },
  trustedContacts: [
    { id: '1', name: 'Mom', phone: '111-222-3333' },
    { id: '2', name: 'Emergency Services', phone: '911' },
  ],
  security: {
    locationSharingEnabled: true,
    shareLocationOnSos: true,
    sendSmsOnSos: false,
    shakeToSosEnabled: true,
    voiceActivationEnabled: true,
    accidentDetectionEnabled: false,
  },
};

const users: Map<string, User> = new Map([
    ['josim@example.com', {
        email: 'josim@example.com',
        passwordHash: 'password', // Storing plain text for simplicity. DO NOT DO THIS IN PRODUCTION.
        settings: initialSettings,
    }]
]);

const dangerZones: DangerZone[] = [
  {
    id: 'dz1',
    location: { top: '45%', left: '60%' },
    severity: 'high',
    type: 'Assault',
    description: 'A physical assault was reported here last night.',
    reportedAt: new Date().toISOString(),
  },
  {
    id: 'dz2',
    location: { top: '70%', left: '30%' },
    severity: 'medium',
    type: 'Theft',
    description: 'Multiple reports of pickpocketing in this area.',
    reportedAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
  },
  {
    id: 'dz3',
    location: { top: '30%', left: '25%' },
    severity: 'low',
    type: 'Poor Lighting',
    description: 'Streetlight is out, making the area very dark at night.',
    reportedAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
  },
];

// --- For simplicity, we'll operate on a single mock user's data ---
// This avoids implementing a full authentication/session management system.
const MOCK_USER_EMAIL = 'josim@example.com';

export const db = {
    getUser: (email: string) => users.get(email),
    createUser: (email: string, passwordHash: string, fullName: string) => {
        if (users.has(email)) return null;
        const newUser: User = {
            email,
            passwordHash,
            settings: {
                ...initialSettings,
                personalInfo: { ...initialSettings.personalInfo, fullName }
            }
        }
        users.set(email, newUser);
        return newUser;
    },
    
    getSettings: () => users.get(MOCK_USER_EMAIL)!.settings,
    updateSettings: (newSettings: UserSettings) => {
        const user = users.get(MOCK_USER_EMAIL);
        if (user) {
            user.settings = newSettings;
            return user.settings;
        }
        return null;
    },

    getDangerZones: () => dangerZones,
    addDangerZone: (details: { type: DangerZoneType; severity: DangerZoneSeverity; description: string; }) => {
        const newZone: DangerZone = {
            id: `dz-${Date.now()}`,
            location: {
                top: `${48 + Math.random() * 4}%`,
                left: `${48 + Math.random() * 4}%`
            },
            ...details,
            reportedAt: new Date().toISOString(),
        };
        dangerZones.push(newZone);
        return newZone;
    },
};