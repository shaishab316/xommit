import axios from 'axios';
import { getDiff } from './git';
import { getApiKey } from './config';

const CHUNK_SIZE = 7000;
const AI_API_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function generateCommitMessage(): Promise<string> {
  const { type, diff } = await getDiff();

  if (!diff) return 'chore: update files';

  const apiKey = getApiKey();
  if (!apiKey) throw new Error('API key not found');

  // Split diff into safe chunks
  const chunks = [];
  for (let i = 0; i < diff.length; i += CHUNK_SIZE) {
    chunks.push(diff.slice(i, i + CHUNK_SIZE));
  }

  try {
    // Step 1: summarize each chunk separately
    const summaries = [];
    for (const [index, chunk] of chunks.entries()) {
      const summaryPrompt = `Summarize the following code changes part (${index + 1}/${chunks.length}) in one or two sentences for commit context:

${chunk}

Return only the summary.`;

      const summaryRes = await axios.post(
        `${AI_API_ENDPOINT}?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: summaryPrompt }] }],
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const summary = summaryRes.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      if (summary) summaries.push(summary);
    }

    // Step 2: generate final commit message using summaries
    const finalPrompt = `Based on the following summaries of code changes, generate a concise, professional git commit message.

Follow conventional commit format (feat:, fix:, docs:, style:, refactor:, test:, chore:), gitmoji etc. Keep semantic prefix first, :gitmoji: after the colon. then a " ".
Keep the first line under 72 characters.
If needed, include a detailed description after a blank line.

Type of change: ${type}

Summaries:
${summaries.join('\n- ')}

Return ONLY the commit message, nothing else.`;

    const finalRes = await axios.post(
      `${AI_API_ENDPOINT}?key=${apiKey}`,
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
    console.error('AI API Error:', err.message);
    return `chore: update ${type} files`;
  }
}
