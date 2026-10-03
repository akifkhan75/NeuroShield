import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { FakeCallScript } from '@neuroshield/types';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private aiClient: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.API_KEY;
    if (apiKey) {
      this.aiClient = new GoogleGenAI({ apiKey });
    } else {
      this.logger.warn('Gemini API key is not set. AI features will use fallback data.');
    }
  }

  private parseJsonResponse<T>(text: string): T | null {
    let jsonStr = text.trim();
    const fenceRegex = /^```(\w*)\s*\n([\s\S]*?)\n```$/;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    try {
      return JSON.parse(jsonStr) as T;
    } catch (e) {
      this.logger.error("Failed to parse JSON response:", e, "Raw text:", text);
      return null;
    }
  }

  async getFakeCallScript(): Promise<FakeCallScript> {
    const fallbackScript: FakeCallScript = { 
      callerName: 'Friend', 
      script: ["Hey, are you there?", "Something came up, I need you to come meet me right now.", "I'm nearby, hurry!"] 
    };

    if (!this.aiClient) return fallbackScript;

    try {
      const response = await this.aiClient.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `Generate a script for a fake phone call to help someone escape an uncomfortable situation. The caller should sound like a close friend who is nearby. The script should be a few lines long to create a believable excuse.
        Return a JSON object with two keys: "callerName" (a friendly name like 'Alex' or 'Jess') and "script" (an array of strings, where each string is a line of dialogue).
        Example: {"callerName": "Maya", "script": ["Hey! Where are you?", "I'm just around the corner, we need to go, remember?", "Hurry up, I'm waiting!"]}`,
        config: {
          responseMimeType: "application/json",
          temperature: 0.8,
        },
      });

      const script = this.parseJsonResponse<FakeCallScript>(response.text);
      return script || fallbackScript;
    } catch (error) {
      this.logger.error("Error fetching fake call script from Gemini", error);
      return fallbackScript;
    }
  }

  async getSelfDefenseTips(): Promise<string[]> {
    const fallbackTips = ["Yell for help!", "Run away if possible!", "Aim for vulnerable spots."];

    if (!this.aiClient) return fallbackTips;

    try {
      const response = await this.aiClient.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `Generate a short list of 3-4 concise, actionable self-defense tips for someone in immediate danger. The tips should be easy to understand and execute under stress. Focus on creating distance and attracting attention.
        Return a JSON object with one key: "tips" (an array of strings).
        Example: {"tips": ["Yell 'FIRE!' to get attention.", "Use your keys or phone to strike at eyes or throat.", "Run towards a populated, well-lit area."]}`,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const parsed = this.parseJsonResponse<{tips: string[]}>(response.text);
      return parsed?.tips || fallbackTips;
    } catch (error) {
      this.logger.error("Error fetching self-defense tips from Gemini", error);
      return fallbackTips;
    }
  }
}
