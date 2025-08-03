import dotenv from 'dotenv';
dotenv.config();

enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

enum LogDomain {
  ROUTE = 'ROUTE',
  SCRAPER = 'SCRAPER',
  DATABASE = 'DATABASE',
  EMAIL = 'EMAIL',
  REPOSITORY = 'REPOSITORY',
  SERVICE = 'service',
  CLIENT = 'CLIENT',
  AUTH = 'AUTH',
  VALIDATION = 'VALIDATION',
  SYSTEM = 'SYSTEM',
  QUEUE = 'QUEUE',
  WORKER = 'WORKER',
  SSE = 'SSE',
}

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private logLevel: LogLevel;
  private colorize: boolean;

  constructor(logLevel: LogLevel = LogLevel.INFO, colorize: boolean = true) {
    this.logLevel = logLevel;
    this.colorize = colorize;
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private getColorCode(level: LogLevel): string {
    if (!this.colorize) return '';

    switch (level) {
      case LogLevel.ERROR:
        return '\x1b[31m'; // Red
      case LogLevel.WARN:
        return '\x1b[33m'; // Yellow
      case LogLevel.INFO:
        return '\x1b[36m'; // Cyan
      case LogLevel.DEBUG:
        return '\x1b[37m'; // White
      default:
        return '';
    }
  }

  private getResetCode(): string {
    return this.colorize ? '\x1b[0m' : '';
  }

  private getLevelName(level: LogLevel): string {
    switch (level) {
      case LogLevel.ERROR:
        return 'ERROR';
      case LogLevel.WARN:
        return 'WARN ';
      case LogLevel.INFO:
        return 'INFO ';
      case LogLevel.DEBUG:
        return 'DEBUG';
      default:
        return 'UNKNOWN';
    }
  }

  private formatMessage(
    level: LogLevel,
    domains: LogDomain[],
    message: string,
    context?: LogContext
  ): string {
    const timestamp = this.getTimestamp();
    const levelName = this.getLevelName(level);
    const colorCode = this.getColorCode(level);
    const resetCode = this.getResetCode();

    const domainTags = domains.map((domain) => `[${domain}]`).join('');

    let formattedMessage =
      `${colorCode}${timestamp} ` + `${levelName} ${domainTags} ${message}${resetCode}`;

    if (context && Object.keys(context).length > 0) {
      formattedMessage +=
        `\n${colorCode}Context: ` + `${JSON.stringify(context, null, 2)}${resetCode}`;
    }

    return formattedMessage;
  }

  private log(
    level: LogLevel,
    domains: LogDomain[],
    message: string,
    context?: LogContext
  ): void {
    if (level > this.logLevel) return;

    const formattedMessage = this.formatMessage(level, domains, message, context);

    if (level === LogLevel.ERROR) {
      console.error(formattedMessage);
    } else if (level === LogLevel.WARN) {
      console.warn(formattedMessage);
    } else {
      console.log(formattedMessage);
    }
  }

  error(domains: LogDomain[], message: string, context?: LogContext): void {
    this.log(LogLevel.ERROR, domains, message, context);
  }

  warn(domains: LogDomain[], message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, domains, message, context);
  }

  info(domains: LogDomain[], message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, domains, message, context);
  }

  debug(domains: LogDomain[], message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, domains, message, context);
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  setColorize(colorize: boolean): void {
    this.colorize = colorize;
  }
}

// Defaults
const logLevel = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : LogLevel.INFO;
const colorize = process.env.NO_COLOR !== '1';

export const logger = new Logger(logLevel, colorize);

logger.info([LogDomain.SYSTEM], 'Logger initialized', { logLevel });

export { Logger, LogDomain, LogLevel };
