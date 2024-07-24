import { Contact } from "../../temp.contact.store";
import { google, sheets_v4 } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

const NAME_COLUMN_ID = 1;
const COMPANY_COLUMN_ID = 2;
const POSITION_COLUMN_ID = 3;
const PRIOTIY_COLUMN_ID = 4;

export class GoogleSheetsStore {
  constructor(
    private keyFilePath: string,
    private spreadsheetId: string
  ) {}

  private async getSheetsClient() {
    const auth = new google.auth.GoogleAuth({
      keyFile: this.keyFilePath,
      scopes: SCOPES,
    });
    const client = await auth.getClient();
    return google.sheets({
      version: "v4",
      auth: client as any,
    });
  }

  public async createContact(
    contact: Contact,
    downloadFile: (fileId: string) => Promise<any>
  ): Promise<void> {
    const sheets = await this.getSheetsClient();
    const sheetName = await this.getFirstSheetName(sheets);
    const firstEmptyRow = await this.getFirstEmptyRowNumber(sheets, sheetName);
    const values = [this.buildContactValues(contact)];
    const valueInputOption = "USER_ENTERED";
    const resource = {
      values,
    };
    await sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!A${firstEmptyRow}`,
      requestBody: resource,
      valueInputOption,
    });
  }

  private async getFirstSheetName(sheets: sheets_v4.Sheets): Promise<string> {
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

  private buildContactValues(contact: Contact): Array<string> {
    return [
      contact.contactName ?? "",
      contact.companyName ?? "",
      contact.isLead === true ? "lead" : "not lead",
      contact.priority ?? "",
    ];
  }
}
