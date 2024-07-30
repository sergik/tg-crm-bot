import OpenAI from "openai";
import { config } from "../config";

export const askChatGPT4 = async (prompt: string) => {
  const openai = new OpenAI({ apiKey: config.CHAT_GPT_API_KEY });
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
  });
  return response.choices[0].message?.content;
};

export const searchCompanyInfo = async (companyName: string) => {
  const prompt = `Could you please provide me information about company ${companyName}.`;
  return askChatGPT4(prompt);
};
