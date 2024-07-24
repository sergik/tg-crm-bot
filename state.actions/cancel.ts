import { Context } from "grammy";
import { TempContactStore } from "../temp.contact.store";
import { GoogleSheetsStore } from "../crm/hubspot/google.sheets.store";
export const cancelAction = async (
  ctx: Context,
  storeCtx: {
    tmpContactStore: TempContactStore;
    store: GoogleSheetsStore;
  }
) => {
  await ctx.reply(
    `Previous contact creaction canceled. You can start new contact creation from scratch with /a`
  );
};
