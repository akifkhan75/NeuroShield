import {Router, Request, Response} from 'express';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { FakeCallScript, ChatMessage } from '../../types';

const router = Router();

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("Gemini API key is not set. Please set the process.env.API_KEY environment variable.");
}

const getAiClient = () => {
    if (!API_KEY) {
        throw new Error("API_KEY not configured");
    }
    return new GoogleGenAI({ apiKey: API_KEY });
}

const parseJsonResponse = <T,>(text: string): T | null => {
  let jsonStr = text.trim();
  const fenceRegex = /^```(\w*)\s*\n([\s\S]*?)\n```$/;
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }
  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.error("Failed to parse JSON response:", e, "Raw text:", text);
    return null;
  }
};


router.get('/fake-call-script', async (req: Request, res: Response) => {
  try {
    const ai = getAiClient();
    const response: GenerateContentResponse | any = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: `Generate a script for a fake phone call to help someone escape an uncomfortable situation. The caller should sound like a close friend who is nearby. The script should be a few lines long to create a believable excuse.
      Return a JSON object with two keys: "callerName" (a friendly name like 'Alex' or 'Jess') and "script" (an array of strings, where each string is a line of dialogue).
      Example: {"callerName": "Maya", "script": ["Hey! Where are you?", "I'm just around the corner, we need to go, remember?", "Hurry up, I'm waiting!"]}`,
      config: {
        responseMimeType: "application/json",
        temperature: 0.8,
      },
    });

    const script = parseJsonResponse<FakeCallScript>(response.text);
    if (script) {
        res.json(script);
    } else {
        throw new Error("Failed to parse script from Gemini");
    }
  } catch (error) {
    console.error("Error fetching fake call script from Gemini:", error);
    // Provide a fallback script
    const fallbackScript = { callerName: 'Friend', script: ["Hey, are you there?", "Something came up, I need you to come meet me right now.", "I'm nearby, hurry!"] };
    res.status(500).json(fallbackScript);
  }
});


router.get('/self-defense-tips', async (req: Request, res: Response) => {
    try {
        const ai = getAiClient();
        const response: GenerateContentResponse | any = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-04-17",
        contents: `Generate a short list of 3-4 concise, actionable self-defense tips for someone in immediate danger. The tips should be easy to understand and execute under stress. Focus on creating distance and attracting attention.
        Return a JSON object with one key: "tips" (an array of strings).
        Example: {"tips": ["Yell 'FIRE!' to get attention.", "Use your keys or phone to strike at eyes or throat.", "Run towards a populated, well-lit area."]}`,
        config: {
            responseMimeType: "application/json",
            temperature: 0.7,
        },
        });

        const parsed = parseJsonResponse<{tips: string[]}>(response.text);
        if (parsed?.tips) {
            res.json(parsed.tips);
        } else {
            throw new Error("Failed to parse tips from Gemini");
        }
    } catch (error) {
        console.error("Error fetching self-defense tips from Gemini:", error);
        // Provide fallback tips
        const fallbackTips = ["Yell for help!", "Run away if possible!", "Aim for vulnerable spots."];
        res.status(500).json(fallbackTips);
    }
});

router.post('/safety-chat', async (req: Request, res: Response) => {
    try {
        const ai = getAiClient();
        const { history, message } = req.body;

        const systemInstruction = "You are InSafe, a friendly and calm personal safety assistant. Your primary goal is to provide helpful, concise, and practical safety advice. Do not provide medical or legal advice. If a user seems to be in immediate danger, strongly advise them to contact emergency services or use the app's SOS feature immediately. Keep your responses supportive and clear.";

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash-preview-04-17',
            history: history,
            config: {
                systemInstruction: systemInstruction,
            },
        });

        const response = await chat.sendMessageStream({message});

        res.setHeader('Content-Type', 'text/plain');

        for await (const chunk of response) {
            res.write(chunk.text);
        }
        res.end();
    } catch (error) {
        console.error('Error in safety chat:', error);
        res.status(500).send('Error processing your message.');
    }
});


export default router;