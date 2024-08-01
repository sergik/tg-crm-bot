import { Contact } from "../temp.contact.store";
import { config } from "../config";
import axios from "axios";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { Context } from "grammy";

export function printContact(contact: Contact) {
  return `ID: ${contact.id}\nName: ${contact.contactName}\nCompany: ${contact.companyName}\nCompany: ${contact.position}\nEmail: ${contact.email ?? ""}\nTelegram: ${contact.telegram ?? ""}\nPhone Number: ${contact.phoneNumber ?? ""}\nNotes:${contact.notes ?? ""}\n`;
}

export function fillContactFromJson(
  contact: Contact,
  json: string | null
): Contact {
  if (!json) {
    return contact;
  }
  const prepared = json
    .replace("```", "")
    .replace("```", "")
    .replace("json", "");
  const parsed = JSON.parse(prepared);
  contact.contactName = parsed.name ?? null;
  contact.companyName = parsed.company ?? null;
  contact.position = parsed.position ?? null;
  contact.email = parsed.email ?? null;
  contact.phoneNumber = parsed.phone ?? null;
  contact.telegram = parsed.telegram ?? null;
  return contact;
}

export async function downloadFile(
  ctx: Context,
  fileId: string
): Promise<string> {
  const fileUrl = `https://api.telegram.org/file/bot${config.BOT_TOKEN}/`;
  const fileInfo = await ctx.api.getFile(fileId);
  const url = `${fileUrl}${fileInfo.file_path}`;
  const fileExtension = path.extname(fileInfo.file_path ?? "");
  const response = await axios.get(url, { responseType: "stream" });
  const fileName = generateRandomFileName(fileExtension);
  const filesDir = path.join(process.cwd(), "bot_files");
  if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir);
  }
  const filePath = path.join(filesDir, fileName);
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
  const randomFileName = `${timestamp}-${randomString}${extension ? `${extension}` : ""}`;
  return randomFileName;
}
