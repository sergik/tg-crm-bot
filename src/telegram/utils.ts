import { Context, InlineKeyboard } from "grammy";
import { ContactMachineActions } from "../contact.state.machine";
import { Contact } from "../temp.contact.store";
import { printContact } from "../utils";

export const ADD_CONTACT_KEY = "add_contact";
export const SEARCH_CONTACT_KEY = "search_contact";
export const ADD_PHONE = "add_phone";
export const ADD_TELEGRAM = "add_telegram";
export const ADD_EMAIL = "add_email";
export const MOVE_NEXT = "move_next";
export const SAVE_CONTACT = "save_contact";
export const CANCEL = "cancel";
export const UPLOAD_FILES = "upload_files";
export const UPLOAD_VOICE_MESSAGES = "upload_voice_messages";
export const ADD_ADDITIONAL_NOTES = "add_additional_notes";
export const SEARCH_BY_NAME = "search_by_name";
export const SEARCH_BY_COMPANY = "search_by_company";
export const SEARCH_COMPANY_INFO = "search_company_info";
export const SUGGEST_CONTACT_QUESTIONS = "suggest_contact_questions";
export const ADD_CONACT_FROM_BC = "add_contact_from_bc";

export function getMainMenuMarkup(): InlineKeyboard {
  return new InlineKeyboard()
    .text("Add Contact", ADD_CONTACT_KEY)
    .row()
    .text("Add Contact From BC", ADD_CONACT_FROM_BC)
    .row()
    .text("Search Contact", SEARCH_CONTACT_KEY)
    .row()
    .text("Search Company Information", SEARCH_COMPANY_INFO)
    .row()
    .text("Suggest Questions For Contact", SUGGEST_CONTACT_QUESTIONS);
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

export async function showSearchContacntMenu(ctx: Context) {
  await ctx.reply("Search contact by", {
    reply_markup: new InlineKeyboard()
      .text("Name", SEARCH_BY_NAME)
      .row()
      .text("Company", SEARCH_BY_COMPANY)
      .row()
      .text("Cancel", CANCEL),
  });
}

export async function printContactsSearchResult(
  ctx: Context,
  contacts: Array<Contact>
) {
  await ctx.reply(
    `<b>Found contacts:</b>\n${contacts.map((c) => printContact(c)).join("\n")}`,
    {
      parse_mode: "HTML",
      reply_markup: getMainMenuMarkup(),
    }
  );
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
        .text("Cancel", CANCEL),
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
    case CANCEL:
      return "cancel";
    case UPLOAD_FILES:
      return "upload_files";
    case UPLOAD_VOICE_MESSAGES:
      return "upload_voice_messages";
    case ADD_ADDITIONAL_NOTES:
      return "add_additional_notes";
    case SEARCH_BY_COMPANY:
      return "search_by_company";
    case SEARCH_BY_NAME:
      return "search_by_name";
    case SEARCH_CONTACT_KEY:
      return "search_contact";
    case SEARCH_COMPANY_INFO:
      return "search_company_info";
    case SUGGEST_CONTACT_QUESTIONS:
      return "suggest_contact_questions";
    case  ADD_CONACT_FROM_BC:
      return "add_contact_from_bc";
    default:
      return "input";
  }
}
