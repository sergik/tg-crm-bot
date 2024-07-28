export const leadButton = "Lead";
export const notLeadButton = "Not Lead";
import { Context, InlineKeyboard } from "grammy";
import { StoreContext } from "../contact.state.machine";

const leadManu = "<b>Is Lead?</b>\n\nPlease select is contact lead or not";

const leadMeanuMarkup = new InlineKeyboard()
  .text(leadButton, leadButton)
  .text(notLeadButton, notLeadButton);

export const toWaitingLeadAction = async (
  ctx: Context,
  storeCtx: StoreContext
) => {
  const position = ctx.message?.text as string;
  const contact = await storeCtx.tmpContactStore.getContact();
  contact.position = position;
  await storeCtx.tmpContactStore.updateContact(contact);
  await ctx.reply(leadManu, {
    parse_mode: "HTML",
    reply_markup: leadMeanuMarkup,
  });
};
