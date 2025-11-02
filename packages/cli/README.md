# TokiForge-cli

Command-line tool for TokiForge design tokens.

## Installation

```bash
npm install -g TokiForge-cli
```

Or use with npx:

```bash
npx TokiForge-cli init
```

## Commands

### `TokiForge init`

Initialize TokiForge in your project. Creates `tokens.json` and `TokiForge.config.json`.

```bash
TokiForge init
```

### `TokiForge build`

Build and export tokens to various formats (CSS, JS, TS, SCSS, JSON).

```bash
TokiForge build
```

### `TokiForge dev`

Start a development server with live theme preview.

```bash
TokiForge dev
```

### `TokiForge lint`

Validate token consistency and accessibility.

```bash
TokiForge lint
```

## Configuration

Edit `TokiForge.config.json` to configure:

- Input token file path
- Output file paths for different formats
- Theme definitions
- CSS variable prefix and selector



