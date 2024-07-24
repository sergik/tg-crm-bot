import { load } from "ts-dotenv";
interface IConfig {
  BOT_TOKEN: string;
  HUBSPOT_TOKEN: string;
  SPREADSHEET_ID: string;
  GOOGLE_API_KEY_FILE_PATH: string;
}

export const config: IConfig = load({
  BOT_TOKEN: String,
  HUBSPOT_TOKEN: String,
  SPREADSHEET_ID: String,
  GOOGLE_API_KEY_FILE_PATH: String,
});
