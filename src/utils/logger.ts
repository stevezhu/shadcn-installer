import { ux } from '@oclif/core';

export const logger = {
  break: () =>{  ux.stdout(''); },
  error: (message: string) =>{  ux.stderr(ux.colorize('redBright', message)); },
  info: (message: string) =>{  ux.stdout(ux.colorize('blueBright', message)); },
  success: (message: string) =>{  ux.stdout(ux.colorize('greenBright', message)); },
  table: (data: any[], columns: any) => {
    // ux.table is missing in this version, fallback to console.log for now
    // or just ignore if it's not critical
    console.log('Table data:', data, columns);
  },
  warn: (message: string) =>{  ux.stdout(ux.colorize('yellowBright', message)); },
};
