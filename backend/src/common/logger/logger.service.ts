import { Logger } from '@nestjs/common';

export class LoggerService {
  private static readonly logger = new Logger('AppLogger');

  private static colorize(text: string, color: string) {
    const colors = {
      reset: '\x1b[0m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      white: '\x1b[37m',
    };
    return `${colors[color] || colors.white}${text}${colors.reset}`;
  }

  static logCreate(message: string, data?: any) {
    console.log(this.colorize(`🆕 ${message}`, 'green'), data);
  }

  static logUpdate(message: string, data?: any) {
    console.log(this.colorize(`✏️ ${message}`, 'blue'), data);
  }

  static logDelete(message: string, data?: any) {
    console.log(this.colorize(`🗑️ ${message}`, 'yellow'), data);
  }

  static logGet(message: string, data?: any) {
    console.log(this.colorize(`📡 ${message}`, 'cyan'), data);
  }

  static logSuccess(message: string, data?: any) {
    console.log(this.colorize(`🎉 ${message}`, 'magenta'), data);
  }

  static logError(message: string, error?: any) {
    console.error(this.colorize(`❌ ${message}`, 'red'), error);
  }
}
