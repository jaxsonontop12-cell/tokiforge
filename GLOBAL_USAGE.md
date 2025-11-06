# 🌐 Global Usage Guide

This guide explains how to install and use TokiForge CLI globally on your system.

## 📋 Table of Contents

1. [Install from Local Source](#install-from-local-source)
2. [Install from npm (When Published)](#install-from-npm-when-published)
3. [Using Global CLI](#using-global-cli)
4. [Updating Global Installation](#updating-global-installation)
5. [Uninstalling](#uninstalling)
6. [Troubleshooting](#troubleshooting)

---

## 🚀 Install from Local Source

### Method 1: Build and Install Globally

#### Step 1: Build the CLI Package

```bash
# From the TokiForge root directory
cd packages/cli
npm run build
```

#### Step 2: Install Globally

```bash
# Still in packages/cli directory
npm install -g .
```

Or from the root:

```bash
# From TokiForge root
npm install -g ./packages/cli
```

#### Step 3: Verify Installation

```bash
tokiforge --version
# Should output: 1.0.0
```

---

### Method 2: Use Helper Script

```bash
# From TokiForge root
npm run install:global
```

This script builds and installs the CLI globally in one command.

---

### Method 3: Link Globally (Development)

For development where you want changes to reflect immediately:

```bash
# From packages/cli
npm link
```

This creates a global symlink. Now you can use `tokiforge` command from anywhere.

**Note:** You still need to rebuild after changes:
```bash
npm run build
```

---

## 📦 Install from npm (When Published)

Once TokiForge is published to npm, you can install it globally:

```bash
npm install -g tokiforge-cli
```

Or use npx (no installation needed):

```bash
npx tokiforge-cli init
npx tokiforge-cli build
```

---

## 💻 Using Global CLI

After global installation, you can use `tokiforge` from any directory:

### Initialize a Project

```bash
# Navigate to your project
cd my-project

# Initialize TokiForge
tokiforge init
```

This creates:
- `tokens.json` - Your design tokens
- `tokiforge.config.json` - Configuration file

### Build Tokens

```bash
# Build tokens to various formats
tokiforge build
```

Generates:
- `dist/tokens.css` - CSS custom properties
- `dist/tokens.js` - JavaScript exports
- `dist/tokens.ts` - TypeScript exports
- `dist/tokens.scss` - SCSS variables

### Development Server

```bash
# Start preview server
tokiforge dev
```

Opens `http://localhost:3000` with live theme preview.

### Lint Tokens

```bash
# Validate tokens
tokiforge lint
```

---

## 🔄 Updating Global Installation

### If Installed from Local Source

```bash
# From TokiForge root
cd packages/cli
npm run build
npm install -g .
```

Or use the helper script:

```bash
# From TokiForge root
npm run install:global
```

### If Installed from npm

```bash
npm update -g tokiforge-cli
```

### If Using npm link (Development)

Changes are automatic, but you need to rebuild:

```bash
# From packages/cli
npm run build
```

---

## 🧹 Uninstalling

### Uninstall Global Installation

```bash
npm uninstall -g tokiforge-cli
```

### Unlink Global Symlink

```bash
npm unlink -g tokiforge-cli
```

Or manually:

```bash
npm unlink -g tokiforge-cli
# Then remove from your project
npm unlink tokiforge-cli
```

---

## 🔍 Find Global Installation Location

To see where the global CLI is installed:

```bash
npm list -g tokiforge-cli
```

Or find the binary location:

```bash
# Windows
where tokiforge

# macOS/Linux
which tokiforge
```

---

## ⚠️ Troubleshooting

### Issue: "tokiforge: command not found"

**Solutions:**
1. Check if globally installed:
   ```bash
   npm list -g tokiforge-cli
   ```
2. Check npm global bin path is in PATH:
   ```bash
   # Check npm global bin path
   npm config get prefix
   
   # Add to PATH (Windows)
   # Add %APPDATA%\npm to PATH
   
   # Add to PATH (macOS/Linux)
   # Add ~/.npm-global/bin to PATH
   ```
3. Restart terminal after installation
4. Reinstall:
   ```bash
   npm install -g tokiforge-cli
   ```

### Issue: "Permission denied" (macOS/Linux)

**Solution:** Use sudo (not recommended) or configure npm to use a different directory:

```bash
# Configure npm to use a directory you own
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'

# Add to PATH in ~/.bashrc or ~/.zshrc
export PATH=~/.npm-global/bin:$PATH

# Now install without sudo
npm install -g tokiforge-cli
```

### Issue: "Version mismatch" or "Outdated binary"

**Solution:** Rebuild and reinstall:

```bash
cd packages/cli
npm run build
npm install -g .
```

### Issue: "Cannot find module '@tokiforge/core'"

**Solution:** Make sure core package is built:

```bash
# From TokiForge root
npm run build:core
cd packages/cli
npm run build
npm install -g .
```

### Issue: Changes not reflected (using npm link)

**Solution:** Rebuild after changes:

```bash
cd packages/cli
npm run build
```

---

## 📝 Quick Reference

### Installation Commands

```bash
# Build and install globally (from root)
npm run install:global

# Manual installation
cd packages/cli
npm run build
npm install -g .

# Link for development
npm link
```

### Usage Commands

```bash
# Initialize
tokiforge init

# Build
tokiforge build

# Dev server
tokiforge dev

# Lint
tokiforge lint

# Check version
tokiforge --version
```

### Update Commands

```bash
# Update from local
npm run install:global

# Update from npm
npm update -g tokiforge-cli
```

---

## 🎯 Best Practices

1. **Use npm link for development** - Faster iteration
2. **Build before installing** - Ensures latest changes
3. **Check version** - Verify installation
4. **Use npx for one-time usage** - No installation needed
5. **Keep global version updated** - Get latest features

---

## 🌍 Cross-Platform Notes

### Windows

- Use `where` instead of `which`
- May need to add npm global bin to PATH
- Use PowerShell or Command Prompt

### macOS/Linux

- May need `sudo` for global installs (not recommended)
- Better to configure npm prefix
- Use `which` to find binary location

---

## 📚 Additional Resources

- [npm global installation guide](https://docs.npmjs.com/cli/v8/commands/npm-install#global)
- [npm link documentation](https://docs.npmjs.com/cli/v8/commands/npm-link)
- [npx documentation](https://docs.npmjs.com/cli/v8/commands/npx)

---

## 🚀 Quick Start

```bash
# 1. Install globally
npm run install:global

# 2. Navigate to your project
cd my-project

# 3. Initialize
tokiforge init

# 4. Build
tokiforge build

# 5. Start dev server
tokiforge dev
```

That's it! You're ready to use TokiForge globally! 🎉

