import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export async function summarizeSync(source: string, content: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Source: ${source}\nContent: ${content}`,
    config: {
      systemInstruction: "You are an AI founder assistant. Summarize the provided content into a concise, professional founder update (3-4 sentences max). Highlight key decisions or progress.",
    },
  });
  return response.text;
}

export async function extractTasks(content: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: content,
    config: {
      systemInstruction: "Extract actionable tasks from the provided meeting notes or sync update. Return them as a JSON array of objects with 'title', 'description', 'priority' (low/medium/high), and 'assignedTo' (common name if mentioned, otherwise leave empty).",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            priority: { type: Type.STRING, enum: ["low", "medium", "high"] },
            assignedTo: { type: Type.STRING }
          },
          required: ["title", "description", "priority"]
        }
      }
    },
  });
  return JSON.parse(response.text);
}

export async function getAIEcosystemUpdate(currentStack: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Current Tech Stack: ${currentStack}\nDate: ${new Date().toLocaleDateString()}`,
    config: {
      systemInstruction: "You are a technical strategist for a startup. Provide one critical AI ecosystem update (model release, framework Change, pricing update) that specifically impacts this startup's tech stack. Include: title, content (2 sentences), impact (1 sentence on why it matters to them), category (model/framework/pricing/deprecation).",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING },
          impact: { type: Type.STRING },
          category: { type: Type.STRING, enum: ["model", "framework", "pricing", "deprecation"] }
        },
        required: ["title", "content", "impact", "category"]
      }
    },
  });
  return JSON.parse(response.text);
}
