/**
 * Template de retour de l'API.
 */
interface JSONView<T> {
  status: 'success' | 'failure';
  message?: string;
  details?: any;
  data?: T | undefined;
}

export { JSONView };
