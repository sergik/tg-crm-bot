import { Context, InlineKeyboard } from "grammy";
import { ContactMachineActions } from "../contact.state.machine";

export const ADD_CONTACT_KEY = "add_contact";
export const SEARCH_CONTACT_KEY = "search_contact";
export const ADD_PHONE = "add_phone";
export const ADD_TELEGRAM = "add_telegram";
export const ADD_EMAIL = "add_email";
export const MOVE_NEXT = "move_next";
export const SAVE_CONTACT = "save_contact";
export const CANCEL_CONTACT_CREATION = "cancel_contact";
export const UPLOAD_FILES = "upload_files";
export const UPLOAD_VOICE_MESSAGES = "upload_voice_messages";
export const ADD_ADDITIONAL_NOTES = "add_additional_notes";

export function getMainMenuMarkup(): InlineKeyboard {
  return new InlineKeyboard()
    .text("Add Contact", ADD_CONTACT_KEY)
    .row()
    .text("Search Contact", SEARCH_CONTACT_KEY);
}

export async function showContactInfoMenu(ctx: Context) {
  await ctx.reply("Enter contact information", {
    reply_markup: new InlineKeyboard()
      .text("Add Phone", ADD_PHONE)
      .row()
      .text("Add Telegram", ADD_TELEGRAM)
      .row()
      .text("Add Email", ADD_EMAIL)
      .row()
      .text("Next", MOVE_NEXT),
  });
}

export async function showSubmitMenu(ctx: Context) {
  await ctx.reply(
    "Provide additional information if needed or save the contact if ready",
    {
      reply_markup: new InlineKeyboard()
        .text("Upload files", UPLOAD_FILES)
        .row()
        .text("Upload voce messages", UPLOAD_VOICE_MESSAGES)
        .row()
        .text("Add additional notes", ADD_ADDITIONAL_NOTES)
        .row()
        .text("Save", SAVE_CONTACT)
        .row()
        .text("Cancel", CANCEL_CONTACT_CREATION),
    }
  );
}

export function getActionFromInput(
  input: string | undefined
): ContactMachineActions {
  switch (input) {
    case ADD_CONTACT_KEY:
      return "start";
    case ADD_PHONE:
      return "enter_phone";
    case ADD_EMAIL:
      return "enter_email";
    case ADD_TELEGRAM:
      return "enter_telegram";
    case MOVE_NEXT:
      return "next";
    case SAVE_CONTACT:
      return "submit";
    case CANCEL_CONTACT_CREATION:
      return "cancel";
    case UPLOAD_FILES:
      return "upload_files";
    case UPLOAD_VOICE_MESSAGES:
      return "upload_voice_messages";
    case ADD_ADDITIONAL_NOTES:
      return "add_additional_notes";
    default:
      return "input";
  }
}
