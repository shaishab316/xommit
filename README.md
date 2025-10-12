# Xommit

is a VS Code extension that leverages AI to generate meaningful and concise Git commit messages by analyzing your code changes. It integrates seamlessly into the VS Code Source Control panel, supports Gitmoji, and can optionally auto-stage changes.

## ![Xommit Screenshot](https://raw.githubusercontent.com/shaishab316/xommit/refs/heads/vscode_ext/images/screenshot.png)

## Features

- Generate commit messages automatically using AI (Google Gemini API).
- Supports **Gitmoji** for visually expressive commit messages.
- Auto-stage unstaged changes before generating commits.
- Works directly from the **Source Control input box**.
- Follows **Conventional Commit format** (`feat:`, `fix:`, `chore:`, etc.).
- Handles large diffs efficiently by splitting them into chunks.

---

## Installation

1. Install the extension in VS Code:

   - From VS Code Marketplace: search for `Xommit`.
   - Or manually install the `.vsix` package.

2. Make sure you have Git initialized in your project.

---

## Configuration

Xommit requires a **Google Gemini API Key** to generate commit messages.

### Steps:

1. Open the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P`).
2. Search for **Xommit: Configure**.
3. Enter your API key when prompted.

---

## Usage

### Generate Commit Message

1. Open the command palette and run **Xommit: Generate Commit Message**.
2. If auto-stage is enabled, unstaged files will be staged automatically (or ask for confirmation).
3. The AI-generated commit message will populate the Source Control input box.

### Generate From Source Control Input Box

- Click the **Xommit button** in the Source Control input box to instantly generate a commit message based on staged changes.

---

## Example

Suppose you modified two files and added new features. After running Xommit, it might generate:

```
✨ docs: Add README for Xommit VS Code extension

This commit introduces a README file for the Xommit VS Code
extension, detailing its features, installation, configuration,
usage, and contribution guidelines for generating AI-powered Git
commit messages. It also adds a screenshot of the extension in
action.
```

---

## Extension Settings

| Setting             | Type    | Default | Description                                            |
| ------------------- | ------- | ------- | ------------------------------------------------------ |
| `xommit.apiKey`     | string  | `""`    | Your Google Gemini API key.                            |
| `xommit.useGitmoji` | boolean | `true`  | Whether to include Gitmoji in commit messages.         |
| `xommit.autoStage`  | boolean | `false` | Auto-stage unstaged changes before generating commits. |

---

## Requirements

- VS Code 1.80+
- Git installed and initialized in your workspace
- Google Gemini API key

---

## Contributing

Contributions are welcome! Feel free to:

- Report issues
- Submit feature requests
- Open pull requests

---

## License

MIT License © Shaishab Chandra Shil
