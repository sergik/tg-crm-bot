import { Context } from "grammy";
import { ContactPriority } from "../temp.contact.store";
import { StoreContext } from "../contact.state.machine";
import { showContactInfoMenu } from "../telegram/utils";

export const fromPriorityAction = async (
  ctx: Context,
  storeCtx: StoreContext
) => {
  const priority = mapPriority((ctx as any).callbackQuery.data);
  const contact = await storeCtx.tmpContactStore.getContact();
  contact.priority = priority;
  await storeCtx.tmpContactStore.updateContact(contact);
  await showContactInfoMenu(ctx);
};

function mapPriority(input: string): ContactPriority {
  return input as ContactPriority;
}
