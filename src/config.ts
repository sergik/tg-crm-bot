import { load } from "ts-dotenv";
interface IConfig {
  BOT_TOKEN: string;
  SPREADSHEET_ID: string;
  AUTH_CLIENT_ID: string;
  AUTH_CLIENT_SECRET: string;
  AUTH_REDIRECT_URI: string;
  CHAT_GPT_API_KEY: string;
}

export const config: IConfig = load({
  BOT_TOKEN: String,
  SPREADSHEET_ID: String,
  AUTH_CLIENT_ID: String,
  AUTH_CLIENT_SECRET: String,
  AUTH_REDIRECT_URI: String,
  CHAT_GPT_API_KEY: String,
});
