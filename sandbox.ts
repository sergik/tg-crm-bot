import { google } from "googleapis";
import path from "path";

// Load the service account key JSON file
const KEYFILEPATH = path.join(__dirname, "google_key.json");
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]; // Google Sheets API scope

// Authenticate and get an auth client
const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

async function accessSpreadsheet() {
  const authClient = await auth.getClient();
  const sheets = google.sheets({
    version: "v4",
    auth: authClient as any,
  });

  const spreadsheetId = "1M9_0j84SZuNXiLcBGCAiGB3pSXzHKZ1bC0-X7tFYSRY"; // Replace with your spreadsheet ID
  const range = "Sheet1!A1:D10"; // Replace with your desired range

  const values = [
    ["Hello", "World"], // The values you want to update
    ["New", "Data"],
  ];
  const valueInputOption = "RAW"; //"USER_ENTERED";
  const resource = {
    values,
  };
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "Sheet1!A1",
    requestBody: resource,
    valueInputOption,
  });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const rows = res.data.values;
  if (rows && rows.length) {
    console.log("Data:");
    rows.forEach((row) => {
      console.log(row.join(", "));
    });
  } else {
    console.log("No data found.");
  }
}
accessSpreadsheet();
