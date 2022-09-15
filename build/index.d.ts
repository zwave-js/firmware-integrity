/// <reference types="node" />
export declare function downloadFirmware(url: string): Promise<{
    filename: string;
    rawData: Buffer;
}>;
export declare function generateHash(filename: string, rawData: Buffer): string;
//# sourceMappingURL=index.d.ts.map