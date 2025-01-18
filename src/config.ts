import { load } from "ts-dotenv";
interface IConfig {
  TG_BOT_TOKEN: string;
  SPREADSHEET_ID: string;
  AUTH_CLIENT_ID: string;
  AUTH_CLIENT_SECRET: string;
  AUTH_REDIRECT_URI: string;
  CHAT_GPT_API_KEY: string;
  PG_DATABASE_HOST: string;
  PG_USER: string;
  PG_PASSWORD: string;
  PG_PORT: number;
  PG_DATABASE: string;
}

export const config: IConfig = load({
  TG_BOT_TOKEN: String,
  SPREADSHEET_ID: String,
  AUTH_CLIENT_ID: String,
  AUTH_CLIENT_SECRET: String,
  AUTH_REDIRECT_URI: String,
  CHAT_GPT_API_KEY: String,
  PG_DATABASE_HOST: String,
  PG_USER: String,
  PG_PASSWORD: String,
  PG_PORT: Number,
  PG_DATABASE: String,
});
