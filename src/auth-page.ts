import express, { Request, Response } from "express";
import path from "path";
import { config } from "./config";

const app = express();
const PORT = config.AUTH_APP_PORT;

// Endpoint to serve the HTML page
app.get("/", (req: Request, res: Response) => {
  const htmlFilePath = path.join(__dirname, "views", "page.html");
  res.sendFile(htmlFilePath);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
