type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success';

class Logger {
  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private log(level: LogLevel, message: string, meta?: unknown): void {
    const timestamp = this.formatTimestamp();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'error':
        console.error(`\x1b[31m${prefix}\x1b[0m ${message}`, meta !== undefined ? meta : '');
        break;
      case 'warn':
        console.warn(`\x1b[33m${prefix}\x1b[0m ${message}`, meta !== undefined ? meta : '');
        break;
      case 'success':
        console.log(`\x1b[32m${prefix}\x1b[0m ${message}`, meta !== undefined ? meta : '');
        break;
      case 'debug':
        if (process.env.NODE_ENV === 'development') {
          console.debug(`\x1b[36m${prefix}\x1b[0m ${message}`, meta !== undefined ? meta : '');
        }
        break;
      default:
        console.log(`\x1b[34m${prefix}\x1b[0m ${message}`, meta !== undefined ? meta : '');
        break;
    }
  }

  info(message: string, meta?: unknown): void {
    this.log('info', message, meta);
  }

  success(message: string, meta?: unknown): void {
    this.log('success', message, meta);
  }

  warn(message: string, meta?: unknown): void {
    this.log('warn', message, meta);
  }

  error(message: string, meta?: unknown): void {
    this.log('error', message, meta);
  }

  debug(message: string, meta?: unknown): void {
    this.log('debug', message, meta);
  }
}

export const logger = new Logger();
