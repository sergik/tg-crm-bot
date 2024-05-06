import { load } from "ts-dotenv";
interface IConfig {
  BOT_TOKEN: string;
  HUBSPOT_TOKEN: string;
}

export const config: IConfig = load({
  BOT_TOKEN: String,
  HUBSPOT_TOKEN: String,
});
