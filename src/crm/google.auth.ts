import { google } from "googleapis";
import fs from "fs";
import * as readline from "readline";
import { OAuth2Client } from "google-auth-library";
import { config } from "../config";
import { UserStore } from "../store/user.store";

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
];
const TOKEN_PATH = "token.json";

export async function getServiceAccountAuth(
  scopes: Array<string>,
  keyFilePath: string
) {
  return new google.auth.GoogleAuth({
    keyFile: keyFilePath,
    scopes: scopes,
  });
}

export async function authorize(tokenInfo: string): Promise<OAuth2Client> {
  const oAuth2Client = getOAuthClient();
  oAuth2Client.setCredentials(JSON.parse(tokenInfo as any));
  oAuth2Client.on;
  return oAuth2Client;
}

function getOAuthClient(): OAuth2Client {
  return new google.auth.OAuth2(
    config.AUTH_CLIENT_ID,
    config.AUTH_CLIENT_SECRET,
    config.AUTH_REDIRECT_URI
  );
}

export function handleError(err: any) {
  if (err && (err.code === 401 || err.code === 403)) {
    console.log("Invalid or expired token, removing stored token...");
    fs.unlinkSync(TOKEN_PATH);
  } else {
    console.error("API Error:", err);
  }
}

export async function saveToken(code: string, store: UserStore): Promise<void> {
  const oAuth2Client = getOAuthClient();
  const promise = new Promise<string>((resolve, reject) => {
    oAuth2Client.getToken(code, (err: any, token: any) => {
      if (err) return reject(err);
      oAuth2Client.setCredentials(token);
      resolve(JSON.stringify(token) as string);
    });
  });
  const token = await promise;
  await store.saveGoogleToken(token);
}

export function getOAuthUrlMessage(): string {
  const oAuth2Client = getOAuthClient();
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  return `Authorize this app by visiting this url: ${authUrl}`;
}

function getNewToken(oAuth2Client: any, callback: Function) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err: any, token: any) => {
      if (err) return console.error("Error retrieving access token", err);
      oAuth2Client.setCredentials(token);
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}
