import { LEVELS, levels_array } from "../utils/constants/levels";

export class Logger {
  private logLevel: string;

  constructor() {
    this.logLevel = process.env.REVENIUM_LOG_LEVEL?.toUpperCase() || "INFO";
  }

  private shouldLog(level: string): boolean {
    const currentLevel: number = levels_array.indexOf(this.logLevel);
    const messageLevel: number = levels_array.indexOf(level);
    return messageLevel >= currentLevel;
  }

  private formatMessage(
    level: string,
    message: string,
    ...args: any[]
  ): string {
    const timestamp: string = new Date().toISOString();
    const prefix: string = `[${timestamp}] [Revenium] [${level}]`;

    if (args.length > 0) {
      return `${prefix} ${message} ${args
        .map((arg) =>
          typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
        )
        .join(" ")}`;
    }
    return `${prefix} ${message}`;
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog(LEVELS.DEBUG)) {
      console.debug(this.formatMessage(LEVELS.DEBUG, message, ...args));
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog(LEVELS.INFO)) {
      console.info(this.formatMessage(LEVELS.INFO, message, ...args));
    }
  }

  warning(message: string, ...args: any[]): void {
    if (this.shouldLog(LEVELS.WARNING)) {
      console.warn(this.formatMessage(LEVELS.WARNING, message, ...args));
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog(LEVELS.ERROR)) {
      console.error(this.formatMessage(LEVELS.ERROR, message, ...args));
    }
  }

  setLogLevel(level: string): void {
    if (levels_array.includes(level.toUpperCase())) {
      this.logLevel = level.toUpperCase();
    } else {
      this.warning(`Invalid log level: ${level}. Using INFO instead.`);
      this.logLevel = LEVELS.INFO;
    }
  }

  getLogLevel(): string {
    return this.logLevel;
  }
}

const logger = new Logger();

export { logger };
