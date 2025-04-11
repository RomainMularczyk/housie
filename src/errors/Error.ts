/**
 * Template standard d'erreur. Toutes les errors custom doivent
 * étendre cette classe pour simplifier la récupération exhaustive
 * des messages d'erreur.
 *
 * @property {Template extends string} name - Le nom de l'erreur pour
 * permettre une meilleure indexation dans les logs de l'application.
 * @property {string} message - Le message propre à l'erreur custom.
 * @property {unknown | undefined} error - L'erreur initialement levée. Permet de
 * récupérer le message d'erreur initial.
 * @property {string} details - Le détail de l'erreur, incluant le contenu
 * du message d'erreur initial.
 */
abstract class BaseError<T extends string> extends Error {
  // Properties
  name: T;
  error?: unknown;
  details: string;
  message: string;
  status?: number;

  constructor(name: T, message?: string, error?: unknown, status?: number) {
    if (!message) {
      const message = "An unknown error occurred.";
      super(message);
      this.message = message;
    } else {
      super(message);
      this.message = message;
    }
    if (error instanceof Error) {
      this.details = error.message;
      this.error = error;
    } else {
      this.details = "";
    }
    if (status) {
      this.status = status;
    }
    this.name = name;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public detailedError(): string {
    if (this.details) {
      return `${this.message}. Details: ${this.details}`;
    } else {
      return this.message;
    }
  }
}

export { BaseError };
