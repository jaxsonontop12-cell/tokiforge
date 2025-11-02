# @tokiforge/core

Core design token engine for TokiForge.

## Installation

```bash
npm install @tokiforge/core
```

## Usage

### Parse Tokens

```typescript
import { TokenParser } from '@tokiforge/core';

const tokens = TokenParser.parse('./tokens.json');
```

### Export Tokens

```typescript
import { TokenParser, TokenExporter } from '@tokiforge/core';

const tokens = TokenParser.parse('./tokens.json');

// Export as CSS
const css = TokenExporter.exportCSS(tokens, { prefix: 'hf' });

// Export as TypeScript
const ts = TokenExporter.exportTS(tokens);
```

### Runtime Theme Management

```typescript
import { ThemeRuntime } from '@tokiforge/core';

const runtime = new ThemeRuntime({
  themes: [
    { name: 'light', tokens: lightTokens },
    { name: 'dark', tokens: darkTokens },
  ],
  defaultTheme: 'light',
});

runtime.init();
runtime.applyTheme('dark');
```

## API

See the main [TokiForge README](../../README.md) for complete documentation.



