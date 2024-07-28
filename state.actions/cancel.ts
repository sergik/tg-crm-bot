import { Context } from "grammy";
import { StoreContext } from "../contact.state.machine";
import { getMainMenuMarkup } from "../telegram/utils";
export const cancelAction = async (ctx: Context, storeCtx: StoreContext) => {
  storeCtx.tmpContactStore.resetContact();
  await ctx.reply(
    "Previous contact creaction canceled. Please choose an option:",
    {
      reply_markup: getMainMenuMarkup(ctx),
    }
  );
};
