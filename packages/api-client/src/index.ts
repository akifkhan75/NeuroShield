import { UserSettings, DangerZone, DangerZoneType, DangerZoneSeverity, FakeCallScript, PersonalInfo } from '@neuroshield/types';

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string, token: string | null = null) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private getHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = { ...extraHeaders };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getSettings(): Promise<UserSettings> {
    const response = await fetch(`${this.baseUrl}/api/v1/settings`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateSettings(settings: UserSettings): Promise<UserSettings> {
    const response = await fetch(`${this.baseUrl}/api/v1/settings`, {
      method: 'PUT',
      headers: this.getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(settings),
    });
    return this.handleResponse(response);
  }

  async getDangerZones(): Promise<DangerZone[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/danger-zones`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async reportDangerZone(details: { type: DangerZoneType; severity: DangerZoneSeverity; description: string; }): Promise<DangerZone> {
    const response = await fetch(`${this.baseUrl}/api/v1/danger-zones`, {
      method: 'POST',
      headers: this.getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(details),
    });
    return this.handleResponse(response);
  }
}

