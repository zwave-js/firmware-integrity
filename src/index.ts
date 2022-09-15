import {
  extractFirmware,
  Firmware,
  FirmwareFileFormat,
  guessFirmwareFileFormat,
} from "@zwave-js/core";
import axios from "axios";
import crypto from "crypto";

const DOWNLOAD_TIMEOUT = 60000;
const MAX_FIRMWARE_SIZE = 10 * 1024 * 1024; // 10MB should be enough for any conceivable Z-Wave chip

export async function downloadFirmware(url: string): Promise<{
  filename: string;
  rawData: Buffer;
}> {
  // Download the firmware file
  const downloadResponse = await axios.get<Buffer>(url, {
    timeout: DOWNLOAD_TIMEOUT,
    maxContentLength: MAX_FIRMWARE_SIZE,
    responseType: "arraybuffer",
  });
  const rawData = downloadResponse.data;
  let filename: string;

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
    filename = new URL(url).pathname;
  }

  return { filename, rawData };
}

export function generateHash(filename: string, rawData: Buffer): string {
  // Extract the raw data
  let format: FirmwareFileFormat;
  let firmware: Firmware;
  try {
    format = guessFirmwareFileFormat(filename, rawData);
    firmware = extractFirmware(rawData, format);
  } catch (e: any) {
    throw new Error(`Failed to extract firmware: ${e.message}`);
  }

  // Ensure the hash matches
  const hasher = crypto.createHash("sha256");
  hasher.update(firmware.data);
  const hash = hasher.digest("hex");

  return `sha256:${hash}`;
}
