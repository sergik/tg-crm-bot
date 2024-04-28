import { Context } from "grammy";
import { TempContactStore } from "../temp.contact.store";

export const loadAdditionalData = async (
  ctx: Context,
  store: TempContactStore
) => {
  const contact = await store.getContact();
  if (ctx.message?.photo) {
    contact.photoIds = [
      ...contact.photoIds,
      ctx.message?.photo[ctx.message?.photo.length - 1].file_id,
    ];
  } else if (ctx.message?.text) {
    contact.additionalNotes = [...contact.additionalNotes, ctx.message?.text];
  } else if (ctx.message?.voice) {
    contact.voiceIds = [...contact.voiceIds, ctx.message?.voice.file_id];
  }
};
