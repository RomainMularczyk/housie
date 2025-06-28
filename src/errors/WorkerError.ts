import { BaseError } from './Error.js';

type WorkerTypeError = 
  | 'Connection Error'
  | 'No Channel Error'
  | 'Job Processing Error';

class WorkerError extends BaseError<WorkerTypeError> {
  constructor(
    name: WorkerTypeError,
    message: string,
    error?: unknown,
    status?: number,
  ) {
    if (!message) {
      const message = `A ${name} occurred with the worker.`;
      super(name, message, error, status);
    } else {
      super(name, message, error, status);
    }
    this.status = 500;
  }
}

export { WorkerError };