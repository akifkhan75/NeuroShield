import { Platform } from 'react-native';
import { UserSettings, DangerZone, DangerZoneType, DangerZoneSeverity, FakeCallScript, PersonalInfo } from '../types';

const API_BASE_URL_IOS = 'http://localhost:3001';
const API_BASE_URL_ANDROID = 'http://10.0.2.2:3001';

export const API_BASE_URL = Platform.OS === 'ios' ? API_BASE_URL_IOS : API_BASE_URL_ANDROID;

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

// Auth
export const login = async (email: string, password: string): Promise<{user: PersonalInfo}> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
};

export const signup = async (name: string, email: string, password: string): Promise<{user: PersonalInfo}> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    });
    return handleResponse(response);
};

// Settings
export const getSettings = async (): Promise<UserSettings> => {
    const response = await fetch(`${API_BASE_URL}/api/settings`);
    return handleResponse(response);
};

export const updateSettings = async (settings: UserSettings): Promise<UserSettings> => {
    const response = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
    });
    return handleResponse(response);
};

// Danger Zones
export const getDangerZones = async (): Promise<DangerZone[]> => {
    const response = await fetch(`${API_BASE_URL}/api/danger-zones`);
    return handleResponse(response);
};

export const reportDangerZone = async (details: { type: DangerZoneType; severity: DangerZoneSeverity; description: string; }): Promise<DangerZone> => {
    const response = await fetch(`${API_BASE_URL}/api/danger-zones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details),
    });
    return handleResponse(response);
};

// AI Services
export const getFakeCallScript = async (): Promise<FakeCallScript> => {
    const response = await fetch(`${API_BASE_URL}/api/ai/fake-call-script`);
    return handleResponse(response);
};

export const getSelfDefenseTips = async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/api/ai/self-defense-tips`);
    return handleResponse(response);
};
