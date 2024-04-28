import { Context } from "grammy";
import { TempContactStore } from "../temp.contact.store";
export const cancelAction = async (ctx: Context, _store: TempContactStore) => {
  await ctx.reply(
    `Previous contact creaction canceled. You can start new contact creation from scratch with /a`
  );
};
