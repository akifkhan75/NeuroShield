import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SettingsController } from './settings.controller';

describe('SettingsController', () => {
  let controller: SettingsController;
  let settingsService: any;

  beforeEach(() => {
    settingsService = {
      getSettings: vi.fn(),
      updateSettings: vi.fn(),
    };
    controller = new SettingsController(settingsService);
  });

  it('delegates getSettings using user ID from request', async () => {
    const req = { user: { id: 'user-42' } };
    const mockSettings = { personalInfo: { fullName: 'Josim' } };
    settingsService.getSettings.mockResolvedValue(mockSettings);

    const result = await controller.getSettings(req);
    expect(result).toBe(mockSettings);
    expect(settingsService.getSettings).toHaveBeenCalledWith('user-42');
  });

  it('delegates updateSettings with user ID and payload', async () => {
    const req = { user: { id: 'user-42' } };
    const body = { personalInfo: { fullName: 'Josim Updated' } };
    const mockUpdated = { personalInfo: { fullName: 'Josim Updated' } };
    settingsService.updateSettings.mockResolvedValue(mockUpdated);

    const result = await controller.updateSettings(req, body);
    expect(result).toBe(mockUpdated);
    expect(settingsService.updateSettings).toHaveBeenCalledWith('user-42', body);
  });
});
