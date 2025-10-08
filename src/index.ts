import { checkGitChanges, commitAndPush, addAllFiles } from './git';
import { generateCommitMessage } from './ai';
import { displayMessage, displayDiff, confirmCommit, showSpinner } from './ui';

interface CommitOptions {
	push?: boolean;
	stage?: boolean;
}

export async function runCommit(options: CommitOptions = {}): Promise<void> {
	try {
		displayMessage('🚀 AI Git Commit', 'title');

		const spinner = showSpinner('Checking git status...');
		const { hasChanges, stagedFiles, unstagedFiles, newFiles } =
			await checkGitChanges();
		spinner.stop();

		if (!hasChanges) {
			displayMessage('No changes or new files detected. Exiting.', 'warning');
			process.exit(0);
		}

		displayMessage(`\n📊 Changes detected:`, 'info');
		if (stagedFiles.length > 0) {
			displayMessage(`  Staged files: ${stagedFiles.length}`, 'success');
		}
		if (unstagedFiles.length > 0) {
			displayMessage(`  Unstaged files: ${unstagedFiles.length}`, 'warning');
		}
		if (newFiles.length > 0) {
			displayMessage(`  New files: ${newFiles.length}`, 'info');
		}

		await displayDiff();

		const genSpinner = showSpinner('Generating AI commit message...');
		const commitMessage = await generateCommitMessage();
		genSpinner.stop();

		displayMessage('\n💡 Generated Commit Message:', 'title');
		displayMessage(commitMessage, 'success');

		const { confirmed, shouldPush, shouldStageAll } =
			await confirmCommit(options);

		if (!confirmed) {
			displayMessage('\n❌ Commit cancelled', 'error');
			process.exit(0);
		}

		if (shouldStageAll && unstagedFiles.length > 0) {
			const stageSpinner = showSpinner('Staging all files...');
			await addAllFiles();
			stageSpinner.stop();
			displayMessage('✅ All files staged', 'success');
		}

		const commitSpinner = showSpinner('Committing changes...');
		await commitAndPush(commitMessage, shouldPush);
		commitSpinner.stop();

		displayMessage(`\n✅ Changes committed successfully!`, 'success');
		if (shouldPush) {
			displayMessage('✅ Changes pushed to remote!', 'success');
		}
	} catch (error) {
		throw error;
	}
}
