/**
 * Retourne une vue JSON qui décrit une opération réalisée
 * avec succès sur l'API.
 *
 * @param {T} data - Objet de la base de données.
 *
 * @param {number} status - Code HTTP renvoyé par l'API.
 * @param {T} data - Contenu du body de la réponse HTTP.
 * @param {string | undefined} message - Message complémentaire.
 * @returns {Response} - Réponse HTTP contenant une Vue JSON décrivant
 * une opération réalisée avec succès.
 */
const success = <T>(status: number = 200, data: T, message?: string): Response => {
  if (message) {
    return new Response(
      JSON.stringify({
        status: 'success',
        message: message,
        data: data,
      }),
      { headers: { 'Content-Type': 'application/json' }, status: status },
    );
  } else {
    return new Response(
      JSON.stringify({
        status: 'success',
        data: data,
      }),
      { headers: { 'Content-Type': 'application/json' }, status: status },
    );
  }
};

export { success };
