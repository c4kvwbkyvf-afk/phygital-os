
// Implement Gemini services using Google GenAI SDK
import { GoogleGenAI } from "@google/genai";
import { ModelType } from "../types";
import { DashboardMetrics } from "./sheetService";

export const generateModuleInsight = async (moduleName: string, data: any, lang: string): Promise<string> => {
    try {
        // Use process.env.API_KEY directly as per guidelines
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const context = JSON.stringify(data);

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `Module: ${moduleName} | Données: ${context} | Langue: ${lang}`,
            config: {
                systemInstruction: "Tu es l'IA de PHYGITAL OS. Analyse ces données pour un business en Algérie. Fournis des conseils stratégiques concrets.",
            }
        });
        // .text is a property, not a method
        return response.text || "Aucune analyse générée.";
    } catch (error) {
        console.error("Gemini Insight Error:", error);
        return "L'IA est en pause pour le moment.";
    }
};

export const generateBusinessInsights = async (metrics: DashboardMetrics, lang: string): Promise<string> => {
    return generateModuleInsight("Dashboard", metrics, lang);
};

export const generateMarketingCopy = async (productDesc: string, tone: string = 'standard'): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Génère un texte publicitaire pour : ${productDesc}. Ton : ${tone}. Marché : Algérie.`,
            config: {
                systemInstruction: "Tu es un expert en copywriting publicitaire pour le marché algérien. Produis des textes captivants en français et en arabe algérien.",
            }
        });
        return response.text || "Erreur de génération du texte.";
    } catch (error) {
        console.error("Gemini Marketing Error:", error);
        return "Copywriting IA indisponible sans configuration.";
    }
};

export const generateChatResponse = async (prompt: string, history: any[]): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const chat = ai.chats.create({
            model: 'gemini-3-flash-preview',
            history: history,
            config: {
                systemInstruction: "Tu es l'assistant intelligent de PHYGITAL OS. Tu aides les e-commerçants en Algérie à optimiser leur gestion (Yalidine, stock, marketing).",
            }
        });
        
        const response = await chat.sendMessage({ message: prompt });
        return response.text || "Désolé, je ne peux pas répondre pour le moment.";
    } catch (error) {
        console.error("Gemini Chat Error:", error);
        return "Le chat IA a rencontré une erreur.";
    }
};

export const generateImage = async (prompt: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: ModelType.IMAGE, // gemini-2.5-flash-image
            contents: {
                parts: [{ text: prompt }]
            },
            config: {
                imageConfig: {
                    aspectRatio: "1:1"
                }
            }
        });

        // Iterate parts to find the image part as per guidelines
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        throw new Error("Aucune image générée dans la réponse.");
    } catch (error) {
        console.error("Gemini Image Error:", error);
        throw error;
    }
};
