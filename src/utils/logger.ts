import { ux } from "@oclif/core"
import picocolors from "picocolors"

export const logger = {
  info: (message: string) => console.log(picocolors.blue(message)),
  success: (message: string) => console.log(picocolors.green(message)),
  warn: (message: string) => console.log(picocolors.yellow(message)),
  error: (message: string) => console.error(picocolors.red(message)),
  break: () => console.log(""),
  table: (data: any[], columns: any) => ux.table(data, columns),
}
