import { UserSettings, DangerZone, DangerZoneType, DangerZoneSeverity, FakeCallScript, PersonalInfo } from '@lumo/types';
import { ApiClient } from '@lumo/api-client';

const LAN_IP = '192.168.100.81';
export const API_BASE_URL = `http://${LAN_IP}:3005`;

const apiClient = new ApiClient(API_BASE_URL);

let currentToken: string | null = null;

export const setAuthToken = (token: string | null) => {
    currentToken = token;
    apiClient.setToken(token);
};

export const getAuthToken = () => currentToken;

// Auth
export const login = async (email: string, password: string): Promise<{user: PersonalInfo; token: string}> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    console.log('resp', response);
    if (!response.ok) throw new Error('HTTP error');
    const data = await response.json();
    if (data.token) {
        setAuthToken(data.token);
    }
    return data;
};

export const signup = async (name: string, email: string, password: string): Promise<{user: PersonalInfo; token: string}> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: name, name, email, password }),
    });
    if (!response.ok) throw new Error('HTTP error');
    const data = await response.json();
    if (data.token) {
        setAuthToken(data.token);
    }
    return data;
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
    return apiClient.getFakeCallScript();
};

export const getSelfDefenseTips = async (): Promise<string[]> => {
    return apiClient.getSelfDefenseTips();
};

export const safetyChat = async (message: string, history?: any[]): Promise<{ response: string }> => {
    return apiClient.safetyChat(message, history);
};


