import simpleGit, { SimpleGit, StatusResult } from 'simple-git';

const git: SimpleGit = simpleGit();

interface GitChanges {
	hasChanges: boolean;
	stagedFiles: string[];
	unstagedFiles: string[];
	newFiles: string[];
	status: StatusResult;
}

export async function checkGitChanges(): Promise<GitChanges> {
	const status = await git.status();

	const stagedFiles = status.staged;
	const unstagedFiles = status.modified.filter((f) => !stagedFiles.includes(f));
	const newFiles = status.not_added;

	const hasChanges =
		stagedFiles.length > 0 || unstagedFiles.length > 0 || newFiles.length > 0;

	return {
		hasChanges,
		stagedFiles,
		unstagedFiles,
		newFiles,
		status,
	};
}

export async function getStagedDiff(): Promise<string> {
	try {
		const diff = await git.diff(['--cached']);
		return diff || '';
	} catch (error) {
		return '';
	}
}

export async function getUnstagedDiff(): Promise<string> {
	try {
		const diff = await git.diff();
		return diff || '';
	} catch (error) {
		return '';
	}
}

interface DiffResult {
	type: 'staged' | 'unstaged';
	diff: string;
}

export async function getDiff(): Promise<DiffResult> {
	const stagedDiff = await getStagedDiff();
	if (stagedDiff) {
		return { type: 'staged', diff: stagedDiff };
	}

	const unstagedDiff = await getUnstagedDiff();
	return { type: 'unstaged', diff: unstagedDiff };
}

export async function addAllFiles(): Promise<void> {
	await git.add('.');
}

export async function commitAndPush(
	message: string,
	shouldPush = false
): Promise<void> {
	await git.commit(message);

	if (shouldPush) {
		await git.push();
	}
}
