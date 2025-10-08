import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.xommit');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

interface Config {
  geminiKey?: string;
}

function ensureConfigDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

function getConfig(): Config {
  if (!fs.existsSync(CONFIG_FILE)) {
    return {};
  }

  try {
    const data = fs.readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

function saveConfig(config: Config): void {
  ensureConfigDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export async function setApiKey(apiKey: string): Promise<void> {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('API key cannot be empty');
  }

  const config = getConfig();
  config.geminiKey = apiKey.trim();
  saveConfig(config);
}

export function getApiKey(): string | null {
  const config = getConfig();
  return config.geminiKey || null;
}

export function hasApiKey(): boolean {
  return !!getApiKey();
}

export { CONFIG_DIR, CONFIG_FILE };
