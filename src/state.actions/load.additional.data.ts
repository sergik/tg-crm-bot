import { Context } from "grammy";
import { StoreContext } from "../contact.state.machine";
import { downloadFile } from "../utils";

export const loadAdditionalData = async (
  ctx: Context,
  storeCtx: StoreContext
) => {
  const contact = await storeCtx.tmpContactStore.getContact();
  if (ctx.message?.photo) {
    const fileId = ctx.message?.photo[ctx.message?.photo.length - 1].file_id;
    const fileName = await downloadFile(ctx, fileId);
    contact.files = [...contact.files, fileName];
  } else if (ctx.message?.text) {
    contact.additionalNotes = [...contact.additionalNotes, ctx.message?.text];
  } else if (ctx.message?.voice) {
    const fileId = ctx.message?.voice.file_id;
    const fileName = await downloadFile(ctx, fileId);
    contact.files = [...contact.files, fileName];
  }
  await storeCtx.tmpContactStore.updateContact(contact);
};


