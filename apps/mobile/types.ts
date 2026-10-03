export enum ModalType {
  FakeCall = 'FAKE_CALL',
  Settings = 'SETTINGS',
  FollowMe = 'FOLLOW_ME',
  CheckIn = 'CHECK_IN',
  CommunitySafety = 'COMMUNITY_SAFETY',
  ReportDangerZone = 'REPORT_DANGER_ZONE',
  SafetyAssistant = 'SAFETY_ASSISTANT',
}

export type ChatRole = 'user' | 'model';

export interface ChatMessage {
  role: ChatRole;
  text: string;
}

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
}

export interface PersonalInfo {
  fullName: string;
  bloodType: string;
  allergies: string;
}

export interface SecuritySettings {
  locationSharingEnabled: boolean;
  shareLocationOnSos: boolean;
  sendSmsOnSos: boolean;
  shakeToSosEnabled: boolean;
  voiceActivationEnabled: boolean;
  accidentDetectionEnabled: boolean;
}

export interface UserSettings {
  personalInfo: PersonalInfo;
  trustedContacts: TrustedContact[];
  security: SecuritySettings;
}

export interface FakeCallScript {
  callerName: string;
  script: string[];
}

export type DangerZoneSeverity = 'low' | 'medium' | 'high';
export type DangerZoneType = 'Theft' | 'Assault' | 'Harassment' | 'Poor Lighting' | 'Suspicious Activity';

export interface DangerZone {
  id: string;
  location: { top: string; left: string };
  severity: DangerZoneSeverity;
  type: DangerZoneType;
  description: string;
  reportedAt: string;
}

export type RootStackParamList = {
  Auth: undefined;
  Dashboard: { onLogout: () => void; };
  Settings: { onLogout: () => void; currentSettings: UserSettings; onSave: (settings: UserSettings) => Promise<void>; };
  CommunitySafety: undefined;
  FollowMe: undefined;
  CheckIn: { onEmergency: () => void; };
  FakeCall: undefined;
  ReportDangerZone: { onReport: (details: { type: DangerZoneType; severity: DangerZoneSeverity; description: string; }) => Promise<void>; };
  SafetyAssistant: undefined;
  Emergency: { settings: UserSettings; };
};

export type SettingsStackParamList = {
    SettingsRoot: { onLogout: () => void; currentSettings: UserSettings; onSave: (settings: UserSettings) => Promise<void>; };
    ProfileSettings: { currentSettings: UserSettings; onSave: (settings: UserSettings) => Promise<void>; };
    ContactSettings: { currentSettings: UserSettings; onSave: (settings: UserSettings) => Promise<void>; };
    AlertSettings: { currentSettings: UserSettings; onSave: (settings: UserSettings) => Promise<void>; };
};
