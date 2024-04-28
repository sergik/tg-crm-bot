export const leadButton = "Lead";
export const notLeadButton = "Not Lead";
import { Context, InlineKeyboard } from "grammy";
import { TempContactStore } from "../temp.contact.store";

const leadManu = "<b>Is Lead?</b>\n\nPlease select is contact lead or not";

const leadMeanuMarkup = new InlineKeyboard()
  .text(leadButton, leadButton)
  .text(notLeadButton, notLeadButton);

export const toWaitingLeadAction = async (
  ctx: Context,
  store: TempContactStore
) => {
  const company = ctx.message?.text as string;
  const contact = await store.getContact();
  contact.companyName = company;
  await store.updateContact(contact);
  await ctx.reply(leadManu, {
    parse_mode: "HTML",
    reply_markup: leadMeanuMarkup,
  });
};
