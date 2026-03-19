
import { GoogleGenAI, Type } from "@google/genai";
import { NodeInsights, InstagramTrend, LinkedInTrend, TikTokTrend, IndustryArticle } from "../types";

let cachedApiKey = "";

const fetchConfig = async () => {
  if (cachedApiKey) return cachedApiKey;
  try {
    const res = await fetch("/api/config");
    const data = await res.json();
    cachedApiKey = data.apiKey;
    return cachedApiKey;
  } catch (e) {
    console.error("Failed to fetch config", e);
    return "";
  }
};

const getAI = async () => {
  const apiKey = await fetchConfig();
  if (!apiKey) {
    throw new Error("An API Key must be set when running in a browser");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to robustly extract and parse JSON from Gemini responses
const parseGeminiResponse = (text: string | undefined) => {
  if (!text) {
    throw new Error("Empty response from Gemini");
  }
  try {
    // 1. Try to extract from markdown code blocks
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
      return JSON.parse(match[1]);
    }
    
    // 2. Try to find the first [ or { and last ] or }
    const firstBracket = text.indexOf('[');
    const firstBrace = text.indexOf('{');
    const lastBracket = text.lastIndexOf(']');
    const lastBrace = text.lastIndexOf('}');
    
    let startIndex = -1;
    let endIndex = -1;
    
    if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
      startIndex = firstBracket;
      endIndex = lastBracket + 1;
    } else if (firstBrace !== -1) {
      startIndex = firstBrace;
      endIndex = lastBrace + 1;
    }
    
    if (startIndex !== -1 && endIndex !== -1) {
      return JSON.parse(text.substring(startIndex, endIndex));
    }
    
    // 3. Fallback to parsing the raw text
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse JSON from response:", text);
    throw error;
  }
};

export const getIndustryInsights = async (nodeLabel: string): Promise<NodeInsights> => {
  const ai = await getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the esthetician industry sub-topic: "${nodeLabel}". Provide a detailed summary, specific sub-topics/specializations, and current market trends.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "Detailed explanation of the topic." },
          subTopics: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "A list of specific areas within this topic."
          },
          marketTrends: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Current high-growth trends for this topic in the esthetician industry."
          }
        },
        required: ["summary", "subTopics", "marketTrends"]
      }
    }
  });

  try {
    return parseGeminiResponse(response.text);
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Failed to load insights");
  }
};

export const getInstagramTrends = async (): Promise<InstagramTrend[]> => {
  const ai = await getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Identify the top 10 trending topics currently popular in the Esthetician industry on Instagram for 2024-2025. For each topic, provide: 1. The topic name, 2. A catchy, professional Instagram caption (writeup), 3. A detailed prompt for Canva's AI image generation tool, and 4. A list of 5-10 high-quality hashtags.\n\nIMPORTANT: You must return the result EXACTLY as a JSON array of objects with the keys: 'topic', 'instagramWriteup', 'canvaPrompt', 'hashtags'. Do not include any other text.",
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  try {
    return parseGeminiResponse(response.text);
  } catch (error) {
    console.error("Failed to parse Instagram trends:", error);
    throw new Error("Failed to analyze Instagram sentiment.");
  }
};

export const getLinkedInTrends = async (): Promise<LinkedInTrend[]> => {
  const ai = await getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Identify the top 10 trending professional and B2B topics currently discussed in the Esthetician and Med-Spa industry on LinkedIn for 2024-2025. Focus on business growth, professional development, and clinical innovations. For each topic, provide: 1. The topic name, 2. A thought-leadership LinkedIn post (writeup), 3. A professional-grade prompt for Canva's AI image generation tool, and 4. A list of 5-10 high-quality professional hashtags.\n\nIMPORTANT: You must return the result EXACTLY as a JSON array of objects with the keys: 'topic', 'linkedinWriteup', 'canvaPrompt', 'hashtags'. Do not include any other text.",
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  try {
    return parseGeminiResponse(response.text);
  } catch (error) {
    console.error("Failed to parse LinkedIn trends:", error);
    throw new Error("Failed to analyze LinkedIn sentiment.");
  }
};

export const getTikTokTrends = async (): Promise<TikTokTrend[]> => {
  const ai = await getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Identify the top 10 trending short-form video topics currently viral in the Esthetician and Skincare community on TikTok for 2024-2025. Focus on visual transformations, 'get ready with me' (GRWM) style content, and educational hooks.

For each topic provide:
1. topic: The topic name
2. tiktokScript: A short, engaging TikTok hook and script (2-3 sentences)
3. canvaPrompt: A single overall Canva AI image prompt for the thumbnail cover
4. carouselSlides: An array of 5 to 7 TikTok CAROUSEL slides. TikTok carousels are photo slideshows (1080x1920px portrait, 9:16 ratio). Each slide must have:
   - slideNumber (1-based integer)
   - type: one of HOOK (slide 1 - bold eye-catching opener), CONTENT (middle educational/tips slides), TIP (quick actionable tip), or CTA (final slide - save/follow call to action)
   - imagePrompt: A detailed Canva AI image generation prompt specific to that single slide. Include: background scene/visual, color palette (use TikTok-native aesthetics: clean whites, pinks, teals, or bold contrast), layout style, and any props or skincare products relevant to the topic. Optimized for 1080x1920px portrait carousel format.
   - textOverlay: The exact bold text to display on that slide (short, punchy, TikTok style)
5. hashtags: A list of 5-10 trending TikTok hashtags

IMPORTANT: Return EXACTLY as a JSON array. No other text.`,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  try {
    return parseGeminiResponse(response.text);
  } catch (error) {
    console.error("Failed to parse TikTok trends:", error);
    throw new Error("Failed to analyze TikTok sentiment.");
  }
};

export const getIndustryArticles = async (): Promise<IndustryArticle[]> => {
  const ai = await getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: "Perform a Google Search to find 15 real, recent, and significant articles, news stories, or advertisements from the Esthetician and Skincare industry published within the last 7 days. You MUST use the actual URLs found in the search results. Do not provide any URL that you have not verified exists. For each item, provide: 1. The article title, 2. A concise summary, 3. The source name, 4. The EXACT URL from the search result, and 5. The publication date.\n\nIMPORTANT: You must return the result EXACTLY as a JSON array of objects with the keys: 'title', 'summary', 'sourceName', 'sourceUrl', 'date'. Do not include any other text.",
    config: {
      systemInstruction: "You are a precise research assistant. Your primary goal is to provide 100% accurate and verifiable links. Use the Google Search tool to find actual industry news. For every article you list, you must provide the direct, functional URL to that specific article. Hallucinating URLs or providing broken links is strictly prohibited. Always output valid JSON.",
      tools: [{ googleSearch: {} }]
    }
  });

  try {
    return parseGeminiResponse(response.text);
  } catch (error) {
    console.error("Failed to parse industry articles:", error);
    console.error("Raw response:", response.text);
    throw new Error("Failed to fetch industry trends.");
  }
};
