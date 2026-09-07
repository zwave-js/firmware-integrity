# Z-Wave JS Firmware integrity hash creation tool

This tool is meant to help generate the integrity hash for the Z-Wave JS firmware update service.

## Requirements

A recent version of [Node.js](https://nodejs.org/en/download/) is required (v16.9 or newer).

## Usage

```
npx @zwave-js/firmware-integrity <url>
npx @zwave-js/firmware-integrity <file>
```

This loads or downloads the given file or URL, extracts the raw firmware data, and generates the integrity hash.

## Contributing

AI tools may assist contributors, but every contribution must be personally reviewed, understood, and explainable. Autonomous-agent contributions and unreviewed AI communication are prohibited. Read the [Z-Wave JS AI policy](AI_POLICY.md) before contributing.
