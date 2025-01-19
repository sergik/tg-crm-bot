import { Contact, TempContactStore } from "../temp.contact.store";
import { config } from "../config";
import axios from "axios";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { Context } from "grammy";
import { UserStore } from "../store/user.store";
import {
  ContactMachineActions,
  ContactStateMachine,
  ContactMachineStates,
} from "../contact.state.machine";
import { GoogleSheetsStore } from "../crm/google.sheets.store";

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
  const fileUrl = `https://api.telegram.org/file/bot${config.TG_BOT_TOKEN}/`;
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

const tmpContactStore = new TempContactStore();
export async function executeStateAction(
  ctx: Context,
  action: ContactMachineActions
): Promise<void> {
  const userId = ctx.from?.id.toString();
  if (!userId) {
    return;
  }
  const userStore = new UserStore(userId);
  const currentState = await userStore.getCurrentState();
  const stateMachine = new ContactStateMachine(
    tmpContactStore,
    (chatId) => new GoogleSheetsStore(config.SPREADSHEET_ID, chatId),
    currentState
  );
  await stateMachine.dispatch(action, { ctx });
  await userStore.setCurrentState(stateMachine.getCurrentState());
}

export async function getCurrentState(
  ctx: Context
): Promise<ContactMachineStates> {
  const userId = ctx.from?.id.toString();
  if (!userId) {
    return "idle";
  }
  const userStore = new UserStore(userId);
  return await userStore.getCurrentState();
}

export async function resetState(ctx: Context): Promise<void> {
  const userId = ctx.from?.id.toString();
  if (!userId) {
    return;
  }
  const userStore = new UserStore(userId);
  await userStore.setCurrentState("idle");
}
