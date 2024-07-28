import { Contact } from "../../temp.contact.store";
import {
  authorize,
  getOAuthUrlMessage,
  handleError,
  saveToken,
} from "./google.auth";
import { google, sheets_v4 } from "googleapis";
import path from "path";
import fs from "fs";

const NAME_COLUMN_ID = 1;
const COMPANY_COLUMN_ID = 2;
const POSITION_COLUMN_ID = 3;
const PRIOTIY_COLUMN_ID = 4;

const SUBFOLDER_NAME = "CRM Bot";

export class GoogleSheetsStore {
  constructor(private spreadsheetId: string) {}

  private async getSheetsClient() {
    const auth = await authorize();
    return google.sheets({
      version: "v4",
      auth,
    });
  }

  public getAuthMessage(): string {
    return getOAuthUrlMessage();
  }

  public applyAuthResponse(code: string) {
    saveToken(code);
  }

  private async getDriveClient() {
    const auth = await authorize();
    return google.drive({ version: "v3", auth });
  }

  public async createContact(contact: Contact): Promise<void> {
    const sheets = await this.getSheetsClient();
    const sheetName = await this.getFirstSheetName(sheets);
    const firstEmptyRow = await this.getFirstEmptyRowNumber(sheets, sheetName);
    const fileLinks = (await this.uploadFiles(contact.files)).filter((l) =>
      Boolean(l)
    ) as string[];
    const values = [this.buildContactValues(contact, fileLinks)];
    const valueInputOption = "USER_ENTERED";
    const resource = {
      values,
    };
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A${firstEmptyRow}`,
        requestBody: resource,
        valueInputOption,
      });
    } catch (e) {
      handleError(e);
    }
  }

  private async uploadFiles(files: string[]): Promise<Array<string | null>> {
    const drive = await this.getDriveClient();
    const folderId = await this.createSubfolderIfNotExists(SUBFOLDER_NAME);
    return await Promise.all(
      files.map(async (f) => {
        const fileName = path.basename(f);
        const fileMetadata = {
          name: fileName,
          parents: [folderId],
        };

        const media = {
          body: fs.createReadStream(f),
        };
        try {
          const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: "id,webViewLink",
          } as any);
          const file = response.data;
          return file.webViewLink ?? null;
        } catch (e) {
          handleError(e);
          throw e;
        }
      })
    );
  }

  public async getFirstSheetName(sheets: sheets_v4.Sheets): Promise<string> {
    const response = await sheets.spreadsheets.get({
      spreadsheetId: this.spreadsheetId,
    });

    const sheet = response.data.sheets?.[0];
    if (!sheet || !sheet.properties || !sheet.properties.title) {
      throw new Error("No sheets found in the spreadsheet.");
    }

    return sheet.properties.title;
  }

  private async getFirstEmptyRowNumber(
    sheets: sheets_v4.Sheets,
    sheetName: string
  ): Promise<number> {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: sheetName,
    });
    const rows = response.data.values;
    const firstEmptyRow = rows ? rows.length + 1 : 1;

    return firstEmptyRow;
  }

  private buildContactValues(
    contact: Contact,
    fileLinks: string[]
  ): Array<string> {
    return [
      contact.contactName ?? "",
      contact.companyName ?? "",
      contact.position ?? "",
      contact.isLead === true ? "lead" : "not lead",
      contact.priority ?? "",
      fileLinks.join(",\n"),
    ];
  }

  async getFolderId(folderName: string, drive: any, parentFolderId = "root") {
    const query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${parentFolderId}' in parents and trashed=false`;

    const res = await drive.files.list({
      q: query,
      fields: "files(id, name)",
    });

    const files = res.data.files;
    if (files.length > 0) {
      return files[0].id;
    } else {
      return null;
    }
  }

  async createFolder(folderName: string, drive: any, parentFolderId = "root") {
    const fileMetadata = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentFolderId],
    };

    const res = await drive.files.create({
      resource: fileMetadata,
      fields: "id, name",
    });

    return res.data.id;
  }

  async createSubfolderIfNotExists(folderName: string) {
    try {
      const drive = await this.getDriveClient();
      let folderId = await this.getFolderId(folderName, drive);
      if (!folderId) {
        folderId = await this.createFolder(folderName, drive);
      }
      return folderId;
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  }
}
