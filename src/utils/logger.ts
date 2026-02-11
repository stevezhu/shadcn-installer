import { ux } from "@oclif/core"

export const logger = {
  info: (message: string) => ux.stdout(ux.colorize("blueBright", message)),
  success: (message: string) => ux.stdout(ux.colorize("greenBright", message)),
  warn: (message: string) => ux.stdout(ux.colorize("yellowBright", message)),
  error: (message: string) => ux.stderr(ux.colorize("redBright", message)),
  break: () => ux.stdout(""),
  table: (data: any[], columns: any) => {
    // ux.table is missing in this version, fallback to console.log for now
    // or just ignore if it's not critical
    console.log("Table data:", data, columns)
  },
}
