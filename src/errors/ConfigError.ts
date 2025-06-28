import { BaseError } from './Error.js';

type ConfigErrorType =
  | 'Missing Configuration Error'

/**
 * Error raised when something is wrong with the app configuration.
 *
 * @param {JSONError} name - The name of the error.
 * @param {string | undefined} message - The error custom message.
 * @param {unknwon | undefined} error - The initial error details.
 */
class ConfigError extends BaseError<ConfigErrorType> {
  constructor(name: ConfigErrorType, message?: string, error?: unknown) {
    const status = 400;
    if (!message) {
      const message = 'An error occurred when parsing the HTTP request.';
      super(name, message, error, status);
      this.message = message;
    } else {
      super(name, message, error, status);
      this.message = message;
    }
  }
}

export { ConfigError };
