# 🏠 Local Usage Guide

This guide explains how to use TokiForge packages locally for development and testing.

## 📋 Table of Contents

1. [Setup for Local Development](#setup-for-local-development)
2. [Using in the Monorepo](#using-in-the-monorepo)
3. [Using in a Separate Project](#using-in-a-separate-project)
4. [Development Workflow](#development-workflow)
5. [Troubleshooting](#troubleshooting)

---

## 🚀 Setup for Local Development

### 1. Install Dependencies

```bash
# From the root directory
npm install
```

This installs all dependencies for all packages in the monorepo.

### 2. Build All Packages

```bash
# Build all packages
npm run build

# Or build specific packages
npm run build:core        # Build only core
npm run build:rest        # Build all except core
npm run build:all         # Build all packages
```

### 3. Watch Mode (Development)

```bash
# Watch all packages for changes
npm run dev
```

This starts watch mode for all packages, automatically rebuilding when you make changes.

---

## 🏗️ Using in the Monorepo

The examples in the `examples/` directory already use the workspace protocol:

### React Example

```json
{
  "dependencies": {
    "@tokiforge/core": "workspace:*",
    "@tokiforge/react": "workspace:*"
  }
}
```

The `workspace:*` protocol automatically uses the local packages from the monorepo.

### Running Examples

```bash
# Navigate to an example
cd examples/react-example

# Install dependencies (includes local packages)
npm install

# Run the example
npm run dev
```

---

## 🔗 Using in a Separate Project

If you want to use TokiForge in a project **outside** this monorepo, you have several options:

### Option 1: npm link (Recommended for Development)

#### Step 1: Link Packages from TokiForge

```bash
# From the TokiForge root directory
cd packages/core
npm link

cd ../react
npm link
npm link @tokiforge/core  # Link dependency

cd ../vue
npm link
npm link @tokiforge/core

cd ../svelte
npm link
npm link @tokiforge/core

cd ../cli
npm link
```

#### Step 2: Use in Your Project

```bash
# From your project directory
npm link @tokiforge/core
npm link @tokiforge/react  # If using React
npm link @tokiforge/vue    # If using Vue
npm link @tokiforge/svelte # If using Svelte
npm link tokiforge-cli     # If using CLI
```

#### Step 3: Build Before Using

Make sure to build the packages first:

```bash
# From TokiForge root
npm run build
```

Or use watch mode for automatic rebuilding:

```bash
# From TokiForge root (in one terminal)
npm run dev

# From your project (in another terminal)
npm run dev
```

---

### Option 2: File Path (Simple but Limited)

In your project's `package.json`:

```json
{
  "dependencies": {
    "@tokiforge/core": "file:../tokiforge/packages/core",
    "@tokiforge/react": "file:../tokiforge/packages/react"
  }
}
```

**Note:** This requires the packages to be built first. Path must be relative to your project.

---

### Option 3: Local Registry (Advanced)

If you want to test the full npm publishing experience:

```bash
# Install verdaccio (local npm registry)
npm install -g verdaccio

# Start verdaccio
verdaccio

# In another terminal, publish to local registry
npm config set registry http://localhost:4873

# From TokiForge packages
cd packages/core
npm publish

cd ../react
npm publish

# In your project
npm install @tokiforge/core @tokiforge/react
```

---

## 💻 Development Workflow

### Recommended Workflow

1. **Terminal 1: Watch Mode**
   ```bash
   cd tokiforge
   npm run dev
   ```
   This watches all packages and rebuilds automatically.

2. **Terminal 2: Your Project**
   ```bash
   cd your-project
   npm run dev
   ```
   Your project will use the linked packages and see changes automatically.

### Testing Changes

1. Make changes to TokiForge source files
2. Watch mode automatically rebuilds
3. Your project automatically picks up changes (if using watch mode)
4. Test in your project

### Building for Production Testing

```bash
# From TokiForge root
npm run build

# This creates optimized production builds
# Test these in your project to ensure everything works
```

---

## 🛠️ CLI Usage Locally

### Using the Local CLI

#### Option 1: Link the CLI

```bash
# From tokiforge/packages/cli
npm link

# From your project
npm link tokiforge-cli

# Now you can use it
tokiforge init
tokiforge build
```

#### Option 2: Use Directly

```bash
# From your project directory
node ../tokiforge/packages/cli/dist/cli.js init
node ../tokiforge/packages/cli/dist/cli.js build
```

#### Option 3: Add to package.json Scripts

```json
{
  "scripts": {
    "tokiforge": "node ../tokiforge/packages/cli/dist/cli.js"
  }
}
```

Then use:
```bash
npm run tokiforge init
npm run tokiforge build
```

---

## 🔄 Updating Linked Packages

When you make changes:

1. **If using watch mode**: Changes are automatic
2. **If not using watch mode**: Rebuild manually
   ```bash
   cd tokiforge
   npm run build
   ```

---

## 🧹 Unlinking

To unlink packages:

```bash
# From your project
npm unlink @tokiforge/core
npm unlink @tokiforge/react

# Reinstall from npm (if you want published versions)
npm install @tokiforge/core @tokiforge/react
```

---

## ⚠️ Troubleshooting

### Issue: "Module not found"

**Solution:** Make sure packages are built:
```bash
cd tokiforge
npm run build
```

### Issue: Changes not reflected

**Solutions:**
1. Rebuild the packages: `npm run build`
2. Use watch mode: `npm run dev`
3. Clear node_modules and reinstall in your project
4. Restart your dev server

### Issue: TypeScript errors in linked packages

**Solution:** Make sure declaration files are generated:
```bash
cd tokiforge
npm run build
```

### Issue: npm link not working

**Solutions:**
1. Check paths are correct
2. Rebuild packages after linking
3. Try unlinking and re-linking
4. Use `file:` protocol instead

### Issue: Workspace protocol not working

**Solution:** Make sure you're using npm workspaces or compatible package manager:
```bash
npm install
```

---

## 📝 Quick Reference

### Setup Commands

```bash
# Install all dependencies
npm install

# Build all packages
npm run build

# Watch mode (auto-rebuild)
npm run dev

# Clean build artifacts
npm run clean
```

### Linking Commands

```bash
# Link packages (from tokiforge/packages/<package>)
npm link

# Use in your project
npm link @tokiforge/core
npm link @tokiforge/react
```

### Example Project Setup

```json
{
  "dependencies": {
    "@tokiforge/core": "workspace:*",
    "@tokiforge/react": "workspace:*"
  }
}
```

---

## 🎯 Best Practices

1. **Always use watch mode** (`npm run dev`) during development
2. **Build before testing** production builds
3. **Use workspace protocol** if working within the monorepo
4. **Use npm link** for separate projects
5. **Keep packages in sync** - rebuild when dependencies change

---

## 📚 Additional Resources

- [npm link documentation](https://docs.npmjs.com/cli/v8/commands/npm-link)
- [npm workspaces documentation](https://docs.npmjs.com/cli/v8/using-npm/workspaces)
- [TypeScript project references](https://www.typescriptlang.org/docs/handbook/project-references.html)

---

Happy coding! 🚀

