import { Context, InlineKeyboard } from "grammy";
import { ContactMachineActions } from "../contact.state.machine";

export const ADD_CONTACT_KEY = "add_contact";
export const SEARCH_CONTACT_KEY = "search_contact";

export function getMainMenuMarkup(ctx: Context): InlineKeyboard {
  return new InlineKeyboard()
    .text("Add Contact", ADD_CONTACT_KEY)
    .row()
    .text("Search Contact", SEARCH_CONTACT_KEY);
}

export function getActionFromInput(
  input: string | undefined
): ContactMachineActions {
  switch (input) {
    case ADD_CONTACT_KEY:
      return "start";
    default:
      return "input";
  }
}
