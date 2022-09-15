"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateHash = exports.downloadFirmware = void 0;
const core_1 = require("@zwave-js/core");
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const DOWNLOAD_TIMEOUT = 60000;
const MAX_FIRMWARE_SIZE = 10 * 1024 * 1024; // 10MB should be enough for any conceivable Z-Wave chip
async function downloadFirmware(url) {
    // Download the firmware file
    const downloadResponse = await axios_1.default.get(url, {
        timeout: DOWNLOAD_TIMEOUT,
        maxContentLength: MAX_FIRMWARE_SIZE,
        responseType: "arraybuffer",
    });
    const rawData = downloadResponse.data;
    let filename;
    // Infer the file type from the content-disposition header or the filename
    if (downloadResponse.headers["content-disposition"]?.startsWith("attachment; filename=")) {
        filename = downloadResponse.headers["content-disposition"]
            .split("filename=")[1]
            .replace(/^"/, "")
            .replace(/[";]$/, "");
    }
    else {
        filename = new URL(url).pathname;
    }
    return { filename, rawData };
}
exports.downloadFirmware = downloadFirmware;
function generateHash(filename, rawData) {
    // Extract the raw data
    let format;
    let firmware;
    try {
        format = (0, core_1.guessFirmwareFileFormat)(filename, rawData);
        firmware = (0, core_1.extractFirmware)(rawData, format);
    }
    catch (e) {
        throw new Error(`Failed to extract firmware: ${e.message}`);
    }
    // Ensure the hash matches
    const hasher = crypto_1.default.createHash("sha256");
    hasher.update(firmware.data);
    const hash = hasher.digest("hex");
    return `sha256:${hash}`;
}
exports.generateHash = generateHash;
//# sourceMappingURL=index.js.map