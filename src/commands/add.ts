import { Args, Command, Flags } from '@oclif/core';

import { installComponents } from '../installer/orchestrator.js';
import { logger } from '../utils/logger.js';

export default class Add extends Command {
  static override description = 'Add components to your project';

  static override examples = [
    '<%= config.bin %> add button',
    '<%= config.bin %> add button card dialog',
  ];

  static override flags = {
    cwd: Flags.string({
      default: process.cwd(),
      description: 'Working directory',
    }),
    'no-install': Flags.boolean({
      default: false,
      description: 'Skip dependency installation',
    }),
    overwrite: Flags.boolean({
      default: false,
      description: 'Overwrite existing files',
    }),
    yes: Flags.boolean({
      char: 'y',
      default: false,
      description: 'Skip confirmation prompts',
    }),
  };

  static override args = {
    components: Args.string({
      description: 'The components to add',
      required: true,
    }),
  };

  static override strict = false;

  public async run(): Promise<void> {
    const { argv, flags } = await this.parse(Add);
    const components = argv as unknown as string[];

    try {
      await installComponents(components, {
        cwd: flags.cwd,
        install: !flags['no-install'],
        overwrite: flags.overwrite,
        yes: flags.yes,
      });
    } catch (error) {
      if (error instanceof Error) {
        logger.error(error.message);
      } else {
        logger.error('An unknown error occurred');
      }
      this.exit(1);
    }
  }
}
