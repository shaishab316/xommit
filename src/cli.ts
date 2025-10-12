#!/usr/bin/env node

import cac from 'cac';
import chalk from 'chalk';
import { runCommit } from '.';
import { version } from '../package.json';
import config, { CONFIG_FILE } from './config';
import { exec } from 'child_process';

process.on('beforeExit', config.flush);

const cli = cac('xommit');

cli
  .command('set <key> <value>', 'Set a configuration value')
  .action((key: string, value: string) => {
    try {
      config.set({ [key]: value });
      console.log(chalk.green(`✅ Successfully set ${key}`));
    } catch (error: any) {
      console.log(chalk.red(`❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

cli.command('get <key>', 'Get a configuration value').action((key: string) => {
  console.log(chalk.bold.underline.gray(config.get(key)));
});

cli.command('config', 'Open configuration file in default editor').action(async () => {
  const cmd =
    process.platform === 'win32'
      ? `start "" "${CONFIG_FILE}"`
      : process.platform === 'darwin'
        ? `open "${CONFIG_FILE}"`
        : `xdg-open "${CONFIG_FILE}"`;

  exec(cmd);
});

cli
  .command('', 'Generate AI commit message and commit')
  .option('--no-push', 'Skip pushing to remote')
  .option('--no-stage', 'Skip staging unstaged files')
  .action(async (options: any) => {
    try {
      await runCommit(options);
    } catch (error: any) {
      console.log(chalk.red(`❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

cli.help();
cli.version(version);

cli.parse();
