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
  location: { top: string; left: string }; // Using percentage strings for positioning on the map image
  severity: DangerZoneSeverity;
  type: DangerZoneType;
  description: string;
  reportedAt: string; // ISO date string
}
