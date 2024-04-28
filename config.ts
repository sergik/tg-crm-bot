import { load } from "ts-dotenv";
interface IConfig {
  BOT_TOKEN: string;
}

export const config: IConfig = load({ BOT_TOKEN: String });
