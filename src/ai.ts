import axios from 'axios';
import { getDiff } from './git';
import { getApiKey } from './config';

const AI_API_ENDPOINT =
	'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function generateCommitMessage(): Promise<string> {
	const { type, diff } = await getDiff();

	if (!diff) {
		return 'chore: update files';
	}

	const truncatedDiff =
		diff.length > 8000 ? diff.substring(0, 8000) + '\n...(truncated)' : diff;

	const prompt = `Generate a concise, professional git commit message for the following ${type} changes. 
Follow conventional commit format (feat:, fix:, docs:, style:, refactor:, test:, chore:).
Keep it under 72 characters for the summary line.
If needed, add a blank line and detailed description.

Changes:
${truncatedDiff}

Return ONLY the commit message, nothing else.`;

	try {
		const apiKey = getApiKey();
		if (!apiKey) {
			throw new Error('API key not found');
		}

		const response = await axios.post(
			`${AI_API_ENDPOINT}?key=${apiKey}`,
			{
				contents: [
					{
						parts: [
							{
								text: prompt,
							},
						],
					},
				],
			},
			{
				headers: {
					'Content-Type': 'application/json',
				},
			}
		);

		const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

		if (!text) {
			throw new Error('No response from AI');
		}

		return text
			.trim()
			.replace(/^```|```$/g, '')
			.trim();
	} catch (error: any) {
		console.error('AI API Error:', error.message);
		return `chore: update ${type} files`;
	}
}
