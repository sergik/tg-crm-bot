import OpenAI from "openai";
import { config } from "../config";
import { Contact } from "../temp.contact.store";
import { ChatCompletionContentPart } from "openai/resources";
import fs from "fs";
import path from "path";

export const askChatGPT4 = async (
  prompt: string,
  imagePath: string | null = null
) => {
  let content = [
    { type: "text", text: prompt },
  ] as Array<ChatCompletionContentPart>;
  if (imagePath) {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");
    content = [
      ...content,
      {
        type: "image_url",
        image_url: {
          url: `data:image/${path.extname(imagePath).replace(".", "")};base64,${base64Image}`,
        },
      },
    ];
  }
  const openai = new OpenAI({ apiKey: config.CHAT_GPT_API_KEY });
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content }],
  });
  return response.choices[0].message?.content;
};

export const searchCompanyInfo = async (companyName: string) => {
  const prompt = `Provide the info about  ${companyName}
1)the year it was founded
2) locations where it has offices
3) how many employees are there
4)C-level and key decision makers 
5) what this company offers
6) who are its customers
7) its annual turnover
8) has it recently received investments? what round and amount?`;

  return askChatGPT4(prompt);
};

export const questionsToContact = async (contact: Contact) => {
  const prompt = `I need to sell Sales, PR & Marketing services, what questions should I ask if I speak to ${contact.position} from ${contact.companyName}? Tailor questions to his responsibilities and competencies.

Focus on the following agenda:

1) Discuss addressee's company offerings, client types and target market
2) Outline company's current state related to the product/service being sold
3) Confirm the correct contact person for further discussions about my offering
4) Agree on next steps and exchange information to stay in touch
5) Additional tips`;

  return askChatGPT4(prompt);
};

export async function parseBusinessCard(imagePath: string) {
  const prompt = `Please reponse in json format with the following information from this business card: name, company, position, email, phone and telegram.`;
  return await askChatGPT4(prompt, imagePath);
}
