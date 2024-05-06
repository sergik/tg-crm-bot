import { Context } from "grammy";
import { StoreContext } from "../contact.state.machine";

export const loadAdditionalData = async (
  ctx: Context,
  storeCtx: StoreContext
) => {
  const contact = await storeCtx.tmpContactStore.getContact();
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
  await storeCtx.tmpContactStore.updateContact(contact);
};
