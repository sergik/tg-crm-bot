import { Context } from "grammy";
import { TempContactStore } from "../temp.contact.store";
import { ContactPriority } from "../temp.contact.store";

export const fromPriorityAction = async (
  ctx: Context,
  store: TempContactStore
) => {
  const priority = mapPriority(ctx.match as string);
  const contact = await store.getContact();
  contact.priority = priority;
  await store.updateContact(contact);
  await ctx.reply(
    `You can add additional pictures, voice recordings or messages. Write /s to save contact.`
  );
};

function mapPriority(input: string): ContactPriority {
  return input as ContactPriority;
}
