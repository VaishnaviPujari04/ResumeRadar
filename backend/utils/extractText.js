import { createRequire } from "module";
import mammoth from "mammoth";

const require = createRequire(import.meta.url);
const pdfParseImport = require("pdf-parse");
const pdfParse = typeof pdfParseImport === "function" ? pdfParseImport : pdfParseImport.default;

export async function extractTextFromFile(buffer, mimetype) {
  if (mimetype === "application/pdf") {
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error("Unsupported file type");
}