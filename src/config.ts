import fs from 'fs';
import path from 'path';
import os from 'os';

export const CONFIG_DIR = path.join(os.homedir(), '.xommit');
export const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

class Config {
  private static _instance: Config;
  private _states: Map<string, any> = new Map();
  private _saveTimeout: NodeJS.Timeout | null = null;
  private _isDirty: boolean = false;

  //! Singleton
  private constructor() {}

  public static getInstance(): Config {
    if (!this._instance) {
      this._instance = new Config();
      this._instance._init();
    }
    return this._instance;
  }

  private _init(): void {
    const default_config = {
      apikey: null,
      gitmoji: null,
    };

    try {
      if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
      }

      if (fs.existsSync(CONFIG_FILE)) {
        const data = fs.readFileSync(CONFIG_FILE, 'utf8');

        Object.assign(default_config, JSON.parse(data) || {});

        for (const [key, value] of Object.entries(default_config)) {
          this._states.set(key, value ?? null);
        }
      } else {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(default_config, null, 2), 'utf8');
      }
    } catch (error) {
      console.error('Failed to initialize config:', error);
    }
  }

  private _save(): void {
    this._isDirty = true;

    if (this._saveTimeout) {
      clearTimeout(this._saveTimeout);
    }

    this._saveTimeout = setTimeout(() => {
      if (this._isDirty) {
        try {
          const obj = Object.fromEntries(this._states);
          fs.writeFileSync(CONFIG_FILE, JSON.stringify(obj, null, 2), 'utf8');
          this._isDirty = false;
        } catch (error) {
          console.error('Failed to save config:', error);
        }
      }
    }, 100);
  }

  public get(key: string): string | undefined {
    return this._states.get(key);
  }

  public delete(key: string): boolean {
    const deleted = this._states.delete(key);
    if (deleted) {
      this._save();
    }
    return deleted;
  }

  public clear(): void {
    this._states.clear();
    this._save();
  }

  public getAll(): Map<string, string> {
    return new Map(this._states);
  }

  public has(key: string): boolean {
    return this._states.get(key) !== null;
  }

  public size(): number {
    return this._states.size;
  }

  public set(entries: Record<string, string>): void {
    for (const [key, value] of Object.entries(entries)) {
      this._states.set(key, value);
    }

    this._save();
  }

  public flush(): void {
    if (this._saveTimeout) {
      clearTimeout(this._saveTimeout);
      this._saveTimeout = null;
    }
    if (this._isDirty) {
      try {
        const obj = Object.fromEntries(this._states);
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(obj, null, 2), 'utf8');
        this._isDirty = false;
      } catch (error) {
        console.error('Failed to flush config:', error);
      }
    }
  }
}

export default Config.getInstance();
