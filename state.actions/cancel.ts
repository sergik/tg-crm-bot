import { Context } from "grammy";
import { TempContactStore } from "../temp.contact.store";
import { HubspotStore } from "../crm/hubspot/hubspot.store";
export const cancelAction = async (
  ctx: Context,
  storeCtx: {
    tmpContactStore: TempContactStore;
    hubSpotStore: HubspotStore;
  }
) => {
  await ctx.reply(
    `Previous contact creaction canceled. You can start new contact creation from scratch with /a`
  );
};
