import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AiService } from './ai.service';

describe('AiService', () => {
  let service: AiService;

  beforeEach(() => {
    delete process.env.API_KEY;
    service = new AiService();
  });

  describe('without API_KEY (fallback mode)', () => {
    it('returns fallback fake call script', async () => {
      const result = await service.getFakeCallScript();
      expect(result).toHaveProperty('callerName');
      expect(result).toHaveProperty('script');
      expect(Array.isArray(result.script)).toBe(true);
      expect(result.script.length).toBeGreaterThan(0);
    });

    it('returns fallback self defense tips', async () => {
      const tips = await service.getSelfDefenseTips();
      expect(Array.isArray(tips)).toBe(true);
      expect(tips.length).toBeGreaterThan(0);
      expect(tips[0]).toContain('Yell');
    });

    it('returns fallback safety chat advice', async () => {
      const chat = await service.safetyChat('Is this dark street safe?');
      expect(chat).toHaveProperty('response');
      expect(chat.response).toContain('Stay alert');
    });
  });

  describe('with GoogleGenAI mock', () => {
    let mockGenerateContent: any;

    beforeEach(() => {
      mockGenerateContent = vi.fn();
      (service as any).aiClient = {
        models: {
          generateContent: mockGenerateContent,
        },
      };
    });

    it('parses valid JSON response for fake call script', async () => {
      mockGenerateContent.mockResolvedValue({
        text: '{"callerName": "Maya", "script": ["Hey! Where are you?", "Hurry up!"]}',
      });

      const script = await service.getFakeCallScript();
      expect(script.callerName).toBe('Maya');
      expect(script.script).toEqual(['Hey! Where are you?', 'Hurry up!']);
    });

    it('parses markdown code-fenced JSON for fake call script', async () => {
      mockGenerateContent.mockResolvedValue({
        text: '```json\n{"callerName": "Maya", "script": ["Come on!"]}\n```',
      });

      const script = await service.getFakeCallScript();
      expect(script.callerName).toBe('Maya');
      expect(script.script).toEqual(['Come on!']);
    });

    it('returns fallback if Gemini returns invalid JSON', async () => {
      mockGenerateContent.mockResolvedValue({
        text: 'Not a JSON response',
      });

      const script = await service.getFakeCallScript();
      expect(script.callerName).toBe('Friend');
    });

    it('returns fallback on API call error', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Quota exceeded'));

      const script = await service.getFakeCallScript();
      expect(script.callerName).toBe('Friend');
    });

    it('parses self defense tips from valid JSON', async () => {
      mockGenerateContent.mockResolvedValue({
        text: '{"tips": ["Tip 1", "Tip 2"]}',
      });

      const tips = await service.getSelfDefenseTips();
      expect(tips).toEqual(['Tip 1', 'Tip 2']);
    });

    it('initializes GoogleGenAI when API_KEY is present', () => {
      process.env.API_KEY = 'mock-key';
      const svc = new AiService();
      expect((svc as any).aiClient).toBeDefined();
    });

    it('returns fallback self defense tips on error', async () => {
      mockGenerateContent.mockRejectedValue(new Error('AI failure'));
      const tips = await service.getSelfDefenseTips();
      expect(tips).toEqual(["Yell for help!", "Run away if possible!", "Aim for vulnerable spots."]);
    });

    it('returns fallback safety chat on error', async () => {
      mockGenerateContent.mockRejectedValue(new Error('AI chat failure'));
      const chat = await service.safetyChat('help');
      expect(chat.response).toContain('Stay alert');
    });

    it('returns fallback response if response text is empty in safetyChat', async () => {
      mockGenerateContent.mockResolvedValue({ text: '' });
      const chat = await service.safetyChat('help');
      expect(chat.response).toContain('Stay alert');
    });
  });
});
