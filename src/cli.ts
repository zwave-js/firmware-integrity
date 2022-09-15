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
import { downloadFirmware, generateHash } from "./index";

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
      ({ filename, rawData } = await downloadFirmware(urlOrFile));
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }

  try {
    const hash = generateHash(filename, rawData);

    console.log();
    console.log(hash);
    console.log();
  } catch (e: any) {
    console.error(e.message);
    process.exit(1);
  }
}
void main();
