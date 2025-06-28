import { BaseError } from './Error.js';

type JSONError = 'JSON Parsing Error';

/**
 * Type d'erreur levé lors de l'échec de parsing d'un object JSON.
 * @param {JSONError} name - Le nom de l'erreur JSON.
 * @param {string | undefined} message - Le message d'erreur custom de l'erreur JSON.
 * @param {unknwon | undefined} error - Les détails de l'erreur initiale.
 */
class JSONParsingError extends BaseError<JSONError> {
  constructor(name: JSONError, message?: string, error?: unknown) {
    const status = 400;
    if (!message) {
      const message = 'An error occurred when parsing the JSON file.';
      super(name, message, error, status);
      this.message = message;
    } else {
      super(name, message, error, status);
      this.message = message;
    }
  }
}

export { JSONParsingError };
