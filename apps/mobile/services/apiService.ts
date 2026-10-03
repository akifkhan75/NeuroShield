import { Platform } from 'react-native';
import { UserSettings, DangerZone, DangerZoneType, DangerZoneSeverity, FakeCallScript, PersonalInfo } from '@neuroshield/types';
import { ApiClient } from '@neuroshield/api-client';

const API_BASE_URL_IOS = 'http://192.168.100.220:3001';
const API_BASE_URL_ANDROID = 'http://10.0.2.2:3001';

export const API_BASE_URL = Platform.OS === 'ios' ? API_BASE_URL_IOS : API_BASE_URL_ANDROID;

const apiClient = new ApiClient(API_BASE_URL);

// Auth
export const login = async (email: string, password: string): Promise<{user: PersonalInfo}> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    console.log('resp', response)
    if (!response.ok) throw new Error('HTTP error');
    return response.json();
};

export const signup = async (name: string, email: string, password: string): Promise<{user: PersonalInfo}> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    });
    if (!response.ok) throw new Error('HTTP error');
    return response.json();
};

// Settings
export const getSettings = async (): Promise<UserSettings> => {
    return apiClient.getSettings();
};

export const updateSettings = async (settings: UserSettings): Promise<UserSettings> => {
    return apiClient.updateSettings(settings);
};

// Danger Zones
export const getDangerZones = async (): Promise<DangerZone[]> => {
    return apiClient.getDangerZones();
};

export const reportDangerZone = async (details: { type: DangerZoneType; severity: DangerZoneSeverity; description: string; }): Promise<DangerZone> => {
    return apiClient.reportDangerZone(details);
};

// AI Services
export const getFakeCallScript = async (): Promise<FakeCallScript> => {
    const response = await fetch(`${API_BASE_URL}/api/ai/fake-call-script`);
    if (!response.ok) throw new Error('HTTP error');
    return response.json();
};

export const getSelfDefenseTips = async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/api/ai/self-defense-tips`);
    if (!response.ok) throw new Error('HTTP error');
    return response.json();
};
