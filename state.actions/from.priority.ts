import { Context } from "grammy";
import { ContactPriority } from "../temp.contact.store";
import { StoreContext } from "../contact.state.machine";

export const fromPriorityAction = async (
  ctx: Context,
  storeCtx: StoreContext
) => {
  const priority = mapPriority(ctx.match as string);
  const contact = await storeCtx.tmpContactStore.getContact();
  contact.priority = priority;
  await storeCtx.tmpContactStore.updateContact(contact);
  await ctx.reply(
    `You can add additional pictures, voice recordings or messages. Write /s to save contact.`
  );
};

function mapPriority(input: string): ContactPriority {
  return input as ContactPriority;
}
