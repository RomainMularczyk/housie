import { BaseError } from './Error.js';

type QueueTypeError =
  | 'Connection Error'
  | 'No Channel Error'

/**
 * Error type raised when an error occurs with the queue.
 *
 * @property {QueueTypeError} name - The name of the error.
 * @property {string | undefined} message - The message of the error.
 * @property {unknown | undefined} error - The error object.
 * @property {number | undefined} status - The status code of the error.
 */
class QueueError extends BaseError<QueueTypeError> {
  constructor(
    name: QueueTypeError,
    message: string,
    error?: unknown,
    status?: number,
  ) {
    if (!message) {
      const message = `A ${name} occurred with the queue.`;
      super(name, message, error, status);
    } else {
      super(name, message, error, status);
    }
    this.status = 500;
  }
}

export { QueueError };