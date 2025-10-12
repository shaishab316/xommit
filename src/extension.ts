import * as vscode from 'vscode';
import axios from 'axios';

const CHUNK_SIZE = 7000;
const AI_API_ENDPOINT =
	'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface ExtensionConfig {
	apiKey: string;
	useGitmoji: boolean;
	autoStage: boolean;
}

export function activate(context: vscode.ExtensionContext) {
	console.log('xommit extension activated');

	// Register command for generating commit message
	const generateCommitCmd = vscode.commands.registerCommand(
		'xommit.generateCommitMessage',
		async () => {
			try {
				await generateAndSetCommitMessage(context);
			} catch (error: any) {
				vscode.window.showErrorMessage(`Xommit Error: ${error.message}`);
			}
		}
	);

	// Register command for configuring API key
	const configureCmd = vscode.commands.registerCommand(
		'xommit.configure',
		async () => {
			await configureExtension(context);
		}
	);

	// Add button to Source Control input box
	const scmInputBox = vscode.commands.registerCommand(
		'xommit.generateFromSCM',
		async () => {
			try {
				await generateAndSetCommitMessage(context);
			} catch (error: any) {
				vscode.window.showErrorMessage(`Xommit Error: ${error.message}`);
			}
		}
	);

	context.subscriptions.push(generateCommitCmd, configureCmd, scmInputBox);
}

async function getConfig(
	context: vscode.ExtensionContext
): Promise<ExtensionConfig> {
	const config = vscode.workspace.getConfiguration('xommit');

	let apiKey =
		context.globalState.get<string>('apiKey') ||
		config.get<string>('apiKey') ||
		'';
	const useGitmoji = config.get<boolean>('useGitmoji', true);
	const autoStage = config.get<boolean>('autoStage', true);

	if (!apiKey) {
		apiKey =
			(await vscode.window.showInputBox({
				prompt: 'Enter your Google Gemini API Key',
				password: true,
				ignoreFocusOut: true,
				placeHolder: 'AIzaSy...',
			})) || '';

		if (apiKey) {
			await context.globalState.update('apiKey', apiKey);
		} else {
			throw new Error('API Key is required');
		}
	}

	return { apiKey, useGitmoji, autoStage };
}

async function configureExtension(context: vscode.ExtensionContext) {
	const apiKey = await vscode.window.showInputBox({
		prompt: 'Enter your Google Gemini API Key',
		password: true,
		ignoreFocusOut: true,
		placeHolder: 'AIzaSy...',
		value: context.globalState.get<string>('apiKey') || '',
	});

	if (apiKey) {
		await context.globalState.update('apiKey', apiKey);
		vscode.window.showInformationMessage('API Key saved successfully!');
	}

	const useGitmoji = await vscode.window.showQuickPick(['Yes', 'No'], {
		placeHolder: 'Use Gitmoji in commit messages?',
		ignoreFocusOut: true,
	});

	if (useGitmoji) {
		await vscode.workspace
			.getConfiguration('xommit')
			.update(
				'useGitmoji',
				useGitmoji === 'Yes',
				vscode.ConfigurationTarget.Global
			);
	}
}

async function generateAndSetCommitMessage(context: vscode.ExtensionContext) {
	const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;

	if (!gitExtension) {
		throw new Error('Git extension not found');
	}

	const git = gitExtension.getAPI(1);

	if (git.repositories.length === 0) {
		throw new Error('No Git repository found');
	}

	const repo = git.repositories[0];
	const config = await getConfig(context);

	// Check for changes
	const changes = repo.state.workingTreeChanges;
	const staged = repo.state.indexChanges;

	if (changes.length === 0 && staged.length === 0) {
		vscode.window.showWarningMessage('No changes detected');
		return;
	}

	// Auto-stage if configured
	if (config.autoStage && changes.length > 0) {
		const shouldStage = await vscode.window.showQuickPick(['Yes', 'No'], {
			placeHolder: `Stage ${changes.length} unstaged file(s)?`,
			ignoreFocusOut: true,
		});

		if (shouldStage === 'Yes') {
			await vscode.window.withProgress(
				{
					location: vscode.ProgressLocation.Notification,
					title: 'Staging files...',
					cancellable: false,
				},
				async () => {
					for (const change of changes) {
						await repo.add([change.uri.fsPath]);
					}
				}
			);
		}
	}

	// Get diff
	const diff = await getDiff(repo);

	if (!diff) {
		vscode.window.showWarningMessage('No staged changes to commit');
		return;
	}

	// Generate commit message
	const message = await vscode.window.withProgress(
		{
			location: vscode.ProgressLocation.Notification,
			title: 'Generating AI commit message...',
			cancellable: false,
		},
		async () => {
			return await generateCommitMessage(diff, config);
		}
	);

	// Set the commit message in the Source Control input box
	repo.inputBox.value = message;

	vscode.window.showInformationMessage('Commit message generated!');
}

async function getDiff(repo: any): Promise<string> {
	try {
		// Get staged diff
		const diff = await repo.diff(true);
		return diff || '';
	} catch (error) {
		console.error('Error getting diff:', error);
		return '';
	}
}

async function generateCommitMessage(
	diff: string,
	config: ExtensionConfig
): Promise<string> {
	if (!diff) return 'chore: update files';

	// Split diff into chunks
	const chunks: string[] = [];
	for (let i = 0; i < diff.length; i += CHUNK_SIZE) {
		chunks.push(diff.slice(i, i + CHUNK_SIZE));
	}

	try {
		// Summarize each chunk
		const summaries: string[] = [];

		for (const [index, chunk] of chunks.entries()) {
			const summaryPrompt = `Summarize the following code changes part (${
				index + 1
			}/${chunks.length}) in one or two sentences for commit context:

${chunk}

Return only the summary.`;

			const summaryRes = await axios.post(
				`${AI_API_ENDPOINT}?key=${config.apiKey}`,
				{
					contents: [{ parts: [{ text: summaryPrompt }] }],
				},
				{ headers: { 'Content-Type': 'application/json' } }
			);

			const summary =
				summaryRes.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
				'';
			if (summary) summaries.push(summary);
		}

		// Generate final commit message
		const finalPrompt = `Based on the following summaries of code changes, generate a concise, professional git commit message.
${config.useGitmoji ? 'Also use appropriate gitmoji emoji.' : ''}
Follow conventional commit format (feat:, fix:, docs:, style:, refactor:, test:, chore:).
Keep the first line under 72 characters.
If needed, include a detailed description after a blank line.

Summaries:
${summaries.join('\n- ')}

Return ONLY the commit message, nothing else.`;

		const finalRes = await axios.post(
			`${AI_API_ENDPOINT}?key=${config.apiKey}`,
			{
				contents: [{ parts: [{ text: finalPrompt }] }],
			},
			{ headers: { 'Content-Type': 'application/json' } }
		);

		const text = finalRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;

		if (!text) throw new Error('No response from AI');

		return text
			.trim()
			.replace(/^```|```$/g, '')
			.trim();
	} catch (err: any) {
		console.error('AI API Error:', err);
		throw new Error('Failed to generate commit message: ' + err.message);
	}
}

export function deactivate() {
	console.log('xommit extension deactivated');
}
