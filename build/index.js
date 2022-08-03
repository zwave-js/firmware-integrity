"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@zwave-js/core");
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const DOWNLOAD_TIMEOUT = 60000;
const MAX_FIRMWARE_SIZE = 10 * 1024 * 1024; // 10MB should be enough for any conceivable Z-Wave chip
async function main() {
    function printUsage() {
        console.error(`
Z-Wave JS Firmware integrity hash creation tool

Usage:
  node firmware-integrity.js <url>
  node firmware-integrity.js <file>`);
        throw process.exit(1);
    }
    const urlOrFile = process.argv[2];
    let rawData;
    let filename;
    if (!urlOrFile) {
        printUsage();
    }
    else if ((await fs_extra_1.default.pathExists(urlOrFile)) &&
        (await fs_extra_1.default.stat(urlOrFile)).isFile()) {
        // This is a file
        rawData = await fs_extra_1.default.readFile(urlOrFile);
        filename = path_1.default.basename(urlOrFile);
    }
    else {
        try {
            const url = new URL(urlOrFile);
            if (url.protocol !== "http:" && url.protocol !== "https:") {
                throw new Error("Invalid URL");
            }
        }
        catch (e) {
            printUsage();
        }
        // This is a valid URL
        try {
            // Download the firmware file
            const downloadResponse = await axios_1.default.get(urlOrFile, {
                timeout: DOWNLOAD_TIMEOUT,
                maxContentLength: MAX_FIRMWARE_SIZE,
                responseType: "arraybuffer",
            });
            rawData = downloadResponse.data;
            // Infer the file type from the content-disposition header or the filename
            if (downloadResponse.headers["content-disposition"]?.startsWith("attachment; filename=")) {
                filename = downloadResponse.headers["content-disposition"]
                    .split("filename=")[1]
                    .replace(/^"/, "")
                    .replace(/[";]$/, "");
            }
            else {
                filename = new URL(urlOrFile).pathname;
            }
        }
        catch (e) {
            console.error(e);
            process.exit(1);
        }
    }
    // Extract the raw data
    let format;
    let firmware;
    try {
        format = (0, core_1.guessFirmwareFileFormat)(filename, rawData);
        firmware = (0, core_1.extractFirmware)(rawData, format);
    }
    catch (e) {
        console.error(`Failed to extract firmware: ${e.message}`);
        process.exit(1);
    }
    // Ensure the hash matches
    const hasher = crypto_1.default.createHash("sha256");
    hasher.update(firmware.data);
    const hash = hasher.digest("hex");
    console.log("Integrity: ");
    console.log(`sha256:${hash}`);
}
void main();
//# sourceMappingURL=index.js.map