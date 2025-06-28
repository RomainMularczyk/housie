import { BaseError } from './Error.js';

type ScrapingTypeError =
  | 'Timeout Error'
  | 'Active Prompt Error'
  | 'House Not Found Error'
  | 'Unknown Error';

/**
 * Error type raised when an error occurs with the web parser.
 *
 * @property {DatabaseTypeError} name - The scraper error name.
 * @property {string | undefined} message - The custom message of the scraper error.
 * @property {unknown | undefined} error - The details the initial error.
 * @property {number | undefind} status - The HTTP error code related to the error.
 */
class ScrapingError extends BaseError<ScrapingTypeError> {
  constructor(
    name: ScrapingTypeError,
    message?: string,
    error?: unknown,
    status?: number
  ) {
    if (!message) {
      const message = `A ${name} occurred when scraping the page.`;
      super(name, message, error, status);
    } else {
      super(name, message, error, status);
    }
    this.status = 500;
  }
}

export { ScrapingError };
