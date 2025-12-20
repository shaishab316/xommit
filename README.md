# xommit (deprecated)

[![npm version](https://img.shields.io/npm/v/xommit.svg)](https://www.npmjs.com/package/xommit)
[![License](https://img.shields.io/npm/l/xommit.svg)](https://github.com/shaishab316/xommit/blob/main/LICENSE)
[![Downloads](https://img.shields.io/npm/dt/xommit.svg)](https://www.npmjs.com/package/xommit)
[![Issues](https://img.shields.io/github/issues/shaishab316/xommit.svg)](https://github.com/shaishab316/xommit/issues)
[![Visual Studio Marketplace](https://img.shields.io/badge/Visual_Studio_Marketplace-007ACC.svg?style=flat&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=shaishab316.xommit-vscode)

Automatically generate meaningful commit messages using AI by analyzing your git changes. Save time and maintain consistent commit message quality across your projects.

---

## Features

- Generate semantic, conventional commit messages automatically.
- CLI-based, lightweight, and easy to integrate into any workflow.
- Supports AI-driven commit suggestions for consistent commit quality.
- Saves time on repetitive commit message writing.

---

## VsCode Extension
## ![Xommit Screenshot](https://raw.githubusercontent.com/shaishab316/xommit/refs/heads/vscode_ext/images/screenshot.png)
[https://marketplace.visualstudio.com/items?itemName=shaishab316.xommit-vscode](https://marketplace.visualstudio.com/items?itemName=shaishab316.xommit-vscode)

---

## Installation

```bash
npm i -g xommit
```

> Or run without installing globally using `npx`:

```bash
npx xommit
```

---

## Usage

After setting your key, run the CLI in your git project:

```bash
xommit
```

The tool will:

1. Analyze staged git changes.
2. Generate a meaningful commit message using AI.
3. Prompt you to accept, edit, or regenerate the commit message.
4. Stage and push the changes to your remote repository.
5. Also use gitmojis if configured.

### Example

```bash
$ git add . #optional
$ xommit
💡 Generated Commit Message:
docs: add CONTRIBUTING.md and README.md

Adds initial documentation for the project, including a README and
contributing guidelines.
? Proceed with this commit message? (Y/n)
```

---

## CLI Options

- `xommit config` - open configuration file in your editor.
- `xommit set <key> <value>` - set a configuration value.
- `xommit get <key>` - get a configuration value.

---

## Development

Clone the repository and install dependencies:

```bash
git clone https://github.com/shaishab316/xommit.git
cd xommit
npm i
```

Build the project:

```bash
npm run build
```

Run in development mode:

```bash
npm run dev
```

Lint and format code:

```bash
npm run lint
npm run format
```

Clean build files:

```bash
npm run clean
```

---

## Links

- Repository: [https://github.com/shaishab316/xommit](https://github.com/shaishab316/xommit)
- Issues: [https://github.com/shaishab316/xommit/issues](https://github.com/shaishab316/xommit/issues)
- Contributing: [CONTRIBUTING.md](CONTRIBUTING.md)
