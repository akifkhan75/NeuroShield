import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from './index';

describe('ApiClient', () => {
  let client: ApiClient;
  const baseUrl = 'http://localhost:3005';

  beforeEach(() => {
    client = new ApiClient(baseUrl);
    vi.restoreAllMocks();
  });

  it('initializes with base URL and optional token', () => {
    const clientWithToken = new ApiClient('http://localhost:3005/', 'test-token');
    expect(clientWithToken.getToken()).toBe('test-token');
  });

  it('sets and gets authorization token correctly', () => {
    expect(client.getToken()).toBeNull();
    client.setToken('new-token-123');
    expect(client.getToken()).toBe('new-token-123');
    client.setToken(null);
    expect(client.getToken()).toBeNull();
  });

  it('performs login successfully and stores token', async () => {
    const mockAuthResponse = {
      user: { fullName: 'Josim', email: 'josim@example.com' },
      token: 'jwt-auth-token-123',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockAuthResponse,
    } as any);

    const result = await client.login('josim@example.com', 'password');
    expect(result).toEqual(mockAuthResponse);
    expect(client.getToken()).toBe('jwt-auth-token-123');
    expect(global.fetch).toHaveBeenCalledWith(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'josim@example.com', password: 'password' }),
    });
  });

  it('performs signup successfully and stores token', async () => {
    const mockAuthResponse = {
      user: { fullName: 'New User', email: 'new@example.com' },
      token: 'jwt-signup-token-456',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockAuthResponse,
    } as any);

    const result = await client.signup('New User', 'new@example.com', 'password123');
    expect(result).toEqual(mockAuthResponse);
    expect(client.getToken()).toBe('jwt-signup-token-456');
    expect(global.fetch).toHaveBeenCalledWith(`${baseUrl}/api/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'New User', name: 'New User', email: 'new@example.com', password: 'password123' }),
    });
  });

  it('throws descriptive error on failed HTTP responses', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Invalid credentials' }),
    } as any);

    await expect(client.login('bad@example.com', 'wrong')).rejects.toThrow('Invalid credentials');
  });

  it('handles error when response JSON is not parseable', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('Parse error');
      },
    } as any);

    await expect(client.getSettings()).rejects.toThrow('An unknown error occurred');
  });

  it('fetches settings with auth header', async () => {
    client.setToken('auth-token');
    const mockSettings = {
      personalInfo: { fullName: 'Josim' },
      contacts: [],
      security: { locationSharingEnabled: true },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockSettings,
    } as any);

    const settings = await client.getSettings();
    expect(settings).toEqual(mockSettings);
    expect(global.fetch).toHaveBeenCalledWith(`${baseUrl}/api/v1/settings`, {
      headers: { Authorization: 'Bearer auth-token' },
    });
  });

  it('updates settings with PUT request', async () => {
    client.setToken('auth-token');
    const updatedSettings = {
      personalInfo: { fullName: 'Josim Updated' },
      contacts: [],
      security: { locationSharingEnabled: false },
    } as any;

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => updatedSettings,
    } as any);

    const result = await client.updateSettings(updatedSettings);
    expect(result).toEqual(updatedSettings);
    expect(global.fetch).toHaveBeenCalledWith(`${baseUrl}/api/v1/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer auth-token',
      },
      body: JSON.stringify(updatedSettings),
    });
  });

  it('fetches danger zones', async () => {
    client.setToken('auth-token');
    const mockZones = [
      { id: '1', location: { top: '50%', left: '50%' }, severity: 'high', type: 'Theft' },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockZones,
    } as any);

    const zones = await client.getDangerZones();
    expect(zones).toEqual(mockZones);
  });

  it('reports a danger zone', async () => {
    client.setToken('auth-token');
    const newZone = {
      type: 'Suspicious Activity' as const,
      severity: 'medium' as const,
      description: 'Suspicious individual observed near park',
    };

    const mockCreated = { id: '2', ...newZone, location: { top: '49%', left: '50%' } };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockCreated,
    } as any);

    const result = await client.reportDangerZone(newZone);
    expect(result).toEqual(mockCreated);
    expect(global.fetch).toHaveBeenCalledWith(`${baseUrl}/api/v1/danger-zones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer auth-token',
      },
      body: JSON.stringify(newZone),
    });
  });

  it('fetches fake call script from AI endpoint', async () => {
    client.setToken('auth-token');
    const mockScript = {
      callerName: 'Alex',
      script: ['Hey, where are you?', 'Come over quickly!'],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockScript,
    } as any);

    const script = await client.getFakeCallScript();
    expect(script).toEqual(mockScript);
    expect(global.fetch).toHaveBeenCalledWith(`${baseUrl}/api/v1/ai/fake-call-script`, {
      headers: { Authorization: 'Bearer auth-token' },
    });
  });

  it('fetches self defense tips from AI endpoint', async () => {
    client.setToken('auth-token');
    const mockTips = ["Yell 'FIRE!'", 'Run towards well-lit areas'];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockTips,
    } as any);

    const tips = await client.getSelfDefenseTips();
    expect(tips).toEqual(mockTips);
    expect(global.fetch).toHaveBeenCalledWith(`${baseUrl}/api/v1/ai/self-defense-tips`, {
      headers: { Authorization: 'Bearer auth-token' },
    });
  });

  it('interacts with safety chat assistant', async () => {
    client.setToken('auth-token');
    const mockChatResponse = { response: 'Stay in a populated area and call for assistance.' };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockChatResponse,
    } as any);

    const response = await client.safetyChat('Is this area safe?');
    expect(response).toEqual(mockChatResponse);
    expect(global.fetch).toHaveBeenCalledWith(`${baseUrl}/api/v1/ai/safety-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer auth-token',
      },
      body: JSON.stringify({ message: 'Is this area safe?', history: [] }),
    });
  });
});
