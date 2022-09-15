"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("@zwave-js/core");
require("axios");
require("crypto");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const index_1 = require("./index");
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
            ({ filename, rawData } = await (0, index_1.downloadFirmware)(urlOrFile));
        }
        catch (e) {
            console.error(e);
            process.exit(1);
        }
    }
    try {
        const hash = (0, index_1.generateHash)(filename, rawData);
        console.log();
        console.log(hash);
        console.log();
    }
    catch (e) {
        console.error(e.message);
        process.exit(1);
    }
}
void main();
//# sourceMappingURL=cli.js.map