import { UserSettings, DangerZone, DangerZoneType, DangerZoneSeverity, FakeCallScript, PersonalInfo } from '@neuroshield/types';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getSettings(): Promise<UserSettings> {
    const response = await fetch(`${this.baseUrl}/api/v1/settings`);
    return this.handleResponse(response);
  }

  async updateSettings(settings: UserSettings): Promise<UserSettings> {
    const response = await fetch(`${this.baseUrl}/api/v1/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return this.handleResponse(response);
  }

  async getDangerZones(): Promise<DangerZone[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/danger-zones`);
    return this.handleResponse(response);
  }

  async reportDangerZone(details: { type: DangerZoneType; severity: DangerZoneSeverity; description: string; }): Promise<DangerZone> {
    const response = await fetch(`${this.baseUrl}/api/v1/danger-zones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details),
    });
    return this.handleResponse(response);
  }
}
