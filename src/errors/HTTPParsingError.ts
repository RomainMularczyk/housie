import { BaseError } from './Error.js';

type HTTPError =
  | 'HTTP Parsing Error'
  | 'HTTP Missing Header Error'
  | 'HTTP Query Param Format Error';

/**
 * Type d'erreur levé lors de l'échec de parsing d'une requête HTTP.
 *
 * @param {JSONError} name - Le nom de l'erreur HTTP.
 * @param {string | undefined} message - Le message d'erreur custom de l'erreur HTTP.
 * @param {unknwon | undefined} error - Les détails de l'erreur initiale.
 */
class HTTPParsingError extends BaseError<HTTPError> {
  constructor(name: HTTPError, message?: string, error?: unknown) {
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

export { HTTPParsingError };
