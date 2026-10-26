import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AiController } from './ai.controller';

describe('AiController', () => {
  let controller: AiController;
  let aiService: any;

  beforeEach(() => {
    aiService = {
      getFakeCallScript: vi.fn(),
      getSelfDefenseTips: vi.fn(),
      safetyChat: vi.fn(),
    };
    controller = new AiController(aiService);
  });

  it('delegates getFakeCallScript to aiService', async () => {
    const mock = { callerName: 'Alex', script: ['Hello'] };
    aiService.getFakeCallScript.mockResolvedValue(mock);

    const result = await controller.getFakeCallScript();
    expect(result).toBe(mock);
    expect(aiService.getFakeCallScript).toHaveBeenCalled();
  });

  it('delegates getSelfDefenseTips to aiService', async () => {
    const mock = ['Run', 'Yell'];
    aiService.getSelfDefenseTips.mockResolvedValue(mock);

    const result = await controller.getSelfDefenseTips();
    expect(result).toBe(mock);
    expect(aiService.getSelfDefenseTips).toHaveBeenCalled();
  });

  it('delegates safetyChat to aiService with message and history', async () => {
    const mock = { response: 'Stay safe' };
    aiService.safetyChat.mockResolvedValue(mock);

    const body = { message: 'Is this area safe?', history: [] };
    const result = await controller.safetyChat(body);
    expect(result).toBe(mock);
    expect(aiService.safetyChat).toHaveBeenCalledWith(body.message, body.history);
  });
});
