import { Context } from "grammy";
import { StoreContext } from "../contact.state.machine";
import { config } from "../config";
import axios from "axios";
import path from "path";
import fs from "fs";
import crypto from "crypto";

export const loadAdditionalData = async (
  ctx: Context,
  storeCtx: StoreContext
) => {
  const contact = await storeCtx.tmpContactStore.getContact();
  if (ctx.message?.photo) {
    const fileId = ctx.message?.photo[ctx.message?.photo.length - 1].file_id;
    const fileName = await downloadImage(ctx, fileId);
    contact.files = [...contact.files, fileName];
  } else if (ctx.message?.text) {
    contact.additionalNotes = [...contact.additionalNotes, ctx.message?.text];
  } else if (ctx.message?.voice) {
    contact.voiceIds = [...contact.voiceIds, ctx.message?.voice.file_id];
  }
  await storeCtx.tmpContactStore.updateContact(contact);
};

async function downloadImage(ctx: Context, fileId: string): Promise<string> {
  const fileUrl = `https://api.telegram.org/file/bot${config.BOT_TOKEN}/`;
  const fileInfo = await ctx.api.getFile(fileId);
  const url = `${fileUrl}${fileInfo.file_path}`;
  const response = await axios.get(url, { responseType: "stream" });
  const fileName = generateRandomFileName();
  const filePath = path.join(process.cwd(), "images", fileName);
  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", () => resolve(filePath));
    writer.on("error", reject);
  });
}

function generateRandomFileName(extension = "") {
  const randomString = crypto.randomBytes(16).toString("hex");
  const timestamp = Date.now();
  const randomFileName = `${timestamp}-${randomString}${extension ? `.${extension}` : ""}`;
  return randomFileName;
}
