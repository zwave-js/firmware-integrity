import {
  extractFirmware,
  Firmware,
  FirmwareFileFormat,
  guessFirmwareFileFormat,
} from "@zwave-js/core";
import axios from "axios";
import crypto from "crypto";
import fs from "fs-extra";
import path from "path";

const DOWNLOAD_TIMEOUT = 60000;
const MAX_FIRMWARE_SIZE = 10 * 1024 * 1024; // 10MB should be enough for any conceivable Z-Wave chip

async function main() {
  function printUsage(): never {
    console.error(`
Z-Wave JS Firmware integrity hash creation tool

Usage:
  node firmware-integrity.js <url>
  node firmware-integrity.js <file>`);
    throw process.exit(1);
  }

  const urlOrFile = process.argv[2];
  let rawData: Buffer;
  let filename: string;

  if (!urlOrFile) {
    printUsage();
  } else if (
    (await fs.pathExists(urlOrFile)) &&
    (await fs.stat(urlOrFile)).isFile()
  ) {
    // This is a file
    rawData = await fs.readFile(urlOrFile);
    filename = path.basename(urlOrFile);
  } else {
    try {
      const url = new URL(urlOrFile);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error("Invalid URL");
      }
    } catch (e) {
      printUsage();
    }

    // This is a valid URL

    try {
      // Download the firmware file
      const downloadResponse = await axios.get<Buffer>(urlOrFile, {
        timeout: DOWNLOAD_TIMEOUT,
        maxContentLength: MAX_FIRMWARE_SIZE,
        responseType: "arraybuffer",
      });
      rawData = downloadResponse.data;

      // Infer the file type from the content-disposition header or the filename
      if (
        downloadResponse.headers["content-disposition"]?.startsWith(
          "attachment; filename="
        )
      ) {
        filename = downloadResponse.headers["content-disposition"]
          .split("filename=")[1]
          .replace(/^"/, "")
          .replace(/[";]$/, "");
      } else {
        filename = new URL(urlOrFile).pathname;
      }
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }

  // Extract the raw data
  let format: FirmwareFileFormat;
  let firmware: Firmware;
  try {
    format = guessFirmwareFileFormat(filename, rawData);
    firmware = extractFirmware(rawData, format);
  } catch (e: any) {
    console.error(`Failed to extract firmware: ${e.message}`);
    process.exit(1);
  }

  // Ensure the hash matches
  const hasher = crypto.createHash("sha256");
  hasher.update(firmware.data);
  const hash = hasher.digest("hex");

  console.log();
  console.log(`sha256:${hash}`);
  console.log();
}
void main();
