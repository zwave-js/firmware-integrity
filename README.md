# Z-Wave JS Firmware integrity hash creation tool

This tool is meant to help generate the integrity hash for the Z-Wave JS firmware update service.

Usage:
```
npx @zwave-js/firmware-integrity <url>
npx @zwave-js/firmware-integrity <file>
```

This loads or downloads the given file or URL, extracts the raw firmware data, and generates the integrity hash.