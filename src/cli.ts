#!/usr/bin/env node

import cac from 'cac';
import chalk from 'chalk';
import { getApiKey, hasApiKey, setApiKey } from './config';
import { runCommit } from '.';
import { version } from '../package.json';

const cli = cac('xommit');

cli.command('setkey <apikey>', 'Set your Gemini API key').action(async (apikey: string) => {
  try {
    await setApiKey(apikey);
    console.log(chalk.green('✅ API key saved successfully!'));
    console.log(chalk.gray('You can now use: xommit'));
  } catch (error: any) {
    console.log(chalk.red(`❌ Error: ${error.message}`));
    process.exit(1);
  }
});

cli.command('getkey', 'Show your current API key').action(() => {
  const key = getApiKey();
  if (key) {
    const masked = key.substring(0, 8) + '...' + key.substring(key.length - 4);
    console.log(chalk.green('Current API key:'), chalk.gray(masked));
  } else {
    console.log(chalk.yellow('No API key set'));
  }
});

cli
  .command('', 'Generate AI commit message and commit')
  .option('--no-push', 'Skip pushing to remote')
  .option('--no-stage', 'Skip staging unstaged files')
  .action(async (options: any) => {
    try {
      if (!hasApiKey()) {
        console.log(chalk.red('❌ API key not found!'));
        console.log(chalk.yellow('\nSet your API key first:'));
        console.log(chalk.cyan('  xommit setkey YOUR_API_KEY'));
        console.log(chalk.gray('\nGet your key from: https://makersuite.google.com/app/apikey'));
        process.exit(1);
      }

      await runCommit(options);
    } catch (error: any) {
      console.log(chalk.red(`❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

cli.help();
cli.version(version);

cli.parse();
