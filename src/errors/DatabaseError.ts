import { BaseError } from './Error';

type DatabaseTypeError =
  | "Connection Error"
  | "No Result Error"
  | "Too Many Results Error"
  | "Data Format Error"
  | "Unknown Error"
  | "No Primary Key Error"
  | "Unique Constraint Error"
  | "Primary Key Constraint Error";

/**
 * Type d'erreur levé lorsque la base de données ne répond pas
 * de façon attendue.
 *
 * @property {DatabaseTypeError} name - Le nom de l'erreur de base de données.
 * @property {string | undefined} message - Le message d'erreur custom de l'erreur
 * de base de données.
 * @property {unknown | undefined} error - Les détails de l'erreur initiale.
 * @property {number | undefind} status - Le code HTTP d'erreur correspondant à
 * l'erreur.
 */
class DatabaseError extends BaseError<DatabaseTypeError> {
  constructor(name: DatabaseTypeError, message?: string, error?: unknown, status?: number) {
    if (!message) {
      const message = `A ${name} occurred with the database.`;
      super(name, message, error, status);
    } else {
      super(name, message, error, status);
    }
    this.status = 500;
  }
}

export { DatabaseError };
