import { Context, InlineKeyboard } from "grammy";
import { leadButton } from "./to.is.lead";
import { StoreContext } from "../contact.state.machine";

export const buttons = ["High", "Mid", "Low", "Other"];

const priorityMenu = "<b>Priority</b>\n\nPlease select contact priority";

let priorityMenuMarkup = new InlineKeyboard();
for (const btn of buttons) {
  priorityMenuMarkup = priorityMenuMarkup.text(btn, btn);
}

export const toPriorityAction = async (
  ctx: Context,
  storeCtx: StoreContext
) => {
  const isLead = ctx.match === leadButton;
  const contact = await storeCtx.tmpContactStore.getContact();
  contact.isLead = isLead;
  await storeCtx.tmpContactStore.updateContact(contact);
  await ctx.reply(`Contact is ${isLead ? "lead" : "not lead"}`);
  await ctx.reply(priorityMenu, {
    parse_mode: "HTML",
    reply_markup: priorityMenuMarkup,
  });
};
