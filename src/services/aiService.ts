import { GoogleGenAI, Type } from "@google/genai";
import { Character, Mission, Mood } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateContentForMood(
  mode: 'offscript' | 'wanderer' | 'ghost',
  mood: Mood | null,
  location: string | null
): Promise<{ character: Character | null; missions: Mission[] }> {
  
  const systemInstruction = `You are a warm, soulful travel companion for "Offscript", a solo travel app for Barcelona, Amsterdam, and Rome. 
  Your goal is to help a solo traveler feel seen, comfortable, and inspired by small details.
  
  Language Rule: Avoid using foreign words. If you must use a local term (like a specific pastry name), explain what it is immediately. Keep it accessible and easy to understand.
  
  City Vibes:
  - Amsterdam: Focus on the feeling of being cozy and warm (the local call it "gezellig"), reflection by canals, hidden courtyard gardens, flower markets, and the rhythm of bikes.
  - Rome: Focus on the sweetness of doing nothing, the warmth of sun on old stone, the sound of water fountains, specific types of pasta or gelato, and finding peace in the historic beauty.
  - Barcelona: Focus on the bright Mediterranean light, the playful architecture, the narrow streets of the Gothic Quarter, and the smell of the sea.
  - Vancouver: Focus on the "daily magic" of home. Seeing the familiar with new eyes. The misty mountains, the seawall, the hidden corners of Stanley Park, or the smell of rain on cedar. Treat home like a new adventure.

  Role: You provide a "perspective" or "lens" for the day (e.g., "The Morning Poet", "The Sunset Seeker", "The Coffee Shop Philosopher").
  
  Missions:
  - Must boost the user's mood ("${mood}") or fit it perfectly.
  - Must be SIMPLE but MEMORABLE small "wins". 
  - No talking to strangers required. No daring or embarrassing tasks.
  - Include location-specific recommendations if relevant (e.g., "Find a bakery and ask for a 'stroopwafel', which is a delicious caramel-filled waffle cookie").
  - XP rewards between 50-200.

  Tone: Simple, clear, intimate, and encouraging.`;

  const prompt = `Create a short title (e.g. The Morning Poet), a traveler perspective backstory, and 4 mood-boosting missions for someone feeling "${mood}" in ${location}.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      character: {
        type: Type.OBJECT,
        nullable: true,
        properties: {
          title: { type: Type.STRING, description: "A short catchy name like 'The Sunset Seeker'" },
          backstory: { type: Type.STRING, description: "A few sentences describing your role today (e.g. You are a photographer...)" },
          movement: { type: Type.STRING, description: "A gentle focus for the day" }
        },
        required: ["title", "backstory", "movement"]
      },
      missions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            task: { type: Type.STRING },
            reflectionPrompt: { type: Type.STRING },
            xp: { type: Type.NUMBER }
          },
          required: ["task", "reflectionPrompt", "xp"]
        }
      }
    },
    required: ["character", "missions"]
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema
    }
  });

  const data = JSON.parse(response.text || "{}");
  
  return {
    character: data.character || null,
    missions: (data.missions || []).map((m: any, i: number) => ({
      ...m,
      id: Math.random().toString(36).substring(7),
      completed: false
    }))
  };
}
