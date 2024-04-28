import { Context, InlineKeyboard } from "grammy";
import { TempContactStore } from "../temp.contact.store";
import { leadButton } from "./to.is.lead";

export const buttons = ["High", "Mid", "Low", "Other"];

const priorityMenu = "<b>Priority</b>\n\nPlease select contact priority";

let priorityMenuMarkup = new InlineKeyboard();
for (const btn of buttons) {
  priorityMenuMarkup = priorityMenuMarkup.text(btn, btn);
}

export const toPriorityAction = async (
  ctx: Context,
  store: TempContactStore
) => {
  const isLead = ctx.match === leadButton;
  const contact = await store.getContact();
  contact.isLead = isLead;
  await store.updateContact(contact);
  await ctx.reply(`Contact is ${isLead ? "lead" : "not lead"}`);
  await ctx.reply(priorityMenu, {
    parse_mode: "HTML",
    reply_markup: priorityMenuMarkup,
  });
};
