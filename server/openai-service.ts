import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface PostImprovement {
  improvedContent: string;
  suggestions: string[];
  hashtags: string[];
  tone: string;
  engagement_score: number;
}

export class OpenAIService {
  async improvePost(content: string, platforms: string[], targetAudience?: string): Promise<PostImprovement> {
    const prompt = `
You are a social media expert. Analyze and improve the following post content:

Original Content: "${content}"
Target Platforms: ${platforms.join(", ")}
${targetAudience ? `Target Audience: ${targetAudience}` : ""}

Please provide improvements in the following JSON format:
{
  "improvedContent": "Enhanced version of the post with better engagement potential",
  "suggestions": ["Specific suggestion 1", "Specific suggestion 2", "Specific suggestion 3"],
  "hashtags": ["relevant", "hashtags", "for", "the", "post"],
  "tone": "professional/casual/humorous/inspirational",
  "engagement_score": 85
}

Focus on:
- Making the content more engaging and shareable
- Optimizing for the specific platforms
- Adding emotional hooks
- Improving readability
- Suggesting relevant hashtags
- Predicting engagement potential (1-100)
`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system", 
            content: "You are an expert social media strategist. Always respond with valid JSON only."
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 1000,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        improvedContent: result.improvedContent || content,
        suggestions: result.suggestions || [],
        hashtags: result.hashtags || [],
        tone: result.tone || "neutral",
        engagement_score: result.engagement_score || 50,
      };
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw new Error("Failed to improve post content");
    }
  }

  async generateHashtags(content: string, platforms: string[]): Promise<string[]> {
    const prompt = `
Generate relevant hashtags for this social media post:
Content: "${content}"
Platforms: ${platforms.join(", ")}

Return only a JSON array of hashtags without the # symbol:
["hashtag1", "hashtag2", "hashtag3"]
`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: "Generate relevant hashtags. Respond with JSON array only." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.5,
        max_tokens: 200,
      });

      const result = JSON.parse(response.choices[0].message.content || "[]");
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error("OpenAI hashtag generation error:", error);
      return [];
    }
  }

  async suggestBestPostingTime(content: string, platforms: string[]): Promise<{
    recommendations: Array<{
      platform: string;
      time: string;
      reason: string;
    }>;
  }> {
    const prompt = `
Analyze this content and suggest optimal posting times for each platform:
Content: "${content}"
Platforms: ${platforms.join(", ")}

Provide recommendations in JSON format:
{
  "recommendations": [
    {
      "platform": "facebook",
      "time": "2:00 PM",
      "reason": "Peak engagement hours for professional content"
    }
  ]
}
`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: "You are a social media timing expert. Respond with JSON only." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 500,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return result;
    } catch (error) {
      console.error("OpenAI timing suggestion error:", error);
      return { recommendations: [] };
    }
  }
}

export const openaiService = new OpenAIService();