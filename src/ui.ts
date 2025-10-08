import chalk from 'chalk';
import ora, { Ora } from 'ora';
import inquirer from 'inquirer';
import { getDiff } from './git';

type MessageType = 'title' | 'success' | 'error' | 'warning' | 'info';

export function displayMessage(
	message: string,
	type: MessageType = 'info'
): void {
	const styles = {
		title: chalk.bold.cyan,
		success: chalk.green,
		error: chalk.red,
		warning: chalk.yellow,
		info: chalk.blue,
	};

	console.log(styles[type](message));
}

export function showSpinner(text: string): Ora {
	return ora(text).start();
}

export async function displayDiff(): Promise<void> {
	const { diff } = await getDiff();

	if (diff) {
		const lines = diff.split('\n').slice(0, 20);
		const preview = lines.join('\n');

		console.log(chalk.gray('\n📄 Diff Preview (first 20 lines):'));
		console.log(chalk.gray('─'.repeat(50)));
		console.log(preview);
		if (diff.split('\n').length > 20) {
			console.log(chalk.gray('...(truncated)'));
		}
		console.log(chalk.gray('─'.repeat(50)));
	}
}

interface ConfirmResult {
	confirmed: boolean;
	shouldPush: boolean;
	shouldStageAll: boolean;
}

export async function confirmCommit(options: any = {}): Promise<ConfirmResult> {
	const answers = await inquirer.prompt([
		{
			type: 'confirm',
			name: 'confirmed',
			message: 'Proceed with this commit message?',
			default: true,
		},
		{
			type: 'confirm',
			name: 'shouldStageAll',
			message: 'Stage all unstaged files?',
			default: options.stage !== false,
			when: (answers: any) => answers.confirmed,
		},
		{
			type: 'confirm',
			name: 'shouldPush',
			message: 'Push to remote after commit?',
			default: options.push !== false,
			when: (answers: any) => answers.confirmed,
		},
	]);

	return answers as ConfirmResult;
}
