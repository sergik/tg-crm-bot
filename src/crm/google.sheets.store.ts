import { Contact } from "../temp.contact.store";
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
const LEAD_COLUMN_ID = 4;
const PRIORITY_COLUMN_ID = 5;
const TELEGRAM_COLUMN_ID = 6;
const PHONE_COLUMN_ID = 7;
const EMAIL_COLUMN_ID = 8;
const NOTES_COLUMN_ID = 9;

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

  public async createContact(contact: Contact): Promise<string | null> {
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
      return firstEmptyRow.toString();
    } catch (e) {
      handleError(e);
    }
    return null;
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

  public async searchByCompany(company: string): Promise<Array<Contact>> {
    return this.searchByColumn(company, (r) => r[COMPANY_COLUMN_ID - 1]);
  }

  public async getContactByID(id: string): Promise<Contact | null> {
    const sheets = await this.getSheetsClient();
    const sheetName = await this.getFirstSheetName(sheets);
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: sheetName,
    });
    const rows = response.data.values;
    if (!rows || rows?.length <= parseInt(id)) {
      return null;
    }

    return this.mapRowToContact(rows[parseInt(id)], id);
  }

  private async searchByColumn(
    searchInput: string,
    valueSelector: (row: any[]) => string
  ): Promise<Array<Contact>> {
    const sheets = await this.getSheetsClient();
    const sheetName = await this.getFirstSheetName(sheets);
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: sheetName,
    });
    const rows = response.data.values;
    if (!rows) {
      return [];
    }
    return rows
      .map((row, index) => ({ row, index }))
      .filter((i) =>
        valueSelector(i.row).toLowerCase().includes(searchInput.toLowerCase())
      )
      .map((item) => {
        return this.mapRowToContact(item.row, item.index.toString());
      });
  }

  private mapRowToContact(row: any[], id: string): Contact {
    return {
      id: id.toString(),
      contactName: row[NAME_COLUMN_ID - 1],
      companyName: row[COMPANY_COLUMN_ID - 1],
      position: row[POSITION_COLUMN_ID - 1],
      email: row[EMAIL_COLUMN_ID - 1],
      phoneNumber: row[PHONE_COLUMN_ID - 1],
      telegram: row[TELEGRAM_COLUMN_ID - 1],
      notes: row[NOTES_COLUMN_ID - 1],
    } as Contact;
  }

  public async searchByName(name: string): Promise<Array<Contact>> {
    return this.searchByColumn(name, (r) => r[NAME_COLUMN_ID - 1]);
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
      contact.telegram ?? "",
      contact.phoneNumber ? JSON.stringify(contact.phoneNumber) : "",
      contact.email ?? "",
      contact.additionalNotes.join(",\n"),
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
